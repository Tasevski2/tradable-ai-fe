"use client";

import type { UseFormHandleSubmit } from "react-hook-form";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { StrategyStatusEnum } from "@/types/common";
import type { DeployStrategyFormData } from "@/lib/validations/deployStrategy";
import type { StrategyDetail } from "@/types/api";

interface DeployStrategyLogicSectionProps {
  strategy: StrategyDetail;
  promoteDraft: boolean;
  setPromoteDraft: (value: boolean) => void;
  versionsMatch: boolean;
  noLiveConfig: boolean;
  bothVersionsZero: boolean;
  deployStatus: StrategyStatusEnum;
  setDeployStatus: (status: StrategyStatusEnum) => void;
  deployError: string | null;
  isPending: boolean;
  isDeployDisabled: boolean;
  onClose: () => void;
  handleSubmit: UseFormHandleSubmit<DeployStrategyFormData>;
  onDeploy: (data: DeployStrategyFormData) => void;
}

export function DeployStrategyLogicSection({
  strategy,
  promoteDraft,
  setPromoteDraft,
  versionsMatch,
  noLiveConfig,
  bothVersionsZero,
  deployStatus,
  setDeployStatus,
  deployError,
  isPending,
  isDeployDisabled,
  onClose,
  handleSubmit,
  onDeploy,
}: DeployStrategyLogicSectionProps) {
  return (
    <div className="border border-border rounded-xl p-4 bg-background-overlay/30 flex flex-col justify-between">
      <div>
        <label className="block text-xs font-bold text-foreground-muted uppercase tracking-wide mb-3">
          Strategy Logic
        </label>

        {/* Version pills */}
        <div className="flex items-center gap-2 mb-4">
          <span className="pill pill-warn">
            Draft v{strategy.draftConfigVersion}
          </span>
          <span className="pill pill-ok">
            Live v{strategy.liveConfigVersion}
          </span>
        </div>

        {/* Promote draft checkbox */}
        <div
          onClick={() =>
            !(versionsMatch || noLiveConfig) && setPromoteDraft(!promoteDraft)
          }
          className={cn(
            "flex items-start gap-3 p-3 rounded-xl border transition-colors",
            versionsMatch || noLiveConfig
              ? "border-border/50 bg-background-overlay/20 cursor-not-allowed opacity-70"
              : promoteDraft
                ? "border-primary/50 bg-primary/10 cursor-pointer"
                : "border-border/50 bg-background-overlay/20 hover:bg-background-overlay/40 cursor-pointer",
          )}
        >
          <div
            className={cn(
              "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5",
              promoteDraft
                ? "bg-primary border-primary"
                : "border-border bg-background-overlay/50",
            )}
          >
            {promoteDraft && <Check size={12} className="text-white" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground/90">
              Promote Draft → Live Config
            </div>
            <div className="text-xs text-foreground-muted mt-1">
              {noLiveConfig && !bothVersionsZero
                ? "No live config yet. Draft will be promoted on deploy."
                : versionsMatch
                  ? "Draft and live configs are identical."
                  : "Copies the draft strategy logic into the live strategy used for trading."}
            </div>
          </div>
        </div>

        {!versionsMatch && !noLiveConfig && !promoteDraft && (
          <div className="mt-3 text-xs text-warning">
            Your draft config differs from live. Consider promoting it.
          </div>
        )}

        {/* Deploy status picker */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-foreground-muted uppercase tracking-wide mb-2">
            Strategy Status After Deploy
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setDeployStatus(StrategyStatusEnum.LIVE)}
              className={cn(
                "flex-1 px-3 py-2.5 text-sm rounded-lg border transition-colors",
                deployStatus === StrategyStatusEnum.LIVE
                  ? "border-bullish bg-bullish/10 text-bullish"
                  : "border-border bg-background-overlay/20 text-foreground-muted hover:bg-background-overlay/40",
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-bullish" />
                Live
              </div>
            </button>
            <button
              onClick={() => setDeployStatus(StrategyStatusEnum.PAUSED)}
              className={cn(
                "flex-1 px-3 py-2.5 text-sm rounded-lg border transition-colors",
                deployStatus === StrategyStatusEnum.PAUSED
                  ? "border-warning bg-warning/10 text-warning"
                  : "border-border bg-background-overlay/20 text-foreground-muted hover:bg-background-overlay/40",
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning" />
                Paused
              </div>
            </button>
          </div>
          <p className="text-xs text-foreground-muted/70 mt-2">
            Choose whether the strategy should start trading immediately or
            remain paused.
          </p>
        </div>
      </div>

      {/* Error */}
      {deployError && (
        <div className="mt-4 text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-3 py-2">
          {deployError}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-sm rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onDeploy)}
            disabled={isDeployDisabled}
            className="btn-primary px-4 py-2 text-sm rounded-lg relative disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className={isPending ? "opacity-0" : ""}>
              {strategy.status === StrategyStatusEnum.NOT_CONFIGURED
                ? "Deploy Now"
                : "Deploy Changes"}
            </span>
            {isPending && (
              <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
