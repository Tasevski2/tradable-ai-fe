"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { z } from "zod";
import { ToolCallStatusEnum } from "@/types/common";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { env } from "@/lib/env";
import type { ToolCallStatus, UserChoiceAction } from "@/types/api";
import {
  SSE_DATA_PREFIX,
  SSE_ACCEPT_HEADER,
  ABORT_ERROR_NAME,
} from "./constants";

// ── SSE event schemas ──────────────────────────────────────────────────────────

const userChoiceActionSchema = z.object({ value: z.string() });

const tokenEventSchema = z.object({
  type: z.literal("token"),
  delta: z.string(),
});

const toolEventSchema = z.object({
  type: z.literal("tool"),
  name: z.string(),
  status: z.nativeEnum(ToolCallStatusEnum),
});

const doneEventSchema = z.object({
  type: z.literal("done"),
  messageId: z.string(),
  draftUpdated: z.boolean(),
  actions: z.array(userChoiceActionSchema).optional(),
});

const errorEventSchema = z.object({
  type: z.literal("error"),
  message: z.string().optional(),
});

const reconnectedEventSchema = z.object({
  type: z.literal("reconnected"),
  bufferedContent: z.string(),
});

const pingEventSchema = z.object({ type: z.literal("ping") });

/**
 * Discriminated union covering every event type the chat SSE stream can emit.
 * Unknown event types are silently ignored.
 */
const chatSSEEventSchema = z.discriminatedUnion("type", [
  tokenEventSchema,
  toolEventSchema,
  doneEventSchema,
  errorEventSchema,
  reconnectedEventSchema,
  pingEventSchema,
]);

type ChatSSEEvent = z.infer<typeof chatSSEEventSchema>;

// ── Public API ─────────────────────────────────────────────────────────────────

interface DonePayload {
  messageId: string;
  draftUpdated: boolean;
  actions?: UserChoiceAction[];
}

interface UseChatStreamOptions {
  onDone: (payload: DonePayload) => void;
  onError?: (message: string) => void;
}

interface UseChatStreamReturn {
  isStreaming: boolean;
  streamingContent: string;
  activeTools: ToolCallStatus[];
  streamError: string | null;
  startStream: (afterMessageId: string) => Promise<void>;
  stopStream: () => void;
}

// ── SSE event dispatcher ───────────────────────────────────────────────────────

/**
 * Parse and dispatch a single raw SSE data payload.
 * Returns `false` when the stream should stop (done / error event), `true` to
 * continue reading.
 */
function handleSSEEvent(
  raw: string,
  callbacks: {
    onToken: (delta: string) => void;
    onTool: (name: string, status: ToolCallStatusEnum) => void;
    onDone: (payload: DonePayload) => void;
    onError: (message: string) => void;
    onReconnected: (bufferedContent: string) => void;
  },
): boolean {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    console.warn("[ChatStream] Failed to parse SSE event:", raw, err);
    return true;
  }

  const result = chatSSEEventSchema.safeParse(json);
  if (!result.success) {
    // Unknown or structurally invalid event — skip silently
    return true;
  }

  const event: ChatSSEEvent = result.data;

  switch (event.type) {
    case "token":
      callbacks.onToken(event.delta);
      return true;

    case "tool":
      callbacks.onTool(event.name, event.status);
      return true;

    case "done":
      callbacks.onDone({
        messageId: event.messageId,
        draftUpdated: event.draftUpdated,
        actions: event.actions as UserChoiceAction[] | undefined,
      });
      return false;

    case "error":
      callbacks.onError(event.message ?? "Stream error");
      return false;

    case "reconnected":
      callbacks.onReconnected(event.bufferedContent);
      return true;

    case "ping":
      return true;
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useChatStream(
  strategyId: string,
  options: UseChatStreamOptions,
): UseChatStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeTools, setActiveTools] = useState<ToolCallStatus[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  // Keep callbacks in refs so closures inside the async loop always see the
  // latest version without needing to be listed as effect dependencies.
  const onDoneRef = useRef(options.onDone);
  const onErrorRef = useRef(options.onError);
  onDoneRef.current = options.onDone;
  onErrorRef.current = options.onError;

  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  }, []);

  const startStream = useCallback(
    async (afterMessageId: string) => {
      // Cancel any in-flight stream before starting a new one
      abortControllerRef.current?.abort();

      setStreamingContent("");
      setActiveTools([]);
      setStreamError(null);
      setIsStreaming(true);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        const token = await apiClient.getAuthToken();
        const streamPath = API_ENDPOINTS.CHAT.STREAM(
          strategyId,
          afterMessageId,
        );
        const url = `${env.NEXT_PUBLIC_API_URL}${streamPath}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: SSE_ACCEPT_HEADER,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Stream request failed: ${response.status}`);
        }

        const body = response.body;
        if (!body) {
          throw new Error("Response body is null");
        }

        const reader = body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        const eventCallbacks = {
          onToken: (delta: string) => {
            setStreamingContent((prev) => prev + delta);
          },
          onTool: (name: string, status: ToolCallStatusEnum) => {
            setActiveTools((prev) => {
              const existing = prev.find((t) => t.name === name);
              if (existing) {
                return prev.map((t) =>
                  t.name === name ? { ...t, status } : t,
                );
              }
              return [...prev, { name, status }];
            });
          },
          onDone: (payload: DonePayload) => {
            abortControllerRef.current = null;
            setIsStreaming(false);
            onDoneRef.current(payload);
          },
          onReconnected: (bufferedContent: string) => {
            setStreamingContent(() => bufferedContent);
          },
          onError: (message: string) => {
            abortControllerRef.current = null;
            setIsStreaming(false);
            setStreamError(message);
            onErrorRef.current?.(message);
          },
        };

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Stream ended without a `done` event — treat as lost connection
            if (abortControllerRef.current) {
              abortControllerRef.current = null;
              setIsStreaming(false);
              setStreamError("Connection lost");
              onErrorRef.current?.("Connection lost");
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // SSE events are delimited by double newlines
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? ""; // keep the trailing incomplete chunk

          for (const event of events) {
            const dataLines = event
              .split("\n")
              .filter((line) => line.startsWith(SSE_DATA_PREFIX))
              .map((line) => line.slice(SSE_DATA_PREFIX.length).trim());

            if (dataLines.length === 0) continue;

            const shouldContinue = handleSSEEvent(
              dataLines.join("\n"),
              eventCallbacks,
            );
            if (!shouldContinue) {
              reader.cancel();
              return;
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === ABORT_ERROR_NAME) {
          return; // Expected when stopStream() is called — not an error
        }

        abortControllerRef.current = null;
        setIsStreaming(false);
        const message = err instanceof Error ? err.message : "Connection lost";
        setStreamError(message);
        onErrorRef.current?.(message);
      }
    },
    [strategyId],
  );

  // Abort the stream on unmount to avoid state updates on unmounted components
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
    };
  }, []);

  return {
    isStreaming,
    streamingContent,
    activeTools,
    streamError,
    startStream,
    stopStream,
  };
}
