"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";
import { env } from "@/lib/env";
import { SSEEventEnum } from "@/types/common";
import type { SSEUserEvent } from "@/types/api";
import {
  SSE_DATA_PREFIX,
  SSE_PING_EVENT,
  SSE_ACCEPT_HEADER,
  ABORT_ERROR_NAME,
  SSE_BASE_RECONNECT_DELAY_MS,
  SSE_MAX_RECONNECT_DELAY_MS,
} from "./constants";

interface UseEventsStreamOptions {
  enabled: boolean;
}

/**
 * SSE Events Stream Hook
 *
 * Maintains a persistent connection to /api/events/stream to receive
 * real-time events for positions and backtests. Automatically:
 * - Invalidates React Query queries based on event type
 * - Shows toast notifications to the user
 * - Reconnects on connection loss with exponential backoff
 */
export function useEventsStream({ enabled }: UseEventsStreamOptions): void {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const reconnectAttemptRef = useRef(0);
  const isConnectedRef = useRef(false);

  const handleEvent = useCallback(
    (event: SSEUserEvent) => {
      switch (event.type) {
        case SSEEventEnum.POSITION_OPENED: {
          queryClient.invalidateQueries({
            queryKey: queryKeys.account.summary(),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.positions.byStrategyPrefix(event.strategyId),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.strategies.activities(event.strategyId),
          });

          // Show toast
          toast.success(
            `Position opened: ${event.symbol} ${event.side} @ ${event.entryPrice}`,
            {
              description: event.strategyName,
            },
          );
          break;
        }

        case SSEEventEnum.POSITION_CLOSED: {
          queryClient.invalidateQueries({
            queryKey: queryKeys.account.summary(),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.positions.byStrategyPrefix(event.strategyId),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.strategies.activities(event.strategyId),
          });

          // Show toast
          toast.info(`Position closed: ${event.symbol}`, {
            description: event.strategyName,
          });
          break;
        }

        case SSEEventEnum.BACKTEST_COMPLETE: {
          // Invalidate backtest queries
          queryClient.invalidateQueries({
            queryKey: queryKeys.backtests.detail(
              event.strategyId,
              event.backtestId,
            ),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.backtests.byStrategyPrefix(event.strategyId),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.backtests.latest(event.strategyId),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.backtests.equityLatest(event.strategyId),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.strategies.activities(event.strategyId),
          });

          // Show toast based on status
          if (event.status === "completed") {
            toast.success(`Backtest completed`, {
              description: event.strategyName,
            });
          } else {
            toast.error(`Backtest failed`, {
              description: event.strategyName,
            });
          }
          break;
        }
      }
    },
    [queryClient],
  );

  const connect = useCallback(async () => {
    // Don't connect if already connected or not enabled
    if (isConnectedRef.current || !enabled) return;

    // Abort any existing connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    try {
      const token = await apiClient.getAuthToken();
      if (!token) {
        // No token yet, retry later
        scheduleReconnect();
        return;
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const url = `${env.NEXT_PUBLIC_API_URL}/api/events/stream`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: SSE_ACCEPT_HEADER,
          Authorization: `Bearer ${token}`,
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

      // Connected successfully, reset reconnect attempts
      isConnectedRef.current = true;
      reconnectAttemptRef.current = 0;

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Stream ended
          isConnectedRef.current = false;
          scheduleReconnect();
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
            .filter((line) => line.startsWith(SSE_DATA_PREFIX))
            .map((line) => line.slice(SSE_DATA_PREFIX.length).trim());

          if (dataLines.length === 0) continue;

          const raw = dataLines.join("\n");

          if (raw === "") continue;

          try {
            const data = JSON.parse(raw);
            // Skip ping keep-alive events
            if (data.type === SSE_PING_EVENT) continue;
            handleEvent(data as SSEUserEvent);
          } catch (err) {
            console.warn("[EventsStream] Failed to parse SSE event:", raw, err);
          }
        }
      }
    } catch (err) {
      // AbortError is expected when we abort the connection
      if (err instanceof DOMException && err.name === ABORT_ERROR_NAME) {
        return;
      }

      isConnectedRef.current = false;
      scheduleReconnect();
    }

    function scheduleReconnect() {
      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Don't reconnect if not enabled
      if (!enabled) return;

      // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
      const baseDelay = env.NEXT_PUBLIC_SSE_RECONNECT_DELAY ?? SSE_BASE_RECONNECT_DELAY_MS;
      const delay = Math.min(
        baseDelay * Math.pow(2, reconnectAttemptRef.current),
        SSE_MAX_RECONNECT_DELAY_MS,
      );
      reconnectAttemptRef.current++;

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectTimeoutRef.current = null;
        connect();
      }, delay);
    }
  }, [enabled, handleEvent]);

  // Connect when enabled, disconnect when disabled
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      // Disconnect
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      isConnectedRef.current = false;
      reconnectAttemptRef.current = 0;
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      isConnectedRef.current = false;
    };
  }, [enabled, connect]);
}
