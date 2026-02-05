"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { env } from "@/lib/env";
import type { ToolCallStatus } from "@/types/api";

interface ChatSSEEvent {
  type: "token" | "tool" | "done" | "error" | "ping";
  [key: string]: unknown;
}

interface DonePayload {
  messageId: string;
  draftUpdated: boolean;
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

/**
 * Process a single SSE event data string.
 * Returns false if the stream should stop (done/error), true to continue.
 */
function handleSSEEvent(
  raw: string,
  callbacks: {
    onToken: (delta: string) => void;
    onTool: (name: string, status: "calling" | "completed") => void;
    onDone: (payload: DonePayload) => void;
    onError: (message: string) => void;
  },
): boolean {
  let data: ChatSSEEvent;
  try {
    data = JSON.parse(raw) as ChatSSEEvent;
  } catch {
    return true;
  }

  switch (data.type) {
    case "token": {
      callbacks.onToken(data.delta as string);
      return true;
    }

    case "tool": {
      callbacks.onTool(
        data.name as string,
        data.status as "calling" | "completed",
      );
      return true;
    }

    case "done": {
      callbacks.onDone({
        messageId: data.messageId as string,
        draftUpdated: data.draftUpdated as boolean,
      });
      return false;
    }

    case "error": {
      callbacks.onError((data.message as string) || "Stream error");
      return false;
    }

    case "ping":
      return true;

    default:
      return true;
  }
}

export function useChatStream(
  strategyId: string,
  options: UseChatStreamOptions,
): UseChatStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [activeTools, setActiveTools] = useState<ToolCallStatus[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const onDoneRef = useRef(options.onDone);
  const onErrorRef = useRef(options.onError);

  // Keep callback refs up to date
  onDoneRef.current = options.onDone;
  onErrorRef.current = options.onError;

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const startStream = useCallback(
    async (afterMessageId: string) => {
      // Abort any existing connection
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Reset state
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
            Accept: "text/event-stream",
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
          onTool: (name: string, status: "calling" | "completed") => {
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
          onError: (message: string) => {
            abortControllerRef.current = null;
            setIsStreaming(false);
            setStreamError(message);
            onErrorRef.current?.(message);
          },
        };

        // Read the stream
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Stream ended without a done event — treat as connection lost
            if (abortControllerRef.current) {
              abortControllerRef.current = null;
              setIsStreaming(false);
              setStreamError("Connection lost");
              onErrorRef.current?.("Connection lost");
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by double newlines
          const events = buffer.split("\n\n");
          // Keep the last chunk (may be incomplete)
          buffer = events.pop() ?? "";

          for (const event of events) {
            // Extract the data: line(s) from the SSE event
            const dataLines = event
              .split("\n")
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim());

            if (dataLines.length === 0) continue;

            const raw = dataLines.join("\n");
            const shouldContinue = handleSSEEvent(raw, eventCallbacks);
            if (!shouldContinue) {
              // done or error — abort the reader
              reader.cancel();
              return;
            }
          }
        }
      } catch (err) {
        // AbortError is expected when stopStream() is called
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        abortControllerRef.current = null;
        setIsStreaming(false);
        const message =
          err instanceof Error ? err.message : "Connection lost";
        setStreamError(message);
        onErrorRef.current?.(message);
      }
    },
    [strategyId],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
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
