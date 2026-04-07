"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MarketListItemProps {
  symbol: string;
  isChecked: boolean;
  onClick: () => void;
  disabled?: boolean;
  badge?: {
    text: string;
    variant: "warn" | "info";
  } | null;
}

export function MarketListItem({
  symbol,
  isChecked,
  onClick,
  disabled = false,
  badge = null,
}: MarketListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-between gap-2.5 px-2.5 py-2 min-h-9 rounded-lg border border-border/40 bg-background-overlay/30 text-xs font-semibold transition-colors",
        disabled
          ? "text-foreground-muted/50 cursor-not-allowed"
          : "text-foreground-muted hover:bg-background-overlay/60",
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "w-4 h-4 rounded border flex items-center justify-center shrink-0",
            disabled
              ? "border-border/50 bg-background-overlay/30"
              : isChecked
                ? "bg-primary border-primary"
                : "border-border bg-background-overlay/50",
          )}
        >
          {!disabled && isChecked && (
            <Check size={10} className="text-white" />
          )}
        </div>
        <span>{symbol}</span>
      </div>

      {/* Badge or invisible placeholder for consistent height */}
      {badge ? (
        <span
          className={cn(
            "pill text-[10px] px-2 py-0.5",
            badge.variant === "warn" ? "pill-warn" : "pill-info",
          )}
        >
          {badge.text}
        </span>
      ) : (
        <span className="invisible pill text-[10px] px-2 py-0.5">-</span>
      )}
    </button>
  );
}
