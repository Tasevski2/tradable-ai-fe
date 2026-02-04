"use client";

import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/format";
import type { ChatMessageRole } from "@/types/api";

interface ChatMessageProps {
  role: ChatMessageRole;
  content: string;
  createdAt?: string;
}

export function ChatMessage({ role, content, createdAt }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "max-w-[92%] rounded-2xl px-3 py-2.5 border",
        isUser
          ? "ml-auto border-secondary/25 bg-secondary/8"
          : "mr-auto border-primary/25 bg-primary/10"
      )}
    >
      <div className="flex items-center justify-between gap-2.5 mb-1.5 text-xs text-foreground-subtle font-bold">
        <span>{isUser ? "You" : "Assistant"}</span>
        {createdAt && <span>{formatTime(createdAt)}</span>}
      </div>
      <div className="text-[13px] text-foreground/92 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
