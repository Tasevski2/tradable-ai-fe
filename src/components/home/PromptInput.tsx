"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { useCreateStrategyWithPrompt } from "@/lib/api/mutations";
import { Spinner } from "@/components/ui/Spinner";
import { getErrorMessage } from "@/lib/utils/errors";

const MAX_HEIGHT = 360;

export function PromptInput() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");

  const createStrategyMutation = useCreateStrategyWithPrompt();

  const isLoading = createStrategyMutation.isPending;
  const error = createStrategyMutation.error;
  const errorMessage = error ? getErrorMessage(error, "") : null;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;

      if (scrollHeight > MAX_HEIGHT) {
        textareaRef.current.style.height = `${MAX_HEIGHT}px`;
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.height = `${scrollHeight}px`;
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [prompt]);

  const handleSubmit = () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || isLoading) return;

    createStrategyMutation.reset();

    createStrategyMutation.mutate(
      { message: trimmedPrompt },
      {
        onSuccess: (result) => {
          router.push(`/strategies/${result.id}`);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-y-2 pb-2 bg-background-elevated border border-border rounded-xl">
        <textarea
          ref={textareaRef}
          autoFocus
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your trading strategy..."
          disabled={isLoading}
          rows={1}
          className="w-full min-h-14 pt-4 px-5 text-foreground placeholder:text-foreground-muted focus:outline-none  transition-all resize-none disabled:opacity-50"
        />

        <button
          onClick={handleSubmit}
          disabled={!prompt.trim() || isLoading}
          className="w-fit self-end p-2 mr-2 rounded-lg btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Create strategy"
        >
          {isLoading ? (
            <Spinner size="md" className="border-background" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="mt-3 text-sm text-white bg-bearish/70 border border-bearish/20 rounded-lg px-4 py-2">
          {errorMessage}
        </div>
      )}

      <p className="mt-3 text-sm text-foreground text-center">
        Press{" "}
        <kbd className="px-1.5 py-0.5 bg-background-elevated border border-border rounded text-xs">
          Enter
        </kbd>{" "}
        to create or{" "}
        <kbd className="px-1.5 py-0.5 bg-background-elevated border border-border rounded text-xs">
          Shift + Enter
        </kbd>{" "}
        for new line
      </p>
    </div>
  );
}
