export const SSE_DATA_PREFIX = "data:" as const;
export const SSE_PING_EVENT = "ping" as const;
export const SSE_ACCEPT_HEADER = "text/event-stream" as const;
export const ABORT_ERROR_NAME = "AbortError" as const;
export const SSE_BASE_RECONNECT_DELAY_MS = 1_000 as const;
export const SSE_MAX_RECONNECT_DELAY_MS = 30_000 as const;
