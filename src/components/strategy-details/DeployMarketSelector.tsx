"use client";

import { Search } from "lucide-react";
import { MarketListItem } from "./MarketListItem";
import type { MarketSelectionViewState } from "./useDeployMarketSelection";
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
  /** When provided, renders a warning badge on a market item. */
  getBadge?: (
    market: MarketWithStatus,
  ) => { text: string; variant: "warn" } | null;
  /** When provided, marks a market item as non-interactive. */
  isDisabled?: (market: MarketWithStatus) => boolean;
}

/**
 * A single column of the dual-list market selector (either "Available" or
 * "Selected"). Renders a search input, a scrollable list of market items with
 * checkbox selection, and a bulk-action button at the bottom.
 */
function MarketListPanel({
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
      {/* Header */}
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

      {/* Search */}
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

      {/* List */}
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

      {/* Footer action */}
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

// ── Public component ───────────────────────────────────────────────────────────

interface DeployMarketSelectorProps {
  marketSelection: MarketSelectionViewState;
}

/**
 * Dual-list market selector used in the Deploy modal.
 * Renders "Available Markets" on the left and "Selected Markets" on the right
 * with search, bulk-select, and transfer actions.
 */
export function DeployMarketSelector({ marketSelection }: DeployMarketSelectorProps) {
  const {
    availableMarkets,
    selectedMarkets,
    availableChecked,
    selectedChecked,
    totalAvailable,
    totalSelected,
    availableSearch,
    selectedSearch,
    debouncedAvailableSearch,
    debouncedSelectedSearch,
    setAvailableSearch,
    setSelectedSearch,
    handleSelectAllAvailable,
    handleClearAvailable,
    handleSelectAllSelected,
    handleClearSelected,
    handleToggleAvailableCheck,
    handleToggleSelectedCheck,
    handleAddSelected,
    handleRemoveSelected,
  } = marketSelection;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <MarketListPanel
        title="Available Markets"
        markets={availableMarkets}
        checkedSymbols={availableChecked}
        searchValue={availableSearch}
        totalCount={totalAvailable}
        emptyMessage={
          debouncedAvailableSearch ? "No markets found" : "No available markets"
        }
        actionLabel="Add selected →"
        actionVariant="primary"
        isActionDisabled={availableChecked.size === 0}
        onSearchChange={setAvailableSearch}
        onSelectAll={handleSelectAllAvailable}
        onClear={handleClearAvailable}
        onToggleCheck={handleToggleAvailableCheck}
        onAction={handleAddSelected}
      />

      <MarketListPanel
        title="Selected Markets"
        markets={selectedMarkets}
        checkedSymbols={selectedChecked}
        searchValue={selectedSearch}
        totalCount={totalSelected}
        emptyMessage={
          debouncedSelectedSearch ? "No markets found" : "No selected markets"
        }
        actionLabel="← Remove selected"
        actionVariant="danger"
        isActionDisabled={selectedChecked.size === 0}
        onSearchChange={setSelectedSearch}
        onSelectAll={handleSelectAllSelected}
        onClear={handleClearSelected}
        onToggleCheck={handleToggleSelectedCheck}
        onAction={handleRemoveSelected}
        isDisabled={(m) => m.hasOpenPosition}
        getBadge={(m) =>
          m.hasOpenPosition ? { text: "allocated", variant: "warn" } : null
        }
      />
    </div>
  );
}
