"use client";

import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks";
import type { MarketWithStatus } from "@/types/api";

const SEARCH_DEBOUNCE_MS = 200;

/**
 * The subset of `useDeployMarketSelection` return values that are needed by
 * the UI layer. Excludes internal state (`localMarkets`, `setLocalMarkets`,
 * `currentMarkets`, `resetSelection`) that only `useDeployModal` needs.
 */
// eslint-disable-next-line @typescript-eslint/no-use-before-define
export type MarketSelectionViewState = Omit<
  ReturnType<typeof useDeployMarketSelection>,
  "localMarkets" | "setLocalMarkets" | "currentMarkets" | "resetSelection"
>;

/**
 * Encapsulates all local state and handlers for the dual-list market selector
 * inside the Deploy Strategy modal. Keeps `useDeployModal` focused on form
 * validation, server data, and the submit flow.
 */
export function useDeployMarketSelection() {
  const [localMarkets, setLocalMarkets] = useState<MarketWithStatus[]>([]);
  const [availableChecked, setAvailableChecked] = useState<Set<string>>(
    new Set(),
  );
  const [selectedChecked, setSelectedChecked] = useState<Set<string>>(
    new Set(),
  );
  const [availableSearch, setAvailableSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");

  const debouncedAvailableSearch = useDebounce(availableSearch, SEARCH_DEBOUNCE_MS);
  const debouncedSelectedSearch = useDebounce(selectedSearch, SEARCH_DEBOUNCE_MS);

  // ── Filtered lists ─────────────────────────────────────────────────────────

  const availableMarkets = useMemo(() => {
    const unselected = localMarkets.filter((m) => !m.isSelected);
    if (!debouncedAvailableSearch) return unselected;
    const q = debouncedAvailableSearch.toLowerCase();
    return unselected.filter((m) => m.symbol.toLowerCase().includes(q));
  }, [localMarkets, debouncedAvailableSearch]);

  const selectedMarkets = useMemo(() => {
    const selected = localMarkets.filter((m) => m.isSelected);
    if (!debouncedSelectedSearch) return selected;
    const q = debouncedSelectedSearch.toLowerCase();
    return selected.filter((m) => m.symbol.toLowerCase().includes(q));
  }, [localMarkets, debouncedSelectedSearch]);

  const totalAvailable = useMemo(
    () => localMarkets.filter((m) => !m.isSelected).length,
    [localMarkets],
  );
  const totalSelected = useMemo(
    () => localMarkets.filter((m) => m.isSelected).length,
    [localMarkets],
  );

  /** Sorted list of currently selected symbols — used for change detection. */
  const currentMarkets = useMemo(
    () =>
      localMarkets
        .filter((m) => m.isSelected)
        .map((m) => m.symbol)
        .sort(),
    [localMarkets],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelectAllAvailable = useCallback(() => {
    setAvailableChecked(new Set(availableMarkets.map((m) => m.symbol)));
  }, [availableMarkets]);

  const handleClearAvailable = useCallback(() => {
    setAvailableChecked(new Set());
  }, []);

  const handleSelectAllSelected = useCallback(() => {
    const removable = selectedMarkets.filter((m) => !m.hasOpenPosition);
    setSelectedChecked(new Set(removable.map((m) => m.symbol)));
  }, [selectedMarkets]);

  const handleClearSelected = useCallback(() => {
    setSelectedChecked(new Set());
  }, []);

  const handleAddSelected = useCallback(() => {
    if (availableChecked.size === 0) return;
    setLocalMarkets((prev) =>
      prev.map((m) =>
        availableChecked.has(m.symbol) ? { ...m, isSelected: true } : m,
      ),
    );
    setAvailableChecked(new Set());
  }, [availableChecked]);

  const handleRemoveSelected = useCallback(() => {
    if (selectedChecked.size === 0) return;
    setLocalMarkets((prev) =>
      prev.map((m) =>
        selectedChecked.has(m.symbol) && !m.hasOpenPosition
          ? { ...m, isSelected: false }
          : m,
      ),
    );
    setSelectedChecked(new Set());
  }, [selectedChecked]);

  const handleToggleAvailableCheck = useCallback((symbol: string) => {
    setAvailableChecked((prev) => {
      const next = new Set(prev);
      next.has(symbol) ? next.delete(symbol) : next.add(symbol);
      return next;
    });
  }, []);

  const handleToggleSelectedCheck = useCallback(
    (symbol: string) => {
      const market = localMarkets.find((m) => m.symbol === symbol);
      if (market?.hasOpenPosition) return;
      setSelectedChecked((prev) => {
        const next = new Set(prev);
        next.has(symbol) ? next.delete(symbol) : next.add(symbol);
        return next;
      });
    },
    [localMarkets],
  );

  /** Call when the modal opens to reset transient selection/search state. */
  const resetSelection = useCallback(() => {
    setAvailableChecked(new Set());
    setSelectedChecked(new Set());
    setAvailableSearch("");
    setSelectedSearch("");
  }, []);

  return {
    // Core state (parent needs setLocalMarkets to initialise from server data)
    localMarkets,
    setLocalMarkets,
    currentMarkets,

    // Filtered lists
    availableMarkets,
    selectedMarkets,
    totalAvailable,
    totalSelected,

    // Search
    availableSearch,
    selectedSearch,
    setAvailableSearch,
    setSelectedSearch,
    debouncedAvailableSearch,
    debouncedSelectedSearch,

    // Checked sets
    availableChecked,
    selectedChecked,

    // Handlers
    handleSelectAllAvailable,
    handleClearAvailable,
    handleSelectAllSelected,
    handleClearSelected,
    handleAddSelected,
    handleRemoveSelected,
    handleToggleAvailableCheck,
    handleToggleSelectedCheck,
    resetSelection,
  };
}
