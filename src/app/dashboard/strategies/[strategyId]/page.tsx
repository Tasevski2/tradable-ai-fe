"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { useStrategy } from "@/lib/api/queries";
import { is404Error } from "@/lib/utils/errors";
import {
  StrategyHeader,
  StrategyHeaderSkeleton,
  StrategySummary,
  StrategySummarySkeleton,
  LivePositionsPanel,
  LivePositionsPanelSkeleton,
  BacktestDetails,
  BacktestDetailsSkeleton,
  BacktestHistoryPanel,
  BacktestHistoryPanelSkeleton,
  StrategyFlowPanel,
  RecentActivityPanel,
  RecentActivityPanelSkeleton,
  StrategyControlsPanel,
} from "@/components/strategy-details";

interface StrategyDetailPageProps {
  params: Promise<{
    strategyId: string;
  }>;
}

export default function StrategyDetailPage({
  params,
}: StrategyDetailPageProps) {
  const { strategyId } = use(params);

  const [selectedBacktestId, setSelectedBacktestId] = useState<
    string | undefined
  >();
  const { data: strategy, isLoading, error } = useStrategy(strategyId);

  if (is404Error(error)) {
    notFound();
  }

  if (error && !is404Error(error)) {
    return (
      <div className="p-8">
        <div className="text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-4 py-3">
          Failed to load strategy. Please try again.
        </div>
      </div>
    );
  }

  if (isLoading || !strategy) {
    return <StrategyDetailPageSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <StrategyHeader
        strategyId={strategy.id}
        name={strategy.name}
        description={strategy.description}
        status={strategy.status}
      />

      <div className="max-w-[1240px] mx-auto px-4 pb-16">
        <StrategySummary strategyId={strategy.id} />

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-3.5 mt-4">
          <div className="flex flex-col gap-3.5 min-w-0">
            <LivePositionsPanel strategyId={strategy.id} />

            <BacktestDetails
              strategyId={strategy.id}
              backtestId={selectedBacktestId}
              setSelectedBacktestId={setSelectedBacktestId}
            />

            <BacktestHistoryPanel
              strategyId={strategy.id}
              selectedBacktestId={selectedBacktestId}
              onViewDetails={setSelectedBacktestId}
            />
          </div>

          <div className="flex flex-col gap-3.5 min-w-0">
            <StrategyFlowPanel
              draftVersion={strategy.draftConfigVersion}
              liveVersion={strategy.liveConfigVersion}
              draftConfig={strategy.draftConfigJson}
              liveConfig={strategy.liveConfigJson}
            />

            <RecentActivityPanel strategyId={strategy.id} />

            <StrategyControlsPanel strategyId={strategy.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StrategyDetailPageSkeleton() {
  return (
    <div className="min-h-screen">
      <StrategyHeaderSkeleton />
      <div className="max-w-[1240px] mx-auto px-4 pb-16">
        <StrategySummarySkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-3.5 mt-4">
          <div className="flex flex-col gap-3.5 min-w-0">
            <LivePositionsPanelSkeleton />
            <BacktestDetailsSkeleton />
            <BacktestHistoryPanelSkeleton />
          </div>
          <div className="flex flex-col gap-3.5 min-w-0">
            <StrategyFlowPanel isLoading />
            <RecentActivityPanelSkeleton />
            <StrategyControlsPanel isLoading />
          </div>
        </div>
      </div>
    </div>
  );
}
