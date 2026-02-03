"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { useStrategy } from "@/lib/api/queries";
import { APIError } from "@/lib/api/client";
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
  // Unwrap params using React.use() pattern for Next.js 15+
  const { strategyId } = use(params);

  const [selectedBacktestId, setSelectedBacktestId] = useState<
    string | undefined
  >();
  const { data: strategy, isLoading, error } = useStrategy(strategyId);

  // Handle 404 error
  if (error instanceof APIError && error.status === 404) {
    notFound();
  }

  // Handle other errors
  if (error && !(error instanceof APIError && error.status === 404)) {
    return (
      <div className="p-8">
        <div className="text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-4 py-3">
          Failed to load strategy. Please try again.
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading || !strategy) {
    return <StrategyDetailPageSkeleton />;
  }

  const handleViewBacktestDetails = (backtestId: string) => {
    setSelectedBacktestId(backtestId);
  };

  const handleFullscreenFlow = () => {
    console.log("Fullscreen flow");
  };

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <StrategyHeader
        strategyId={strategy.id}
        name={strategy.name}
        description={strategy.description}
        status={strategy.status}
      />

      {/* Main Content */}
      <div className="max-w-[1240px] mx-auto px-4 pb-16">
        {/* Summary Panel */}
        <StrategySummary strategyId={strategy.id} />

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-3.5 mt-4">
          {/* Left Column */}
          <div className="flex flex-col gap-3.5 min-w-0">
            <LivePositionsPanel strategyId={strategy.id} />

            <BacktestDetails
              strategyId={strategy.id}
              backtestId={selectedBacktestId}
            />

            <BacktestHistoryPanel
              strategyId={strategy.id}
              onViewDetails={handleViewBacktestDetails}
            />
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-3.5 min-w-0">
            <StrategyFlowPanel
              draftVersion={strategy.draftConfigVersion}
              liveVersion={strategy.liveConfigVersion}
              draftConfig={strategy.draftConfigJson}
              liveConfig={strategy.liveConfigJson}
              onFullscreen={handleFullscreenFlow}
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
