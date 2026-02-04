"use client";

import { useState } from "react";
import { Expand } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { StrategyFlowDiagram } from "@/components/strategy-flow";
import { cn } from "@/lib/utils/cn";

type ConfigSource = "draft" | "live";

interface StrategyFlowPanelProps {
  draftVersion?: number | null;
  liveVersion?: number | null;
  draftConfig?: unknown | null;
  liveConfig?: unknown | null;
  isLoading?: boolean;
}

export function StrategyFlowPanel({
  draftVersion,
  liveVersion,
  draftConfig,
  liveConfig,
  isLoading = false,
}: StrategyFlowPanelProps) {
  // Default to draft if available, otherwise live
  const [activeSource, setActiveSource] = useState<ConfigSource>(
    draftConfig != null ? "draft" : "live"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasDraft = draftConfig != null;
  const hasLive = liveConfig != null;

  // Get the active config based on selected source
  const activeConfig = activeSource === "draft" ? draftConfig : liveConfig;

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
        <div className="relative h-110">
          <StrategyFlowDiagram config={activeConfig} />
          <div className="absolute top-2.5 right-2.5 z-10">
            <button
              onClick={() => setIsFullscreen(true)}
              disabled={activeConfig == null}
              className="btn-secondary p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Expand size={16} />
            </button>
          </div>
        </div>
      </div>

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
        <Skeleton className="h-110 w-full rounded-xl bg-background-overlay" />
      </div>
    </div>
  );
}
