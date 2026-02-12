"use client";

import { useEventsStream } from "@/lib/sse/useEventsStream";
import { useUserFromStore } from "@/stores/useAuthStore";

interface EventsStreamProviderProps {
  children: React.ReactNode;
}

/**
 * Events Stream Provider
 *
 * Maintains a persistent SSE connection to receive real-time events
 * for position updates and backtest completions.
 *
 * Only connects when the user is authenticated (user exists in store).
 */
export function EventsStreamProvider({ children }: EventsStreamProviderProps) {
  const user = useUserFromStore();

  // Only connect when authenticated
  useEventsStream({ enabled: !!user });

  return <>{children}</>;
}
