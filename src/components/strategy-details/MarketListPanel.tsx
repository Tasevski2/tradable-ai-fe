"use client";

import { Search } from "lucide-react";
import { MarketListItem } from "./MarketListItem";
import type { MarketWithStatus } from "@/types/api";

interface MarketListPanelProps {
  title: string;
  markets: MarketWithStatus[];
  checkedSymbols: Set<string>;
  searchValue: string;
  totalCount: number;
  emptyMessage: string;
  actionLabel: string;
  actionVariant: "primary" | "danger";
  isActionDisabled: boolean;
  onSearchChange: (value: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onToggleCheck: (symbol: string) => void;
  onAction: () => void;
  getBadge?: (
    market: MarketWithStatus,
  ) => { text: string; variant: "warn" } | null;
  isDisabled?: (market: MarketWithStatus) => boolean;
}

export function MarketListPanel({
  title,
  markets,
  checkedSymbols,
  searchValue,
  totalCount,
  emptyMessage,
  actionLabel,
  actionVariant,
  isActionDisabled,
  onSearchChange,
  onSelectAll,
  onClear,
  onToggleCheck,
  onAction,
  getBadge,
  isDisabled,
}: MarketListPanelProps) {
  return (
    <div className="border border-border/50 rounded-xl bg-background/40 p-3 flex flex-col min-h-[280px]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wide">
          {title}
        </h4>
        <div className="flex gap-1.5">
          <button
            onClick={onSelectAll}
            className="btn-secondary px-2 py-1 text-xs rounded-lg"
          >
            Select all
          </button>
          <button
            onClick={onClear}
            className="btn-secondary px-2 py-1 text-xs rounded-lg"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
          <input
            type="text"
            placeholder="Search markets..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <span className="badge text-xs">{totalCount}</span>
      </div>

      <div className="flex-1 border border-border/40 rounded-lg bg-background-overlay/20 p-2 overflow-auto min-h-[120px] max-h-[170px]">
        {markets.length === 0 ? (
          <div className="text-xs text-foreground-muted text-center py-4">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-1.5">
            {markets.map((market) => (
              <MarketListItem
                key={market.symbol}
                symbol={market.symbol}
                isChecked={checkedSymbols.has(market.symbol)}
                onClick={() => onToggleCheck(market.symbol)}
                disabled={isDisabled?.(market)}
                badge={getBadge?.(market)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-foreground-muted/70">
          Selected: {checkedSymbols.size}
        </span>
        <button
          onClick={onAction}
          disabled={isActionDisabled}
          className={`px-3 py-1.5 text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
            actionVariant === "primary" ? "btn-primary" : "btn-danger"
          }`}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
