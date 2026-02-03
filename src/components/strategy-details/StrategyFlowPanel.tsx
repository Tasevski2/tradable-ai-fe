"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";

type ConfigSource = "draft" | "live";

interface StrategyFlowPanelProps {
  draftVersion: number | null;
  liveVersion: number | null;
  draftConfig: unknown | null;
  liveConfig: unknown | null;
  onFullscreen: () => void;
  isLoading?: boolean;
}

export function StrategyFlowPanel({
  draftVersion = 11,
  liveVersion = 12,
  draftConfig = {},
  liveConfig = {},
  onFullscreen,
  isLoading = false,
}: Partial<StrategyFlowPanelProps>) {
  const [activeSource, setActiveSource] = useState<ConfigSource>(draftConfig ? "draft" : "live");

  const hasDraft = draftConfig !== null;
  const hasLive = liveConfig !== null;

  if (isLoading) {
    return <StrategyFlowPanelSkeleton />;
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Strategy Flow</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSource("draft")}
            disabled={!hasDraft}
            className={cn(
              "pill cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              activeSource === "draft" && hasDraft ? "pill-warn" : ""
            )}
          >
            Draft v{draftVersion ?? "–"}
          </button>
          <button
            onClick={() => setActiveSource("live")}
            disabled={!hasLive}
            className={cn(
              "pill cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
              activeSource === "live" && hasLive ? "pill-ok" : ""
            )}
          >
            Live v{liveVersion ?? "–"}
          </button>
        </div>
      </div>

      <div className="panel-body">
        <p className="text-xs text-foreground-subtle mb-3">
          Render your ReactFlow here from the {activeSource} config
        </p>

        <div className="flow-placeholder">
          ReactFlow Diagram Placeholder
          <div className="absolute top-2.5 right-2.5 flex gap-2">
            <button
              onClick={onFullscreen}
              className="btn-secondary px-3 py-1.5 text-[13px] rounded-xl flex items-center gap-1.5"
            >
              <Maximize2 size={14} />
              Fullscreen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StrategyFlowPanelSkeleton() {
  return (
    <div className="panel">
      <div className="panel-header">
        <Skeleton className="h-4 w-28 bg-background-overlay" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-24 rounded-full bg-background-overlay" />
          <Skeleton className="h-7 w-24 rounded-full bg-background-overlay" />
        </div>
      </div>
      <div className="panel-body">
        <Skeleton className="h-3 w-64 bg-background-overlay mb-3" />
        <Skeleton className="h-[440px] w-full rounded-xl bg-background-overlay" />
      </div>
    </div>
  );
}
