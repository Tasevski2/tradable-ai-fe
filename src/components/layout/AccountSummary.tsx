"use client";

import Decimal from "decimal.js";
import { useAccountSummary } from "@/lib/api/queries";
import { formatCompactCurrency } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SummaryCardProps {
  label: string;
  value: string | number;
  tooltip: string;
  isCurrency?: boolean;
  colorClass?: string;
}

function SummaryCard({
  label,
  value,
  tooltip,
  isCurrency = false,
  colorClass,
}: SummaryCardProps) {
  const displayValue = isCurrency ? formatCompactCurrency(value) : value;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="bg-background rounded-lg px-2.5 py-2 text-center cursor-help">
          <div className="text-[9px] text-foreground-muted tracking-wide">
            {label}
          </div>
          <div
            className={`text-sm font-medium ${colorClass || "text-foreground"}`}
          >
            {displayValue}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-2 px-3 py-3 border-t border-border">
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-12 bg-background rounded-lg" />
        <Skeleton className="h-12 bg-background rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-12 bg-background rounded-lg" />
        <Skeleton className="h-12 bg-background rounded-lg" />
        <Skeleton className="h-12 bg-background rounded-lg" />
      </div>
    </div>
  );
}

export function AccountSummary() {
  const { data: summary, isLoading } = useAccountSummary();

  if (isLoading) {
    return <SummarySkeleton />;
  }

  if (!summary) {
    return null;
  }

  const unrealizedPnlValue = new Decimal(summary.unrealizedPnl);
  const isNegativePnl = unrealizedPnlValue.isNegative();
  const pnlColorClass = isNegativePnl ? "text-bearish" : "text-foreground";

  return (
    <div className="space-y-2 px-3 py-3 border-t border-border">
      <div className="grid grid-cols-2 gap-2">
        <SummaryCard
          label="Available"
          value={summary.availableBalance}
          tooltip="Available balance for trading"
          isCurrency
        />
        <SummaryCard
          label="Margin"
          value={summary.marginInUse}
          tooltip="Margin currently in use by open positions"
          isCurrency
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SummaryCard
          label="Live"
          value={summary.liveStrategies}
          tooltip="Number of strategies currently live"
        />
        <SummaryCard
          label="Positions"
          value={summary.openPositions}
          tooltip="Number of open positions"
        />
        <SummaryCard
          label="UPnL"
          value={summary.unrealizedPnl}
          tooltip="Unrealized profit/loss from open positions"
          isCurrency
          colorClass={pnlColorClass}
        />
      </div>
    </div>
  );
}
