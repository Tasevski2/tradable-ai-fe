"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { useStrategy } from "@/lib/api/queries";
import { is404Error } from "@/lib/utils/errors";
import {
  BuilderHeader,
  BuilderHeaderSkeleton,
  ChatPanel,
  ChatPanelSkeleton,
  ChartDiagramPanel,
  ChartDiagramPanelSkeleton,
  BacktestPanel,
  BacktestPanelSkeleton,
} from "@/components/strategy-builder";

interface StrategyBuilderPageProps {
  params: Promise<{
    strategyId: string;
  }>;
}

export default function StrategyBuilderPage({
  params,
}: StrategyBuilderPageProps) {
  const { strategyId } = use(params);

  const [selectedBacktestId, setSelectedBacktestId] = useState<string | undefined>();

  const { data: strategy, isLoading, error } = useStrategy(strategyId);

  // Handle 404 error
  if (is404Error(error)) {
    notFound();
  }

  // Handle other errors
  if (error && !is404Error(error)) {
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
    return <StrategyBuilderPageSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Sticky Header */}
      <BuilderHeader
        strategyId={strategy.id}
        name={strategy.name}
        description={strategy.description}
        status={strategy.status}
      />

      {/* Main Content - Fullscreen Grid */}
      <main className="flex-1 h-[calc(100vh-64px)] grid grid-cols-[420px_1fr] gap-3 p-3 overflow-hidden">
        {/* Left: Chat Panel (full height) */}
        <div className="h-full min-h-0 overflow-hidden">
          <ChatPanel
            strategyId={strategy.id}
            draftVersion={strategy.draftConfigVersion}
            liveVersion={strategy.liveConfigVersion}
          />
        </div>

        {/* Right: Scrollable Column */}
        <div className="h-full min-h-0 overflow-y-auto pr-0.5 flex flex-col gap-3">
          {/* Chart / Diagram Panel */}
          <div className="shrink-0">
            <ChartDiagramPanel
              strategyId={strategy.id}
              draftConfigJson={strategy.draftConfigJson}
              liveConfigJson={strategy.liveConfigJson}
              draftVersion={strategy.draftConfigVersion}
              liveVersion={strategy.liveConfigVersion}
              activeBacktestId={selectedBacktestId}
            />
          </div>

          {/* Backtests Panel */}
          <div className="shrink-0">
            <BacktestPanel
              strategyId={strategy.id}
              draftConfigJson={strategy.draftConfigJson}
              selectedBacktestId={selectedBacktestId}
              onBacktestSelect={setSelectedBacktestId}
            />
          </div>

          {/* Bottom padding for scroll comfort */}
          <div className="h-1" />
        </div>
      </main>
    </div>
  );
}

function StrategyBuilderPageSkeleton() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <BuilderHeaderSkeleton />
      <main className="flex-1 h-[calc(100vh-64px)] grid grid-cols-[420px_1fr] gap-3 p-3 overflow-hidden">
        <div className="h-full min-h-0 overflow-hidden">
          <ChatPanelSkeleton />
        </div>
        <div className="h-full min-h-0 overflow-y-auto pr-0.5 flex flex-col gap-3">
          <div className="shrink-0">
            <ChartDiagramPanelSkeleton />
          </div>
          <div className="shrink-0">
            <BacktestPanelSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}
