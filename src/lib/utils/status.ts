import { StrategyStatusEnum, BacktestStatusEnum } from "@/types/common";
import { BybitSyncStatusEnum } from "@/types/api";

export interface StatusStyle {
  bg: string;
  text: string;
  label: string;
}

const STRATEGY_STATUS_STYLES: Record<StrategyStatusEnum, StatusStyle> = {
  [StrategyStatusEnum.LIVE]: {
    bg: "bg-bullish/10",
    text: "text-bullish",
    label: "Live",
  },
  [StrategyStatusEnum.PAUSED]: {
    bg: "bg-foreground/15",
    text: "text-foreground/70",
    label: "Paused",
  },
  [StrategyStatusEnum.NOT_CONFIGURED]: {
    bg: "bg-foreground/10",
    text: "text-foreground/50",
    label: "Not Configured",
  },
};

const BYBIT_SYNC_STATUS_STYLES: Record<BybitSyncStatusEnum, StatusStyle> = {
  [BybitSyncStatusEnum.OK]: {
    bg: "bg-bullish/10",
    text: "text-bullish",
    label: "Synced",
  },
  [BybitSyncStatusEnum.IDLE]: {
    bg: "bg-foreground/15",
    text: "text-foreground/70",
    label: "Idle",
  },
  [BybitSyncStatusEnum.ERROR]: {
    bg: "bg-bearish/10",
    text: "text-bearish",
    label: "Error",
  },
};

export function getStrategyStatusStyle(status: StrategyStatusEnum): StatusStyle {
  return STRATEGY_STATUS_STYLES[status] ?? STRATEGY_STATUS_STYLES[StrategyStatusEnum.PAUSED];
}

export function getBybitSyncStatusStyle(status: BybitSyncStatusEnum): StatusStyle {
  return BYBIT_SYNC_STATUS_STYLES[status] ?? BYBIT_SYNC_STATUS_STYLES[BybitSyncStatusEnum.IDLE];
}

/**
 * Get the display text for a backtest status.
 * Shows "queued" as "Running" to avoid confusing users.
 */
export function getBacktestStatusDisplay(status: BacktestStatusEnum): string {
  if (status === BacktestStatusEnum.QUEUED) {
    return "Running";
  }
  // Capitalize first letter for display
  return status.charAt(0).toUpperCase() + status.slice(1);
}
