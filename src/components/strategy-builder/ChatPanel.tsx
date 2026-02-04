"use client";

import { useRef, useEffect, useState } from "react";
import { Undo2, Trash2 } from "lucide-react";
import { useChatMessages } from "@/lib/api/queries";
import { usePostChatMessage } from "@/lib/api/mutations";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ChatMessage as ChatMessageType } from "@/types/api";

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
  const queryClient = useQueryClient();

  const { data: chatData, isLoading } = useChatMessages(strategyId);
  const postMessage = usePostChatMessage();

  const [localMessages, setLocalMessages] = useState<ChatMessageType[]>([]);

  // Sync local messages with fetched data
  useEffect(() => {
    if (chatData?.data) {
      setLocalMessages(chatData.data);
    }
  }, [chatData]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const draftDiffers = draftVersion !== liveVersion;

  const handleSendMessage = (content: string) => {
    // Optimistically add user message
    const userMessage: ChatMessageType = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, userMessage]);

    // Send to backend
    postMessage.mutate(
      { strategyId, message: content },
      {
        onSuccess: () => {
          // Invalidate to refetch messages (will include AI response)
          queryClient.invalidateQueries({
            queryKey: queryKeys.chat.messages(strategyId),
          });
          // Also invalidate strategy to get updated config
          queryClient.invalidateQueries({
            queryKey: queryKeys.strategies.detail(strategyId),
          });
        },
        onError: () => {
          // Remove optimistic message on error
          setLocalMessages((prev) =>
            prev.filter((msg) => msg.id !== userMessage.id),
          );
        },
      },
    );
  };

  return (
    <div className="panel flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="panel-header">
        <h2>AI Chat</h2>
        <div className="flex items-center gap-2">
          {draftDiffers && (
            <span className="pill pill-warn">Draft differs</span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 flex flex-col gap-3">
        {isLoading ? (
          <ChatPanelMessagesSkeleton />
        ) : localMessages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-foreground-muted text-sm">
            Start a conversation to build your strategy
          </div>
        ) : (
          <>
            {localMessages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                createdAt={msg.createdAt}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="p-2">
        <ChatInput
          onSubmit={handleSendMessage}
          isLoading={postMessage.isPending}
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
