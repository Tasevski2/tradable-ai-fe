"use client";

import { useRef, useCallback, useEffect } from "react";
import { useChatMessages } from "@/lib/api/queries";
import { useSendChatMessage } from "@/lib/api/mutations";
import { useChatStream } from "@/lib/sse/useChatStream";
import { useChatScroll } from "@/hooks";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { Skeleton } from "@/components/ui/Skeleton";
import type {
  ChatMessage as ChatMessageType,
  ChatMessagesResponse,
  UserChoiceAction,
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
  const queryClient = useQueryClient();

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useChatMessages(strategyId);

  const sendMessage = useSendChatMessage();

  // Pages arrive [most recent, older, ...] — reverse so oldest appear at top
  const messages: ChatMessageType[] = data?.pages
    ? [...data.pages].reverse().flatMap((page) => page.data)
    : [];

  // Ref so the onDone closure always reads finalized content without going stale
  const streamingContentRef = useRef("");

  const {
    isStreaming,
    streamingContent,
    activeTools,
    streamError,
    startStream,
  } = useChatStream(strategyId, {
    onDone: (payload) => {
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
                  actions: payload.actions?.length ? payload.actions : null,
                },
              ],
            };
          }
          return { ...old, pages: newPages };
        },
      );

      if (payload.draftUpdated) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.strategies.detail(strategyId),
        });
      }
    },
  });

  streamingContentRef.current = streamingContent;

  // Resume streaming if the last persisted message is from the user (e.g. page reload)
  const hasResumedRef = useRef(false);
  const lastMessage = messages[messages.length - 1];
  const lastMessageId = lastMessage?.id;
  const lastMessageRole = lastMessage?.role;

  useEffect(() => {
    if (
      !isLoading &&
      !hasResumedRef.current &&
      !isStreaming &&
      lastMessageRole === "user" &&
      lastMessageId &&
      !lastMessageId.startsWith("temp-")
    ) {
      hasResumedRef.current = true;
      startStream(lastMessageId);
    }
  }, [isLoading, isStreaming, lastMessageId, lastMessageRole, startStream]);

  const { messagesEndRef, scrollContainerRef, loadMoreSentinelRef } =
    useChatScroll({
      messageCount: messages.length,
      streamingContent,
      isStreaming,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    });

  const handleSendMessage = useCallback(
    (content: string) => {
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
            newPages[0] = { ...firstPage, data: [...firstPage.data, userMessage] };
          }
          return { ...old, pages: newPages };
        },
      );

      sendMessage.mutate(
        { strategyId, message: content },
        {
          onSuccess: (response) => {
            queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
              queryKeys.chat.messages(strategyId),
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  pages: old.pages.map((page) => ({
                    ...page,
                    data: page.data.map((msg) =>
                      msg.id === tempId
                        ? { ...msg, id: response.messageId }
                        : msg,
                    ),
                  })),
                };
              },
            );

            startStream(response.messageId);
          },
          onError: () => {
            queryClient.setQueryData<InfiniteData<ChatMessagesResponse>>(
              queryKeys.chat.messages(strategyId),
              (old) => {
                if (!old) return old;
                return {
                  ...old,
                  pages: old.pages.map((page) => ({
                    ...page,
                    data: page.data.filter((msg) => msg.id !== tempId),
                  })),
                };
              },
            );
          },
        },
      );
    },
    [queryClient, strategyId, sendMessage, startStream],
  );

  const visibleActions: UserChoiceAction[] =
    !isStreaming &&
    lastMessage?.role === "assistant" &&
    Array.isArray(lastMessage.actions) &&
    lastMessage.actions.length > 0
      ? lastMessage.actions
      : [];

  const draftDiffers = draftVersion !== liveVersion;
  const isBusy = sendMessage.isPending || isStreaming;

  return (
    <div className="panel flex flex-col h-full min-h-0">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          {draftDiffers && (
            <span className="pill pill-warn">Draft differs</span>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3"
      >
        <ChatMessages
          isLoading={isLoading}
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          activeTools={activeTools}
          streamError={streamError}
          visibleActions={visibleActions}
          onActionClick={handleSendMessage}
          isBusy={isBusy}
          isFetchingNextPage={isFetchingNextPage}
          messagesEndRef={messagesEndRef}
          loadMoreSentinelRef={loadMoreSentinelRef}
        />
      </div>

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

export function ChatPanelSkeleton() {
  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <Skeleton className="h-4 w-20 bg-background-overlay" />
      </div>
      <div className="flex-1 p-3.5">
        <div className="mr-auto max-w-[80%]">
          <Skeleton className="h-20 w-64 rounded-2xl bg-background-overlay" />
        </div>
      </div>
      <div className="p-3 border-t border-border">
        <Skeleton className="h-11 w-full rounded-xl bg-background-overlay" />
      </div>
    </div>
  );
}
