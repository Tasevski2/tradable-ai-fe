"use client";

import { useState } from "react";
import { Settings, Play, Loader2 } from "lucide-react";
import {
  BacktestHistoryTable,
  BacktestHistoryTableSkeleton,
} from "./BacktestHistoryTable";
import {
  BacktestSettingsModal,
  getBacktestPreferences,
} from "./BacktestSettingsModal";
import {
  BacktestDetails,
  BacktestDetailsSkeleton,
} from "@/components/strategy-details";
import { Skeleton } from "@/components/ui/Skeleton";
import { useRunBacktest } from "@/lib/api/mutations";

interface BacktestPanelProps {
  strategyId: string;
  draftConfigJson: unknown | null;
  selectedBacktestId: string | undefined;
  onBacktestSelect: (backtestId: string) => void;
}

export function BacktestPanel({
  strategyId,
  draftConfigJson,
  selectedBacktestId,
  onBacktestSelect,
}: BacktestPanelProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const runBacktest = useRunBacktest();

  const handleRunBacktest = () => {
    const prefs = getBacktestPreferences(strategyId);

    runBacktest.mutate({
      strategyId,
      data: prefs
        ? { symbol: prefs.symbol, timeframe: prefs.timeframe }
        : undefined,
    });
  };

  const canRunBacktest = draftConfigJson !== null && !runBacktest.isPending;

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <h2>Backtests</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn-secondary px-2.5 py-1.5 text-xs rounded-lg flex items-center gap-1.5"
          >
            <Settings size={12} />
            Settings
          </button>
          <button
            onClick={handleRunBacktest}
            disabled={!canRunBacktest}
            className="btn-primary px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {runBacktest.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            Run Backtest
          </button>
        </div>
      </div>

      <div className="p-3 grid grid-cols-[1.1fr_0.9fr] gap-3">
        <div>
          <BacktestHistoryTable
            strategyId={strategyId}
            selectedId={selectedBacktestId}
            onViewDetails={onBacktestSelect}
          />
        </div>

        <div>
          <BacktestDetails
            strategyId={strategyId}
            backtestId={selectedBacktestId}
            setSelectedBacktestId={onBacktestSelect}
          />
        </div>
      </div>

      <BacktestSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        strategyId={strategyId}
      />
    </div>
  );
}

export function BacktestPanelSkeleton() {
  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <Skeleton className="h-4 w-24 bg-background-overlay" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-lg bg-background-overlay" />
          <Skeleton className="h-8 w-32 rounded-lg bg-background-overlay" />
        </div>
      </div>
      <div className="p-3 grid grid-cols-[1.1fr_0.9fr] gap-3">
        <BacktestHistoryTableSkeleton />
        <BacktestDetailsSkeleton />
      </div>
    </div>
  );
}
