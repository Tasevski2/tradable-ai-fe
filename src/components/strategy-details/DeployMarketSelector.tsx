"use client";

import { MarketListPanel } from "./MarketListPanel";
import type { MarketSelectionViewState } from "./useDeployMarketSelection";

interface DeployMarketSelectorProps {
  marketSelection: MarketSelectionViewState;
}

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
