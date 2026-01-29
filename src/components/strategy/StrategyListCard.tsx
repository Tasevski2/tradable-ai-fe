"use client";

import Link from "next/link";
import { Pencil, Info } from "lucide-react";
import type { StrategyListItem } from "@/types/api";
import { formatRelativeTime } from "@/lib/utils/format";
import { getStrategyStatusStyle } from "@/lib/utils/status";

interface StrategyListCardProps {
  strategy: StrategyListItem;
}

export function StrategyListCard({ strategy }: StrategyListCardProps) {
  const statusStyle = getStrategyStatusStyle(strategy.status);

  return (
    <div className="p-4 bg-background border border-border rounded-lg hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-foreground font-medium truncate">
            {strategy.name}
          </h3>
          <p className="text-sm text-foreground/70 mt-1">
            Updated {formatRelativeTime(strategy.updatedAt)}
          </p>
        </div>

        <span
          className={`flex-shrink-0 px-2 py-1 text-xs font-medium rounded ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <Link
          href={`/strategies/${strategy.strategyId}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-background rounded-lg hover:opacity-90 transition-opacity"
        >
          <Pencil size={14} />
          Edit
        </Link>
        <Link
          href={`/dashboard/strategies/${strategy.strategyId}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-background-elevated hover:border-primary/30 transition-all"
        >
          <Info size={14} />
          Details
        </Link>
      </div>
    </div>
  );
}
