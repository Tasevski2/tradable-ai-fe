"use client";

import type { UserChoiceAction } from "@/types/api";

interface ChatActionButtonsProps {
  actions: UserChoiceAction[];
  onActionClick: (value: string) => void;
  disabled?: boolean;
}

export function ChatActionButtons({
  actions,
  onActionClick,
  disabled = false,
}: ChatActionButtonsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mr-auto max-w-[92%]">
      {actions.map((action) => (
        <button
          key={action.value}
          type="button"
          onClick={() => onActionClick(action.value)}
          disabled={disabled}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-primary/30 bg-primary/8 text-primary-light hover:bg-primary/15 hover:border-primary/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {action.value}
        </button>
      ))}
    </div>
  );
}
