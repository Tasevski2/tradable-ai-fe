"use client";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { ChatMessage } from "./ChatMessage";
import { ChatActionButtons } from "./ChatActionButtons";
import type { ChatMessage as ChatMessageType, UserChoiceAction } from "@/types/api";
import type { ToolCallStatus } from "@/types/api";

interface ChatMessagesProps {
  isLoading: boolean;
  messages: ChatMessageType[];
  isStreaming: boolean;
  streamingContent: string;
  activeTools: ToolCallStatus[];
  streamError: string | null;
  visibleActions: UserChoiceAction[];
  onActionClick: (content: string) => void;
  isBusy: boolean;
  isFetchingNextPage: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  loadMoreSentinelRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  isLoading,
  messages,
  isStreaming,
  streamingContent,
  activeTools,
  streamError,
  visibleActions,
  onActionClick,
  isBusy,
  isFetchingNextPage,
  messagesEndRef,
  loadMoreSentinelRef,
}: ChatMessagesProps) {
  if (isLoading) {
    return <ChatMessagesSkeleton />;
  }

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex-1 flex items-center justify-center text-foreground-muted text-sm">
        Start a conversation to build your strategy
      </div>
    );
  }

  return (
    <>
      {/* Sentinel for infinite scroll (loads older messages on intersect) */}
      <div ref={loadMoreSentinelRef} className="h-1 shrink-0" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Loader2 size={16} className="animate-spin text-foreground-muted" />
        </div>
      )}

      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          role={msg.role}
          content={msg.content}
          createdAt={msg.createdAt}
        />
      ))}

      {isStreaming && (
        <ChatMessage
          role="assistant"
          content={streamingContent}
          isStreaming
          activeTools={activeTools}
        />
      )}

      {visibleActions.length > 0 && (
        <ChatActionButtons
          actions={visibleActions}
          onActionClick={onActionClick}
          disabled={isBusy}
        />
      )}

      {streamError && (
        <div className="text-xs text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-3 py-2">
          {streamError}
        </div>
      )}

      <div ref={messagesEndRef} />
    </>
  );
}

function ChatMessagesSkeleton() {
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
