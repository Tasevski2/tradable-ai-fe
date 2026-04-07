import {
  StrategyStatusEnum,
  BacktestStatusEnum,
  OrderStatus,
  OrderSideEnum,
} from "@/types/common";
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

/**
 * Returns the CSS modifier appended to the `badge-dot` class to colour the
 * dot indicator in strategy status badges (e.g. `badge-dot paused`).
 */
export function getStrategyStatusDotClass(status: StrategyStatusEnum): string {
  switch (status) {
    case StrategyStatusEnum.LIVE:
      return "";
    case StrategyStatusEnum.PAUSED:
      return "paused";
    case StrategyStatusEnum.NOT_CONFIGURED:
      return "error";
  }
}

/** Human-readable label for a strategy status. */
export function getStrategyStatusLabel(status: StrategyStatusEnum): string {
  return STRATEGY_STATUS_STYLES[status]?.label ?? "Unknown";
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

/** Returns the `pill-*` modifier class for a backtest status badge. */
export function getBacktestStatusPillClass(status: BacktestStatusEnum): string {
  switch (status) {
    case BacktestStatusEnum.SUCCESS:
      return "pill-ok";
    case BacktestStatusEnum.RUNNING:
    case BacktestStatusEnum.QUEUED:
      return "pill-warn";
    case BacktestStatusEnum.ERROR:
      return "pill-bad";
    default:
      return "";
  }
}

/** Returns the text colour class for an order side (BUY = bullish, SELL = bearish). */
export function getSidePillClass(side: OrderSideEnum): string {
  return side === OrderSideEnum.BUY ? "text-bullish" : "text-bearish";
}

/** Returns the full `pill pill-*` class string for an order status badge. */
export function getOrderStatusPillClass(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.FILLED:
    case OrderStatus.TRIGGERED:
      return "pill pill-ok";
    case OrderStatus.CANCELLED:
    case OrderStatus.REJECTED:
    case OrderStatus.DEACTIVATED:
    case OrderStatus.PARTIALLY_FILLED_CANCELLED:
      return "pill pill-error";
    case OrderStatus.NEW:
    case OrderStatus.PARTIALLY_FILLED:
    case OrderStatus.UNTRIGGERED:
    case OrderStatus.SENT:
    default:
      return "pill pill-muted";
  }
}
