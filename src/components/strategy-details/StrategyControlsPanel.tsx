"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCloseAllPositions } from "@/lib/api/mutations";
import { useStrategyPositions } from "@/lib/api/queries";

interface StrategyControlsPanelProps {
  strategyId: string;
  isLoading?: boolean;
}

export function StrategyControlsPanel({
  strategyId,
  isLoading = false,
}: Partial<StrategyControlsPanelProps>) {
  const { data: positionsData } = useStrategyPositions(strategyId ?? "", {
    enabled: !!strategyId && !isLoading,
  });
  const { mutate: closeAll, isPending } = useCloseAllPositions();

  if (isLoading || !strategyId) {
    return <StrategyControlsPanelSkeleton />;
  }

  const hasOpenPositions = (positionsData?.data.length ?? 0) > 0;

  const handleCloseAll = () => {
    closeAll(strategyId);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Controls</h2>
        <span className="pill pill-warn flex items-center gap-1.5">
          <AlertTriangle size={12} />
          Careful
        </span>
      </div>

      <div className="panel-body">
        <button
          onClick={handleCloseAll}
          disabled={isPending || !hasOpenPositions}
          className="btn-danger px-4 py-2 text-[13px] rounded-xl w-full disabled:opacity-50 disabled:cursor-not-allowed relative flex items-center justify-center"
        >
          <span className={isPending ? "opacity-0" : ""}>
            Close All Strategy Positions
          </span>
          {isPending && (
            <Loader2 size={16} className="animate-spin absolute" />
          )}
        </button>

        {!hasOpenPositions && (
          <p className="text-xs text-foreground-muted text-center mt-2">
            No open positions to close
          </p>
        )}
      </div>
    </div>
  );
}

export function StrategyControlsPanelSkeleton() {
  return (
    <div className="panel">
      <div className="panel-header">
        <Skeleton className="h-4 w-20 bg-background-overlay" />
        <Skeleton className="h-6 w-20 rounded-full bg-background-overlay" />
      </div>
      <div className="panel-body">
        <Skeleton className="h-10 w-full rounded-xl bg-background-overlay" />
      </div>
    </div>
  );
}
