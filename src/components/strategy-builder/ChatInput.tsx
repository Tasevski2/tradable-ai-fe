"use client";

import { useState, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useAutoResizeTextarea } from "@/hooks";

const MAX_TEXTAREA_HEIGHT_PX = 160;

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSubmit,
  isLoading = false,
  placeholder = "Message TradableAI...",
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useAutoResizeTextarea(message, MAX_TEXTAREA_HEIGHT_PX);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading || disabled) return;

    onSubmit(trimmedMessage);
    setMessage("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-y-1.5 py-2 border border-border/10 bg-black/25 rounded-xl">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading || disabled}
        rows={1}
        className="w-full min-h-11 max-h-40 pt-2.5 px-3 text-[13px] font-semibold text-foreground placeholder:text-foreground-muted resize-none focus:outline-none transition-colors disabled:opacity-50"
      />
      <button
        onClick={handleSubmit}
        disabled={!message.trim() || isLoading || disabled}
        className="w-fit self-end p-2 mr-2 rounded-lg btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        {isLoading ? (
          <Spinner size="sm" className="border-background" />
        ) : (
          <Send size={18} />
        )}
      </button>
    </div>
  );
}
