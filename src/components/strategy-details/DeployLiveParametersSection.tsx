"use client";

import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { AlertTriangle } from "lucide-react";
import { DeployMarketSelector } from "./DeployMarketSelector";
import type { MarketSelectionViewState } from "./useDeployMarketSelection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTimeframeLabel } from "@/lib/utils/timeframe";
import {
  getStrategyStatusDotClass,
  getStrategyStatusLabel,
} from "@/lib/utils/status";
import { cn } from "@/lib/utils/cn";
import { TimeframeEnum } from "@/types/common";
import type { DeployStrategyFormData } from "@/lib/validations/deployStrategy";
import type { StrategyDetail } from "@/types/api";

const TIMEFRAME_OPTIONS = [
  { value: TimeframeEnum.ONE_MIN, label: "1 min" },
  { value: TimeframeEnum.FIVE_MIN, label: "5 min" },
  { value: TimeframeEnum.FIFTEEN_MIN, label: "15 min" },
  { value: TimeframeEnum.ONE_HOUR, label: "1 hour" },
];

interface DeployLiveParametersSectionProps {
  strategy: StrategyDetail;
  control: Control<DeployStrategyFormData>;
  errors: FieldErrors<DeployStrategyFormData>;
  marketSelection: MarketSelectionViewState;
}

export function DeployLiveParametersSection({
  strategy,
  control,
  errors,
  marketSelection,
}: DeployLiveParametersSectionProps) {
  return (
    <div className="border border-border rounded-xl p-4 bg-background-overlay/30">
      <label className="block text-xs font-bold text-foreground-muted uppercase tracking-wide mb-3">
        Live Parameters
      </label>

      {/* Current state badges */}
      <div className="flex flex-wrap gap-2 mb-4">
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
          Current timeframe: {getTimeframeLabel(strategy.timeframe)}
        </span>
        {strategy.perOrderUsd && (
          <span className="badge">
            Current per order: ${strategy.perOrderUsd}
          </span>
        )}
      </div>

      {/* Form inputs */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <div className="text-xs text-foreground-muted/70 mb-1">
            Timeframe
          </div>
          <Controller
            name="timeframe"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(v) => field.onChange(v || undefined)}
              >
                <SelectTrigger
                  className={cn(
                    "w-full bg-background",
                    errors.timeframe && "border-bearish",
                  )}
                >
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAME_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.timeframe && (
            <p className="text-xs text-bearish mt-1">
              {errors.timeframe.message}
            </p>
          )}
        </div>

        <div className="flex-1">
          <div className="text-xs text-foreground-muted/70 mb-1">
            Per order USD
          </div>
          <Controller
            name="perOrderUsd"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="$50.00"
                className={cn(
                  "w-full px-3 py-2.5 text-sm bg-background border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary",
                  errors.perOrderUsd ? "border-bearish" : "border-border",
                )}
              />
            )}
          />
          {errors.perOrderUsd && (
            <p className="text-xs text-bearish mt-1">
              {errors.perOrderUsd.message}
            </p>
          )}
        </div>
      </div>

      {/* Dual-list market selector */}
      <DeployMarketSelector marketSelection={marketSelection} />

      {/* Warning */}
      <div className="mt-4 p-3 rounded-xl border border-warning/30 bg-warning/10 text-warning text-xs font-medium leading-relaxed">
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>
            Changing timeframe or symbols affects future signals. Existing
            positions won&apos;t be closed automatically.
          </span>
        </div>
      </div>
    </div>
  );
}
