"use client";

import { useState } from "react";
import { Expand, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { StrategyFlowDiagram } from "@/components/strategy-flow";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";

type TabType = "chart" | "diagram";
type ConfigSource = "draft" | "live";

interface ChartDiagramPanelProps {
  draftConfigJson: unknown | null;
  liveConfigJson: unknown | null;
  draftVersion: number;
  liveVersion: number;
  isLoading?: boolean;
}

export function ChartDiagramPanel({
  draftConfigJson,
  liveConfigJson,
  draftVersion,
  liveVersion,
  isLoading = false,
}: ChartDiagramPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("diagram");
  const [selectedSource, setSelectedSource] = useState<ConfigSource>(
    draftConfigJson != null ? "draft" : "live",
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeConfig =
    selectedSource === "draft" ? draftConfigJson : liveConfigJson;

  if (isLoading) {
    return <ChartDiagramPanelSkeleton />;
  }

  return (
    <div className="panel min-h-[70vh] flex flex-col">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab("chart")}
              className={cn("tab", activeTab === "chart" && "tab-active")}
            >
              Chart
            </button>
            <button
              onClick={() => setActiveTab("diagram")}
              className={cn("tab", activeTab === "diagram" && "tab-active")}
            >
              Diagram
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedSource("draft");
              setActiveTab("diagram");
            }}
            disabled={draftConfigJson == null}
            className={cn(
              "pill cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
              selectedSource === "draft" ? "pill-warn" : "pill-muted",
            )}
          >
            Draft v{draftVersion}
          </button>
          <button
            onClick={() => {
              setSelectedSource("live");
              setActiveTab("diagram");
            }}
            disabled={liveConfigJson == null}
            className={cn(
              "pill cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
              selectedSource === "live" ? "pill-ok" : "pill-muted",
            )}
          >
            Live v{liveVersion}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        {/* Canvas */}
        <div className="flex-1 min-h-0 relative">
          {activeTab === "chart" ? (
            <ChartPlaceholder />
          ) : (
            <div className="absolute inset-0">
              <StrategyFlowDiagram
                config={activeConfig}
                className="rounded-none"
              />
            </div>
          )}

          {/* Fullscreen button */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <button
              onClick={() => setIsFullscreen(true)}
              disabled={activeTab === "chart" || activeConfig == null}
              className="btn-secondary p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              title="Fullscreen"
            >
              <Expand size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <Modal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title="Strategy Flow"
        size="fullscreen"
      >
        <div className="h-full">
          <StrategyFlowDiagram config={activeConfig} />
        </div>
      </Modal>
    </div>
  );
}

function ChartPlaceholder() {
  return (
    <div className="absolute inset-0 rounded-xl border border-dashed border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 flex items-center justify-center">
      <div className="text-center">
        <BarChart3
          size={48}
          className="mx-auto mb-3 text-foreground-muted/50"
        />
        <p className="text-sm text-foreground-muted font-medium">
          Chart Coming Soon
        </p>
        <p className="text-xs text-foreground-subtle mt-1">
          Real-time candlestick chart with trade markers
        </p>
      </div>
    </div>
  );
}

export function ChartDiagramPanelSkeleton() {
  return (
    <div className="panel h-[60vh] min-h-[420px] flex flex-col">
      <div className="panel-header">
        <Skeleton className="h-4 w-40 bg-background-overlay" />
        <div className="flex gap-1.5">
          <Skeleton className="h-8 w-16 rounded-full bg-background-overlay" />
          <Skeleton className="h-8 w-20 rounded-full bg-background-overlay" />
        </div>
      </div>
      <div className="flex-1 p-3.5">
        <div className="flex gap-2 mb-3">
          <Skeleton className="h-6 w-20 rounded-full bg-background-overlay" />
          <Skeleton className="h-6 w-20 rounded-full bg-background-overlay" />
        </div>
        <Skeleton className="h-full rounded-xl bg-background-overlay" />
      </div>
      <div className="panel-footer">
        <Skeleton className="h-4 w-48 bg-background-overlay" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-lg bg-background-overlay" />
          <Skeleton className="h-8 w-20 rounded-lg bg-background-overlay" />
          <Skeleton className="h-8 w-20 rounded-lg bg-background-overlay" />
        </div>
      </div>
    </div>
  );
}
