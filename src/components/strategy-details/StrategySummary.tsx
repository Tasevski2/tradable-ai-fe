"use client";

import { useState } from "react";
import { StrategyStatusEnum } from "@/types/common";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { useStrategy, useStrategyMarkets } from "@/lib/api/queries";
import { getTimeframeLabel } from "@/lib/utils/timeframe";
import {
  getStrategyStatusDotClass,
  getStrategyStatusLabel,
} from "@/lib/utils/status";
import { MarketsListModal } from "./MarketsListModal";

interface StrategySummaryProps {
  strategyId: string;
}

export function StrategySummary({ strategyId }: StrategySummaryProps) {
  const [isMarketsModalOpen, setIsMarketsModalOpen] = useState(false);

  const { data: strategy, isLoading: isStrategyLoading } =
    useStrategy(strategyId);
  const { data: marketsData, isLoading: isMarketsLoading } =
    useStrategyMarkets(strategyId);

  // Show skeleton until both hooks are loaded
  if (isStrategyLoading || isMarketsLoading || !strategy) {
    return <StrategySummarySkeleton />;
  }

  // Compute derived values
  const isConfigured = strategy.status !== StrategyStatusEnum.NOT_CONFIGURED;
  const hasDraftDiff =
    strategy.liveConfigVersion !== strategy.draftConfigVersion;

  // Markets data
  const markets = marketsData?.markets ?? [];
  const totalCount = marketsData?.totalCount ?? 0;
  const remainingCount = totalCount - markets.length;

  return (
    <div className="panel mt-3.5">
      <div className="panel-body">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-3 items-start">
          {/* Left side */}
          <div>
            <div className="flex items-center flex-wrap gap-2">
              {/* Status badges */}
              <span className="badge">
                <span
                  className={cn(
                    "badge-dot",
                    getStrategyStatusDotClass(strategy.status),
                  )}
                />
                {getStrategyStatusLabel(strategy.status)}
              </span>
              <span className="badge">
                Timeframe: {getTimeframeLabel(strategy.timeframe)}
              </span>
              {strategy.perOrderUsd && (
                <span className="badge">
                  Per order: ${strategy.perOrderUsd}
                </span>
              )}
              {isConfigured && hasDraftDiff && (
                <span className="pill pill-warn">Draft differs</span>
              )}
            </div>

            {/* Symbol chips */}
            {markets.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {markets.map((symbol) => (
                  <span key={symbol} className="chip">
                    {symbol}
                  </span>
                ))}
                {remainingCount > 0 && (
                  <button
                    onClick={() => setIsMarketsModalOpen(true)}
                    className="chip chip-more cursor-pointer hover:bg-background-overlay/80 transition-colors"
                  >
                    +{remainingCount} more
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right side - Description */}
          <div className="flex justify-start">
            {strategy.description && (
              <p className="text-[13px] text-foreground-muted leading-relaxed mt-2.5 lg:mt-0">
                <strong>Description:</strong> {strategy.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Markets Modal */}
      <MarketsListModal
        isOpen={isMarketsModalOpen}
        onClose={() => setIsMarketsModalOpen(false)}
        strategyId={strategyId}
      />
    </div>
  );
}

export function StrategySummarySkeleton() {
  return (
    <div className="panel mt-3.5">
      <div className="panel-body">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-3 items-start">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-7 w-20 rounded-full bg-background-overlay" />
              <Skeleton className="h-7 w-28 rounded-full bg-background-overlay" />
              <Skeleton className="h-7 w-24 rounded-full bg-background-overlay" />
              <Skeleton className="h-7 w-20 rounded-full bg-background-overlay" />
            </div>
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-7 w-20 rounded-full bg-background-overlay"
                />
              ))}
            </div>
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-16 w-full lg:w-64 rounded-lg bg-background-overlay" />
          </div>
        </div>
      </div>
    </div>
  );
}
