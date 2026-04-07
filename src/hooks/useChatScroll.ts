import { useEffect, useRef } from "react";

interface UseChatScrollOptions {
  /** Number of persisted messages — triggers bottom-scroll when it increases. */
  messageCount: number;
  /** Current streaming token content — triggers instant scroll while streaming. */
  streamingContent: string;
  isStreaming: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<unknown>;
}

interface UseChatScrollReturn {
  /** Attach to the scrollable message container. */
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  /** Attach to an empty div at the bottom of the message list. */
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  /** Attach to the top-of-list sentinel that triggers pagination. */
  loadMoreSentinelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Manages scroll behavior for an infinite-scroll chat panel.
 *
 * - Scrolls to the bottom on initial load and whenever new messages arrive.
 * - Uses instant scroll during active streaming to prevent jitter from rapid
 *   token updates; smooth scroll for discrete events (send, stream end).
 * - Observes a sentinel at the top of the list to trigger `fetchNextPage`
 *   and restores scroll position so older messages don't cause a jump.
 */
export function useChatScroll({
  messageCount,
  streamingContent,
  isStreaming,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseChatScrollOptions): UseChatScrollReturn {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  // Tracks whether we've completed the initial scroll-to-bottom jump
  const hasInitialScrollRef = useRef(false);

  // ── Auto-scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    if (!hasInitialScrollRef.current && messageCount > 0) {
      // Jump to bottom instantly on first render to avoid visible scroll animation
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      hasInitialScrollRef.current = true;
      return;
    }
    // Instant during active streaming to suppress bounce from rapid token updates;
    // smooth for all other events (new message sent, stream completed).
    const behavior = isStreaming && streamingContent ? "instant" : "smooth";
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, [messageCount, streamingContent, isStreaming]);

  // ── Infinite scroll sentinel ───────────────────────────────────────────────
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry?.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          // Don't trigger before the initial scroll-to-bottom has run — otherwise
          // the upward mount scroll would immediately fire a page load.
          hasInitialScrollRef.current
        ) {
          const container = scrollContainerRef.current;
          const prevScrollHeight = container?.scrollHeight ?? 0;

          fetchNextPage()
            .then(() => {
              // Restore scroll position after React has rendered the new messages
              requestAnimationFrame(() => {
                if (container) {
                  container.scrollTop +=
                    container.scrollHeight - prevScrollHeight;
                }
              });
            })
            .catch((err: unknown) => {
              console.error("[ChatScroll] Failed to fetch next page:", err);
            });
        }
      },
      { root: scrollContainerRef.current, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { messagesEndRef, scrollContainerRef, loadMoreSentinelRef };
}
