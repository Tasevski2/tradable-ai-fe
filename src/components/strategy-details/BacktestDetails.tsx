"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { getTimeframeLabel } from "@/lib/utils/timeframe";
import {
  formatCurrency,
  formatSmartCurrency,
  formatPnlPercent,
  formatPercentDisplay,
  formatRatio,
  formatDuration,
  formatDateTime,
} from "@/lib/utils/format";
import { useBacktestDetail } from "@/lib/api/queries";
import { BacktestTradesModal } from "./BacktestTradesModal";
import type { BacktestMetrics } from "@/types/api";

interface BacktestDetailsProps {
  strategyId: string;
  backtestId?: string;
}

type TabType = "overview" | "trades" | "risk" | "activity";

interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

function MetricCard({
  label,
  value,
  sub,
  className,
  valueClassName,
}: MetricCardProps) {
  return (
    <div className={cn("metric-card", className)}>
      <div className="metric-label">{label}</div>
      <div className={cn("metric-value", valueClassName)}>{value}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function OverviewTab({ metrics }: { metrics: BacktestMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <MetricCard
        label="Initial Equity"
        value={formatCurrency(metrics.initialEquityUsd)}
      />
      <MetricCard
        label="Final Equity"
        value={formatCurrency(metrics.finalEquityUsd)}
      />
      <MetricCard
        label="Avg Hold Time"
        value={formatDuration(metrics.avgHoldMinutes)}
      />
      <MetricCard
        label="Trades / Day"
        value={formatRatio(metrics.tradesPerDay)}
      />
    </div>
  );
}

function TradesTab({ metrics }: { metrics: BacktestMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <MetricCard label="Total Trades" value={metrics.totalTrades} />
      <MetricCard
        label="Wins / Losses / Breakeven"
        value={
          <>
            <span className="text-bullish">{metrics.wins}</span>
            {" / "}
            <span className="text-bearish">{metrics.losses}</span>
            {" / "}
            <span className="text-foreground-muted">{metrics.breakeven}</span>
          </>
        }
      />
      <MetricCard
        label="Avg PnL"
        value={formatSmartCurrency(metrics.avgPnlUsd)}
        valueClassName={
          metrics.avgPnlUsd.startsWith("-") ? "text-bearish" : "text-bullish"
        }
      />
      <MetricCard
        label="Avg Win / Loss"
        value={
          <>
            <span className="text-bullish">
              {formatSmartCurrency(metrics.avgWinUsd)}
            </span>
            {" / "}
            <span className="text-bearish">
              {formatSmartCurrency(metrics.avgLossUsd)}
            </span>
          </>
        }
        valueClassName="text-sm"
      />
      <MetricCard
        label="Best Trade"
        value={formatSmartCurrency(metrics.bestTradeUsd)}
        valueClassName="text-bullish"
      />
      <MetricCard
        label="Worst Trade"
        value={formatSmartCurrency(metrics.worstTradeUsd)}
        valueClassName="text-bearish"
      />
    </div>
  );
}

function RiskTab({ metrics }: { metrics: BacktestMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <MetricCard
        label="Max Drawdown %"
        value={formatPercentDisplay(metrics.maxDrawdownPct)}
        valueClassName="text-bearish"
      />
      <MetricCard
        label="Max Drawdown USD"
        value={formatCurrency(metrics.maxDrawdownUsd)}
        valueClassName="text-bearish"
      />
      <MetricCard
        label="Return / Max Drawdown"
        value={
          metrics.returnOverMaxDrawdown
            ? formatRatio(metrics.returnOverMaxDrawdown)
            : "N/A"
        }
        className="col-span-2"
      />
    </div>
  );
}

function ActivityTab({ metrics }: { metrics: BacktestMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <MetricCard
        label="Trades / Day"
        value={formatRatio(metrics.tradesPerDay)}
      />
      <MetricCard
        label="Avg Hold Time"
        value={formatDuration(metrics.avgHoldMinutes)}
      />
      <MetricCard
        label="Start Time"
        value={formatDateTime(metrics.startT)}
        valueClassName="text-sm"
      />
      <MetricCard
        label="End Time"
        value={formatDateTime(metrics.endT)}
        valueClassName="text-sm"
      />
    </div>
  );
}

export function BacktestDetails({
  strategyId,
  backtestId,
}: BacktestDetailsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isTradesModalOpen, setIsTradesModalOpen] = useState(false);
  const { data: backtest, isLoading } = useBacktestDetail(
    strategyId,
    backtestId,
  );

  if (isLoading) {
    return <BacktestDetailsSkeleton />;
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "trades", label: "Trades" },
    { id: "risk", label: "Risk" },
    { id: "activity", label: "Activity" },
  ];

  const metrics = backtest?.metrics;
  const isPnlPositive = metrics && !metrics.totalPnlUsd.startsWith("-");

  const renderTabContent = () => {
    if (!metrics) return null;

    switch (activeTab) {
      case "overview":
        return <OverviewTab metrics={metrics} />;
      case "trades":
        return <TradesTab metrics={metrics} />;
      case "risk":
        return <RiskTab metrics={metrics} />;
      case "activity":
        return <ActivityTab metrics={metrics} />;
      default:
        return null;
    }
  };

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
            {/* KPI Grid */}
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

            {/* Equity Curve Placeholder */}
            <div className="chart-placeholder mt-3">Equity Curve</div>

            {/* Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-3 mt-3">
              <div className="flex gap-2 flex-wrap">
                {tabs.map((tab) => (
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

            {/* Tab Content */}
            <div className="mt-3">{renderTabContent()}</div>
          </>
        )}
      </div>

      {/* Trades Modal */}
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
