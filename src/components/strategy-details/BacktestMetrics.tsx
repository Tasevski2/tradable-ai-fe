import { cn } from "@/lib/utils/cn";
import {
  formatCurrency,
  formatSmartCurrency,
  formatPercentDisplay,
  formatRatio,
  formatDuration,
  formatDateTime,
} from "@/lib/utils/format";
import type { BacktestMetrics } from "@/types/api";

export type TabType = "overview" | "trades" | "risk" | "activity";

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

interface BacktestMetricsTabsProps {
  metrics: BacktestMetrics;
  activeTab: TabType;
}

export function BacktestMetricsTabs({
  metrics,
  activeTab,
}: BacktestMetricsTabsProps) {
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
}
