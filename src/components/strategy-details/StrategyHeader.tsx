"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Pause, Play, Rocket, Loader2 } from "lucide-react";
import { StrategyStatusEnum } from "@/types/common";
import { Skeleton } from "@/components/ui/Skeleton";
import { StrategySettingsModal } from "./StrategySettingsModal";
import { DeployModal } from "./DeployModal";
import { useActivateStrategy, usePauseStrategy } from "@/lib/api/mutations";

interface StrategyHeaderProps {
  strategyId: string;
  name: string;
  description: string | null;
  status: StrategyStatusEnum;
}

export function StrategyHeader({
  strategyId,
  name,
  description,
  status,
}: StrategyHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);

  const { mutate: activate, isPending: isActivating } = useActivateStrategy();
  const { mutate: pause, isPending: isPausing } = usePauseStrategy();

  const isConfigured = status !== StrategyStatusEnum.NOT_CONFIGURED;
  const isLive = status === StrategyStatusEnum.LIVE;
  const isLoading = isActivating || isPausing;

  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-gradient-to-b from-background/90 to-background/65 border-b border-border">
      <div className="max-w-[1240px] mx-auto px-4 py-3.5">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex flex-col gap-1 min-w-[240px]">
            <h1 className="text-base font-semibold tracking-wide">{name}</h1>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href={`/strategies/${strategyId}`}
              className="btn-secondary px-3 py-2 text-[13px] rounded-xl"
            >
              Open Builder
            </Link>

            <button
              onClick={() => setIsDeployOpen(true)}
              className="btn-primary px-3 py-2 text-[13px] rounded-xl flex items-center gap-2"
            >
              <Rocket size={14} />
              Deploy
            </button>

            {isConfigured && (
              <button
                onClick={() => isLive ? pause(strategyId) : activate(strategyId)}
                disabled={isLoading}
                className="btn-danger px-3 py-2 text-[13px] rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isLive ? (
                  <>
                    <Pause size={14} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Resume
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="btn-ghost p-2 rounded-xl"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      <StrategySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        strategyId={strategyId}
        currentName={name}
        currentDescription={description}
      />

      <DeployModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        strategyId={strategyId}
      />
    </div>
  );
}

export function StrategyHeaderSkeleton() {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-gradient-to-b from-background/90 to-background/65 border-b border-border">
      <div className="max-w-[1240px] mx-auto px-4 py-3.5">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex flex-col gap-1 min-w-[240px]">
            <Skeleton className="h-5 w-64 bg-background-overlay" />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-28 rounded-xl bg-background-overlay" />
            <Skeleton className="h-9 w-24 rounded-xl bg-background-overlay" />
            <Skeleton className="h-9 w-9 rounded-xl bg-background-overlay" />
          </div>
        </div>
      </div>
    </div>
  );
}
