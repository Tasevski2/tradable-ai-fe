"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { getTimeframeLabel } from "@/lib/utils/timeframe";
import {
  formatCurrency,
  formatPnlPercent,
  formatPercentDisplay,
  formatRatio,
} from "@/lib/utils/format";
import { useBacktestDetail, useBacktestEquity } from "@/lib/api/queries";
import { BacktestTradesModal } from "./BacktestTradesModal";
import { BacktestMetricsTabs, type TabType } from "./BacktestMetrics";

const EquityCurveChart = dynamic(
  () =>
    import("@/components/charts/EquityCurveChart").then(
      (m) => m.EquityCurveChart,
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-50 w-full rounded-xl bg-background-overlay" />
    ),
  },
);

interface BacktestDetailsProps {
  strategyId: string;
  backtestId?: string;
  setSelectedBacktestId: (backtestId: string) => void;
}

const TABS: { id: TabType; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "trades", label: "Trades" },
  { id: "risk", label: "Risk" },
  { id: "activity", label: "Activity" },
];

export function BacktestDetails({
  strategyId,
  backtestId,
  setSelectedBacktestId,
}: BacktestDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isTradesModalOpen, setIsTradesModalOpen] = useState(false);
  const { data: backtest, isLoading } = useBacktestDetail(
    strategyId,
    backtestId,
  );
  const { data: equityData, isLoading: isEquityLoading } = useBacktestEquity(
    strategyId,
    backtestId,
    { enabled: !!backtest },
  );

  const metrics = backtest?.metrics;
  const isPnlPositive = metrics && !metrics.totalPnlUsd.startsWith("-");

  useEffect(() => {
    if (backtestId || isLoading || !backtest) return;

    setSelectedBacktestId(backtest.id);
  }, [backtest, backtestId, isLoading, setSelectedBacktestId]);

  if (isLoading) {
    return <BacktestDetailsSkeleton />;
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Backtest Details</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {backtest && (
            <span className="pill pill-ok">
              {backtest.symbol} • {getTimeframeLabel(backtest.timeframe)} • v
              {backtest.strategyVersion}
            </span>
          )}
        </div>
      </div>

      <div className="panel-body">
        {!backtest || !metrics ? (
          <div className="text-center py-8 text-foreground-muted">
            No backtest data available
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="kpi-card">
                <div className="kpi-label">Net PnL</div>
                <div
                  className={cn(
                    "kpi-value",
                    isPnlPositive ? "text-bullish" : "text-bearish",
                  )}
                >
                  {formatCurrency(metrics.totalPnlUsd)}
                </div>
                <div className="kpi-sub">
                  {formatPnlPercent(metrics.totalPnlPct)}
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">Win Rate</div>
                <div className="kpi-value">
                  {formatPercentDisplay(metrics.winRate)}
                </div>
                <div className="kpi-sub">
                  {metrics.wins} / {metrics.losses} / {metrics.breakeven}
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">Max Drawdown</div>
                <div className="kpi-value text-bearish">
                  {formatPercentDisplay(metrics.maxDrawdownPct)}
                </div>
                <div className="kpi-sub">
                  {formatCurrency(metrics.maxDrawdownUsd)}
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-label">Profit Factor</div>
                <div className="kpi-value">
                  {metrics.profitFactor
                    ? formatRatio(metrics.profitFactor)
                    : "N/A"}
                </div>
                <div className="kpi-sub">Trades: {metrics.totalTrades}</div>
              </div>
            </div>

            <div className="mt-3">
              {isEquityLoading ? (
                <Skeleton className="h-50 w-full rounded-xl bg-background-overlay" />
              ) : equityData && equityData.length > 0 ? (
                <EquityCurveChart data={equityData} height={200} />
              ) : (
                <div className="chart-placeholder">
                  No equity data available
                </div>
              )}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 mt-3">
              <div className="flex gap-2 flex-wrap">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn("tab", activeTab === tab.id && "tab-active")}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsTradesModalOpen(true)}
                className="btn-secondary px-3 py-1.5 text-[13px] rounded-xl"
              >
                View All Trades
              </button>
            </div>

            <div className="mt-3">
              <BacktestMetricsTabs metrics={metrics} activeTab={activeTab} />
            </div>
          </>
        )}
      </div>

      {backtest && (
        <BacktestTradesModal
          isOpen={isTradesModalOpen}
          onClose={() => setIsTradesModalOpen(false)}
          strategyId={strategyId}
          backtestId={backtest.id}
        />
      )}
    </div>
  );
}

export function BacktestDetailsSkeleton() {
  return (
    <div className="panel">
      <div className="panel-header">
        <Skeleton className="h-4 w-32 bg-background-overlay" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-36 rounded-full bg-background-overlay" />
        </div>
      </div>
      <div className="panel-body">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="kpi-card">
              <Skeleton className="h-3 w-16 bg-background-overlay" />
              <Skeleton className="h-5 w-20 bg-background-overlay mt-2" />
              <Skeleton className="h-3 w-24 bg-background-overlay mt-2" />
            </div>
          ))}
        </div>
        <Skeleton className="h-[220px] w-full rounded-xl bg-background-overlay mt-3" />
        <div className="flex gap-2 mt-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-8 w-20 rounded-full bg-background-overlay"
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-20 rounded-xl bg-background-overlay"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
