"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, AlertTriangle, Check, Loader2 } from "lucide-react";
import { MarketListItem } from "./MarketListItem";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks";
import { useStrategy, useMarketsWithStatus } from "@/lib/api/queries";
import { useDeployStrategy } from "@/lib/api/mutations";
import {
  deployStrategyFormSchema,
  type DeployStrategyFormData,
  type DeployInitialValues,
} from "@/lib/validations/deployStrategy";
import { getTimeframeLabel } from "@/lib/utils/timeframe";
import { getErrorMessage } from "@/lib/utils/errors";
import { cn } from "@/lib/utils/cn";
import { TimeframeEnum, StrategyStatusEnum } from "@/types/common";
import type { MarketWithStatus } from "@/types/api";

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: string;
}

const TIMEFRAME_OPTIONS = [
  { value: TimeframeEnum.ONE_MIN, label: "1 min" },
  { value: TimeframeEnum.FIVE_MIN, label: "5 min" },
  { value: TimeframeEnum.FIFTEEN_MIN, label: "15 min" },
  { value: TimeframeEnum.ONE_HOUR, label: "1 hour" },
];

function getStatusDotClass(status: StrategyStatusEnum): string {
  switch (status) {
    case StrategyStatusEnum.LIVE:
      return "";
    case StrategyStatusEnum.PAUSED:
      return "paused";
    case StrategyStatusEnum.NOT_CONFIGURED:
      return "error";
    default:
      return "";
  }
}

function getStatusLabel(status: StrategyStatusEnum): string {
  switch (status) {
    case StrategyStatusEnum.LIVE:
      return "Live";
    case StrategyStatusEnum.PAUSED:
      return "Paused";
    case StrategyStatusEnum.NOT_CONFIGURED:
      return "Not Configured";
    default:
      return "Unknown";
  }
}

function DeployModalSkeleton() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-4">
        {/* Left column skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-full rounded-lg bg-background-overlay" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg bg-background-overlay" />
            <Skeleton className="h-10 flex-1 rounded-lg bg-background-overlay" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-64 rounded-lg bg-background-overlay" />
            <Skeleton className="h-64 rounded-lg bg-background-overlay" />
          </div>
        </div>
        {/* Right column skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg bg-background-overlay" />
          <Skeleton className="h-24 w-full rounded-lg bg-background-overlay" />
        </div>
      </div>
    </div>
  );
}

export function DeployModal({ isOpen, onClose, strategyId }: DeployModalProps) {
  // Fetch data
  const { data: strategy, isLoading: isStrategyLoading } = useStrategy(
    strategyId,
    { enabled: isOpen },
  );
  const { data: marketsData, isLoading: isMarketsLoading } =
    useMarketsWithStatus(strategyId, { enabled: isOpen });

  const deployMutation = useDeployStrategy();

  // React Hook Form for validated fields
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DeployStrategyFormData>({
    resolver: zodResolver(deployStrategyFormSchema),
    defaultValues: {
      timeframe: undefined,
      perOrderUsd: "",
    },
  });

  // UI state (not part of form validation)
  const [localMarkets, setLocalMarkets] = useState<MarketWithStatus[]>([]);
  const [availableChecked, setAvailableChecked] = useState<Set<string>>(
    new Set(),
  );
  const [selectedChecked, setSelectedChecked] = useState<Set<string>>(
    new Set(),
  );
  const [promoteDraft, setPromoteDraft] = useState(false);
  const [deployStatus, setDeployStatus] = useState<StrategyStatusEnum>(
    StrategyStatusEnum.PAUSED,
  );
  const [availableSearch, setAvailableSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("");

  // Store initial values for non-form change detection
  const [initialValues, setInitialValues] =
    useState<DeployInitialValues | null>(null);

  const debouncedAvailableSearch = useDebounce(availableSearch, 200);
  const debouncedSelectedSearch = useDebounce(selectedSearch, 200);

  // Initialize form state when data loads
  useEffect(() => {
    if (isOpen && strategy && marketsData) {
      const initTimeframe = strategy.timeframe;
      const initPerOrderUsd = strategy.perOrderUsd ?? "";
      const initPromoteDraft =
        strategy.liveConfigVersion === 0
          ? strategy.draftConfigVersion > 0
          : strategy.liveConfigVersion === strategy.draftConfigVersion;
      const initDeployStatus =
        strategy.status === StrategyStatusEnum.NOT_CONFIGURED
          ? StrategyStatusEnum.LIVE
          : strategy.status;
      const initMarkets = marketsData
        .filter((m) => m.isSelected)
        .map((m) => m.symbol);

      // Reset react-hook-form with API values
      reset({
        timeframe: initTimeframe ?? undefined,
        perOrderUsd: initPerOrderUsd,
      });

      // Initialize non-form UI state
      setPromoteDraft(initPromoteDraft);
      setDeployStatus(initDeployStatus);
      setLocalMarkets(marketsData);
      setAvailableChecked(new Set());
      setSelectedChecked(new Set());

      // Store initial values for non-form change detection
      setInitialValues({
        timeframe: initTimeframe,
        perOrderUsd: initPerOrderUsd,
        markets: initMarkets,
        promoteDraft: initPromoteDraft,
        deployStatus: initDeployStatus,
      });
    }
  }, [isOpen, strategy, marketsData, reset]);

  // Reset searches when modal opens
  useEffect(() => {
    if (isOpen) {
      setAvailableSearch("");
      setSelectedSearch("");
      deployMutation.reset();
    }
  }, [isOpen]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  // Computed values
  const availableMarkets = useMemo(() => {
    const filtered = localMarkets.filter((m) => !m.isSelected);
    if (!debouncedAvailableSearch) return filtered;
    const search = debouncedAvailableSearch.toLowerCase();
    return filtered.filter((m) => m.symbol.toLowerCase().includes(search));
  }, [localMarkets, debouncedAvailableSearch]);

  const selectedMarkets = useMemo(() => {
    const filtered = localMarkets.filter((m) => m.isSelected);
    if (!debouncedSelectedSearch) return filtered;
    const search = debouncedSelectedSearch.toLowerCase();
    return filtered.filter((m) => m.symbol.toLowerCase().includes(search));
  }, [localMarkets, debouncedSelectedSearch]);

  const totalAvailable = localMarkets.filter((m) => !m.isSelected).length;
  const totalSelected = localMarkets.filter((m) => m.isSelected).length;

  // Actions
  const handleSelectAllAvailable = () => {
    setAvailableChecked(new Set(availableMarkets.map((m) => m.symbol)));
  };

  const handleClearAvailable = () => {
    setAvailableChecked(new Set());
  };

  const handleSelectAllSelected = () => {
    // Only select markets that don't have open positions (can be removed)
    const removableMarkets = selectedMarkets.filter((m) => !m.hasOpenPosition);
    setSelectedChecked(new Set(removableMarkets.map((m) => m.symbol)));
  };

  const handleClearSelected = () => {
    setSelectedChecked(new Set());
  };

  const handleAddSelected = () => {
    if (availableChecked.size === 0) return;
    setLocalMarkets((prev) =>
      prev.map((m) =>
        availableChecked.has(m.symbol) ? { ...m, isSelected: true } : m,
      ),
    );
    setAvailableChecked(new Set());
  };

  const handleRemoveSelected = () => {
    if (selectedChecked.size === 0) return;
    setLocalMarkets((prev) =>
      prev.map((m) =>
        // Only remove if checked AND doesn't have open position
        selectedChecked.has(m.symbol) && !m.hasOpenPosition
          ? { ...m, isSelected: false }
          : m,
      ),
    );
    setSelectedChecked(new Set());
  };

  const handleToggleAvailableCheck = (symbol: string) => {
    setAvailableChecked((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  const handleToggleSelectedCheck = (symbol: string) => {
    // Find the market and check if it has open position
    const market = localMarkets.find((m) => m.symbol === symbol);
    if (market?.hasOpenPosition) return; // Can't select for removal

    setSelectedChecked((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  // Track non-form changes (markets, promoteDraft, deployStatus)
  // IMPORTANT: These useMemo hooks must be BEFORE any early returns
  const currentMarkets = useMemo(
    () =>
      localMarkets
        .filter((m) => m.isSelected)
        .map((m) => m.symbol)
        .sort(),
    [localMarkets],
  );

  const hasNonFormChanges = useMemo(() => {
    if (!initialValues) return false;
    return (
      JSON.stringify(currentMarkets) !==
        JSON.stringify([...initialValues.markets].sort()) ||
      promoteDraft !== initialValues.promoteDraft ||
      deployStatus !== initialValues.deployStatus
    );
  }, [initialValues, currentMarkets, promoteDraft, deployStatus]);

  // Combined: form isDirty + non-form changes
  const hasChanges = isDirty || hasNonFormChanges;

  // Config version checks (needed before early return for isDeployDisabled)
  const noLiveConfig = strategy && strategy.liveConfigVersion === 0;
  const bothVersionsZero =
    strategy &&
    strategy.liveConfigVersion === 0 &&
    strategy.draftConfigVersion === 0;

  // Deploy button should be disabled if no changes made or no config exists
  const isDeployDisabled = !hasChanges || deployMutation.isPending || bothVersionsZero;

  const onDeploy = (formData: DeployStrategyFormData) => {
    const selectedSymbols = localMarkets
      .filter((m) => m.isSelected)
      .map((m) => m.symbol);

    deployMutation.mutate(
      {
        strategyId,
        data: {
          timeframe: formData.timeframe,
          perOrderUsd: Number(formData.perOrderUsd),
          strategyMarkets: selectedSymbols,
          promoteDraftToLive: promoteDraft,
          status: deployStatus as StrategyStatusEnum.LIVE | StrategyStatusEnum.PAUSED,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  // Early return AFTER all hooks
  if (!isOpen) {
    return null;
  }

  const isLoading = isStrategyLoading || isMarketsLoading;
  const versionsMatch =
    strategy && strategy.liveConfigVersion === strategy.draftConfigVersion;

  const deployError = deployMutation.error
    ? getErrorMessage(deployMutation.error, "Failed to deploy strategy")
    : null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl mx-4 bg-card border border-border rounded-lg shadow-xl animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Deploy Strategy Changes
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="badge">Applies to live strategy behavior</span>
            <button
              onClick={onClose}
              className="btn-secondary px-3 py-1.5 text-sm rounded-lg"
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto flex-1">
          {isLoading || !strategy ? (
            <DeployModalSkeleton />
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-4">
                {/* Left Column - Live Parameters */}
                <div className="border border-border rounded-xl p-4 bg-background-overlay/30">
                  <label className="block text-xs font-bold text-foreground-muted uppercase tracking-wide mb-3">
                    Live Parameters
                  </label>

                  {/* Current badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="badge">
                      <span
                        className={cn(
                          "badge-dot",
                          getStatusDotClass(strategy.status),
                        )}
                      />
                      {getStatusLabel(strategy.status)}
                    </span>
                    <span className="badge">
                      Current timeframe: {getTimeframeLabel(strategy.timeframe)}
                    </span>
                    {strategy.perOrderUsd && (
                      <span className="badge">
                        Current per order: ${strategy.perOrderUsd}
                      </span>
                    )}
                  </div>

                  {/* Inputs row */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <div className="text-xs text-foreground-muted/70 mb-1">
                        Timeframe
                      </div>
                      <Controller
                        name="timeframe"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value ?? ""}
                            onValueChange={(value) =>
                              field.onChange(value || undefined)
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                "w-full bg-background",
                                errors.timeframe && "border-bearish",
                              )}
                            >
                              <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEFRAME_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.timeframe && (
                        <p className="text-xs text-bearish mt-1">
                          {errors.timeframe.message}
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-foreground-muted/70 mb-1">
                        Per order USD
                      </div>
                      <Controller
                        name="perOrderUsd"
                        control={control}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="text"
                            placeholder="$50.00"
                            className={cn(
                              "w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
                              errors.perOrderUsd
                                ? "border-bearish"
                                : "border-border",
                            )}
                          />
                        )}
                      />
                      {errors.perOrderUsd && (
                        <p className="text-xs text-bearish mt-1">
                          {errors.perOrderUsd.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Market Selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Available Markets */}
                    <div className="border border-border/50 rounded-xl bg-background/40 p-3 flex flex-col min-h-[280px]">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wide">
                          Available Markets
                        </h4>
                        <div className="flex gap-1.5">
                          <button
                            onClick={handleSelectAllAvailable}
                            className="btn-secondary px-2 py-1 text-xs rounded-lg"
                          >
                            Select all
                          </button>
                          <button
                            onClick={handleClearAvailable}
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
                            value={availableSearch}
                            onChange={(e) => setAvailableSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <span className="badge text-xs">{totalAvailable}</span>
                      </div>

                      {/* List */}
                      <div className="flex-1 border border-border/40 rounded-lg bg-background-overlay/20 p-2 overflow-auto min-h-[120px] max-h-[170px]">
                        {availableMarkets.length === 0 ? (
                          <div className="text-xs text-foreground-muted text-center py-4">
                            {debouncedAvailableSearch
                              ? "No markets found"
                              : "No available markets"}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {availableMarkets.map((market) => (
                              <MarketListItem
                                key={market.symbol}
                                symbol={market.symbol}
                                isChecked={availableChecked.has(market.symbol)}
                                onClick={() =>
                                  handleToggleAvailableCheck(market.symbol)
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-foreground-muted/70">
                          Selected: {availableChecked.size}
                        </span>
                        <button
                          onClick={handleAddSelected}
                          disabled={availableChecked.size === 0}
                          className="btn-primary px-3 py-1.5 text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add selected →
                        </button>
                      </div>
                    </div>

                    {/* Selected Markets */}
                    <div className="border border-border/50 rounded-xl bg-background/40 p-3 flex flex-col min-h-[280px]">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="text-xs font-bold text-foreground-muted uppercase tracking-wide">
                          Selected Markets
                        </h4>
                        <div className="flex gap-1.5">
                          <button
                            onClick={handleSelectAllSelected}
                            className="btn-secondary px-2 py-1 text-xs rounded-lg"
                          >
                            Select all
                          </button>
                          <button
                            onClick={handleClearSelected}
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
                            placeholder="Search selected..."
                            value={selectedSearch}
                            onChange={(e) => setSelectedSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <span className="badge text-xs">{totalSelected}</span>
                      </div>

                      {/* List */}
                      <div className="flex-1 border border-border/40 rounded-lg bg-background-overlay/20 p-2 overflow-auto min-h-[120px] max-h-[170px]">
                        {selectedMarkets.length === 0 ? (
                          <div className="text-xs text-foreground-muted text-center py-4">
                            {debouncedSelectedSearch
                              ? "No markets found"
                              : "No selected markets"}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {selectedMarkets.map((market) => (
                              <MarketListItem
                                key={market.symbol}
                                symbol={market.symbol}
                                isChecked={selectedChecked.has(market.symbol)}
                                onClick={() =>
                                  handleToggleSelectedCheck(market.symbol)
                                }
                                disabled={market.hasOpenPosition}
                                badge={
                                  market.hasOpenPosition
                                    ? { text: "allocated", variant: "warn" }
                                    : null
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-foreground-muted/70">
                          Selected: {selectedChecked.size}
                        </span>
                        <button
                          onClick={handleRemoveSelected}
                          disabled={selectedChecked.size === 0}
                          className="btn-danger px-3 py-1.5 text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ← Remove selected
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Warning box */}
                  <div className="mt-4 p-3 rounded-xl border border-warning/30 bg-warning/10 text-warning text-xs font-medium leading-relaxed">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>
                        Changing timeframe or symbols affects future signals.
                        Existing positions won&apos;t be closed automatically.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Strategy Logic */}
                <div className="border border-border rounded-xl p-4 bg-background-overlay/30 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-foreground-muted uppercase tracking-wide mb-3">
                      Strategy Logic
                    </label>

                    {/* Version pills */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="pill pill-warn">
                        Draft v{strategy.draftConfigVersion}
                      </span>
                      <span className="pill pill-ok">
                        Live v{strategy.liveConfigVersion}
                      </span>
                    </div>

                    {/* Promote checkbox */}
                    <div
                      onClick={() =>
                        !(versionsMatch || noLiveConfig) &&
                        setPromoteDraft(!promoteDraft)
                      }
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border transition-colors",
                        versionsMatch || noLiveConfig
                          ? "border-border/50 bg-background-overlay/20 cursor-not-allowed opacity-70"
                          : promoteDraft
                            ? "border-primary/50 bg-primary/10 cursor-pointer"
                            : "border-border/50 bg-background-overlay/20 hover:bg-background-overlay/40 cursor-pointer",
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5",
                          promoteDraft
                            ? "bg-primary border-primary"
                            : "border-border bg-background-overlay/50",
                        )}
                      >
                        {promoteDraft && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground/90">
                          Promote Draft → Live Config
                        </div>
                        <div className="text-xs text-foreground-muted mt-1">
                          {noLiveConfig && !bothVersionsZero
                            ? "No live config yet. Draft will be promoted on deploy."
                            : versionsMatch
                              ? "Draft and live configs are identical."
                              : "Copies the draft strategy logic into the live strategy used for trading."}
                        </div>
                      </div>
                    </div>

                    {!versionsMatch && !noLiveConfig && !promoteDraft && (
                      <div className="mt-3 text-xs text-warning">
                        Your draft config differs from live. Consider promoting
                        it.
                      </div>
                    )}

                    {/* Strategy Status Selector */}
                    <div className="mt-4">
                      <label className="block text-xs font-bold text-foreground-muted uppercase tracking-wide mb-2">
                        Strategy Status After Deploy
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setDeployStatus(StrategyStatusEnum.LIVE)
                          }
                          className={cn(
                            "flex-1 px-3 py-2.5 text-sm rounded-lg border transition-colors",
                            deployStatus === StrategyStatusEnum.LIVE
                              ? "border-bullish bg-bullish/10 text-bullish"
                              : "border-border bg-background-overlay/20 text-foreground-muted hover:bg-background-overlay/40",
                          )}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-bullish" />
                            Live
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            setDeployStatus(StrategyStatusEnum.PAUSED)
                          }
                          className={cn(
                            "flex-1 px-3 py-2.5 text-sm rounded-lg border transition-colors",
                            deployStatus === StrategyStatusEnum.PAUSED
                              ? "border-warning bg-warning/10 text-warning"
                              : "border-border bg-background-overlay/20 text-foreground-muted hover:bg-background-overlay/40",
                          )}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-warning" />
                            Paused
                          </div>
                        </button>
                      </div>
                      <p className="text-xs text-foreground-muted/70 mt-2">
                        Choose whether the strategy should start trading
                        immediately or remain paused.
                      </p>
                    </div>
                  </div>

                  {/* Error message */}
                  {deployError && (
                    <div className="mt-4 text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-3 py-2">
                      {deployError}
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={onClose}
                        className="btn-secondary px-4 py-2 text-sm rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit(onDeploy)}
                        disabled={isDeployDisabled}
                        className="btn-primary px-4 py-2 text-sm rounded-lg relative disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span
                          className={
                            deployMutation.isPending ? "opacity-0" : ""
                          }
                        >
                          {strategy?.status === StrategyStatusEnum.NOT_CONFIGURED
                            ? "Deploy Now"
                            : "Deploy Changes"}
                        </span>
                        {deployMutation.isPending && (
                          <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(modalContent, document.body);
}
