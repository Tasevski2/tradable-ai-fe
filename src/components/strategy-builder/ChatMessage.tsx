"use client";

import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/format";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { Loader2 } from "lucide-react";
import type { ChatMessageRole, ToolCallStatus } from "@/types/api";

interface ChatMessageProps {
  role: ChatMessageRole;
  content: string;
  createdAt?: string;
  isStreaming?: boolean;
  activeTools?: ToolCallStatus[];
}

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  get_current_draft_config: "Reading current config",
  get_strategy_builder_spec: "Checking strategy spec",
  validate_strategy_config: "Validating config",
  apply_strategy_draft_patch: "Updating strategy config",
};

export function ChatMessage({
  role,
  content,
  createdAt,
  isStreaming,
  activeTools,
}: ChatMessageProps) {
  const isUser = role === "user";
  const callingTools = activeTools?.filter((t) => t.status === "calling") ?? [];

  return (
    <div
      className={cn(
        "max-w-[92%] rounded-2xl px-3 py-2.5 border",
        isUser
          ? "ml-auto border-secondary/25 bg-secondary/8"
          : "mr-auto border-primary/25 bg-primary/10",
      )}
    >
      <div className="flex items-center justify-between gap-2.5 mb-1.5 text-xs text-foreground-subtle font-bold">
        <span>{isUser ? "You" : "Assistant"}</span>
        {createdAt && <span>{formatTime(createdAt)}</span>}
      </div>

      {/* Tool call indicators */}
      {callingTools.length > 0 && (
        <div className="flex flex-col gap-1 mb-2">
          {callingTools.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-1.5 text-xs text-foreground-muted"
            >
              <Loader2 size={12} className="animate-spin" />
              <span>{TOOL_DISPLAY_NAMES[tool.name] ?? "Thinking"}...</span>
            </div>
          ))}
        </div>
      )}

      {/* Message content */}
      {isStreaming && !content ? (
        <div className="flex items-center gap-1.5 text-[13px] text-foreground-muted">
          <span className="animate-pulse">Thinking</span>
          <span className="animate-bounce [animation-delay:0ms]">.</span>
          <span className="animate-bounce [animation-delay:150ms]">.</span>
          <span className="animate-bounce [animation-delay:300ms]">.</span>
        </div>
      ) : (
        <div>
          <MarkdownContent content={content} />
          {isStreaming && (
            <span className="inline-block w-[2px] h-[14px] ml-0.5 bg-foreground/70 animate-pulse align-middle" />
          )}
        </div>
      )}
    </div>
  );
}
