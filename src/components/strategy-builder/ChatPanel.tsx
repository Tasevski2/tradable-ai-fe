"use client";

import { useRef, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useChatMessages } from "@/lib/api/queries";
import { useSendChatMessage } from "@/lib/api/mutations";
import { useChatStream } from "@/lib/sse/useChatStream";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Skeleton } from "@/components/ui/Skeleton";
import type {
  ChatMessage as ChatMessageType,
  ChatMessagesResponse,
} from "@/types/api";

interface ChatPanelProps {
  strategyId: string;
  draftVersion: number;
  liveVersion: number;
}

export function ChatPanel({
  strategyId,
  draftVersion,
  liveVersion,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // ── Data hooks ──────────────────────────────────────────────
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useChatMessages(strategyId);

  const sendMessage = useSendChatMessage();

  // Flatten pages: pages are [most recent, older, ...], each page sorted oldest→newest
  // Reverse page order so oldest messages are first (top of chat)
  const messages: ChatMessageType[] = data?.pages
    ? [...data.pages].reverse().flatMap((page) => page.data)
    : [];

  // ── Streaming ───────────────────────────────────────────────
  // streamingContentRef is needed so the onDone callback always reads the latest value
  const streamingContentRef = useRef("");

  const {
    isStreaming,
    streamingContent,
    activeTools,
    streamError,
    startStream,
  } = useChatStream(strategyId, {
    onDone: (payload) => {
      // Add finalized assistant message to the query cache
      queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
        queryKeys.chat.messages(strategyId),
        (old) => {
          if (!old) return old;
          const newPages = [...old.pages];
          const firstPage = newPages[0];
          if (firstPage) {
            newPages[0] = {
              ...firstPage,
              data: [
                ...firstPage.data,
                {
                  id: payload.messageId,
                  role: "assistant" as const,
                  content: streamingContentRef.current,
                  createdAt: new Date().toISOString(),
                },
              ],
            };
          }
          return { ...old, pages: newPages };
        },
      );

      // Refetch strategy if the draft was updated
      if (payload.draftUpdated) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.strategies.detail(strategyId),
        });
      }
    },
  });

  // Keep ref in sync with latest streaming content
  streamingContentRef.current = streamingContent;

  // ── Auto-resume if last message is from user ──────────────
  const hasResumedRef = useRef(false);

  useEffect(() => {
    if (isLoading || hasResumedRef.current || isStreaming) return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user" && !lastMessage.id.startsWith("temp-")) {
      hasResumedRef.current = true;
      startStream(lastMessage.id);
    }
  }, [isLoading, messages, isStreaming, startStream]);

  // ── Send flow ───────────────────────────────────────────────
  const handleSendMessage = useCallback(
    (content: string) => {
      // Optimistically add user message to the cache
      const tempId = `temp-${Date.now()}`;
      const userMessage: ChatMessageType = {
        id: tempId,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
        queryKeys.chat.messages(strategyId),
        (old) => {
          if (!old) {
            return {
              pages: [{ data: [userMessage], nextCursor: null }],
              pageParams: [undefined],
            };
          }
          const newPages = [...old.pages];
          const firstPage = newPages[0];
          if (firstPage) {
            newPages[0] = {
              ...firstPage,
              data: [...firstPage.data, userMessage],
            };
          }
          return { ...old, pages: newPages };
        },
      );

      // POST to backend
      sendMessage.mutate(
        { strategyId, message: content },
        {
          onSuccess: (response) => {
            // Replace temp id with real one
            queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
              queryKeys.chat.messages(strategyId),
              (old) => {
                if (!old) return old;
                const newPages = old.pages.map((page) => ({
                  ...page,
                  data: page.data.map((msg) =>
                    msg.id === tempId
                      ? { ...msg, id: response.messageId }
                      : msg,
                  ),
                }));
                return { ...old, pages: newPages };
              },
            );

            // Start SSE stream for assistant response
            startStream(response.messageId);
          },
          onError: () => {
            // Remove optimistic message on error
            queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
              queryKeys.chat.messages(strategyId),
              (old) => {
                if (!old) return old;
                const newPages = old.pages.map((page) => ({
                  ...page,
                  data: page.data.filter((msg) => msg.id !== tempId),
                }));
                return { ...old, pages: newPages };
              },
            );
          },
        },
      );
    },
    [queryClient, strategyId, sendMessage, startStream],
  );

  // ── Scroll behaviour ───────────────────────────────────────
  // Auto-scroll to bottom on new messages and during streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamingContent]);

  // Infinite scroll: observe sentinel at top of messages
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          // Save scroll position before loading older messages
          const container = scrollContainerRef.current;
          const prevScrollHeight = container?.scrollHeight ?? 0;

          fetchNextPage().then(() => {
            // Restore scroll position so it doesn't jump
            requestAnimationFrame(() => {
              if (container) {
                const newScrollHeight = container.scrollHeight;
                container.scrollTop += newScrollHeight - prevScrollHeight;
              }
            });
          });
        }
      },
      { root: scrollContainerRef.current, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const draftDiffers = draftVersion !== liveVersion;
  const isBusy = sendMessage.isPending || isStreaming;

  return (
    <div className="panel flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          {draftDiffers && (
            <span className="pill pill-warn">Draft differs</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3"
      >
        {isLoading ? (
          <ChatPanelMessagesSkeleton />
        ) : messages.length === 0 && !isStreaming ? (
          <div className="flex-1 flex items-center justify-center text-foreground-muted text-sm">
            Start a conversation to build your strategy
          </div>
        ) : (
          <>
            {/* Sentinel for infinite scroll (load older messages) */}
            <div ref={loadMoreSentinelRef} className="h-1 shrink-0" />
            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <Loader2
                  size={16}
                  className="animate-spin text-foreground-muted"
                />
              </div>
            )}

            {/* Cached messages */}
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                createdAt={msg.createdAt}
              />
            ))}

            {/* Streaming assistant message */}
            {isStreaming && (
              <ChatMessage
                role="assistant"
                content={streamingContent}
                isStreaming
                activeTools={activeTools}
              />
            )}

            {/* Stream error */}
            {streamError && (
              <div className="text-xs text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-3 py-2">
                {streamError}
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-2">
        <ChatInput
          onSubmit={handleSendMessage}
          isLoading={isBusy}
          disabled={isBusy}
        />
      </div>
    </div>
  );
}

function ChatPanelMessagesSkeleton() {
  return (
    <>
      <div className="mr-auto max-w-[80%]">
        <Skeleton className="h-20 w-64 rounded-2xl bg-background-overlay" />
      </div>
      <div className="ml-auto max-w-[80%]">
        <Skeleton className="h-14 w-48 rounded-2xl bg-background-overlay" />
      </div>
      <div className="mr-auto max-w-[80%]">
        <Skeleton className="h-24 w-72 rounded-2xl bg-background-overlay" />
      </div>
    </>
  );
}

export function ChatPanelSkeleton() {
  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <Skeleton className="h-4 w-20 bg-background-overlay" />
      </div>
      <div className="flex-1 p-3.5">
        <ChatPanelMessagesSkeleton />
      </div>
      <div className="p-3 border-t border-border">
        <Skeleton className="h-11 w-full rounded-xl bg-background-overlay" />
      </div>
    </div>
  );
}
