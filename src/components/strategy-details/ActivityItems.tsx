"use client";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { formatRelativeTime, formatValue } from "@/lib/utils/format";
import {
  getBacktestStatusDisplay,
  getBacktestStatusPillClass,
} from "@/lib/utils/status";
import { getPositionSide, getPositionSideClass } from "@/lib/utils/position";
import { getTimeframeLabel } from "@/lib/utils/timeframe";
import { ActivityTypeEnum } from "@/types/common";
import type {
  StrategyActivityItem,
  FilledOrderActivityData,
  BacktestActivityData,
  AiUpdateActivityData,
} from "@/types/api";

function OrderFilledActivity({ data }: { data: FilledOrderActivityData }) {
  const side = getPositionSide(data.positionIdx);
  const sideClass = getPositionSideClass(data.positionIdx);
  const closeLabel = data.isCloseOrder ? " (Close)" : "";

  return (
    <>
      <strong className="text-[13px] text-foreground">
        Order Filled • {data.symbol}{" "}
        <span className={sideClass}>
          {side}
          {closeLabel}
        </span>
      </strong>
      <p className="text-xs text-foreground-muted mt-1.5">
        Avg price {formatValue(data.avgPrice)} • Qty {formatValue(data.qty)}
      </p>
    </>
  );
}

function BacktestActivity({ data }: { data: BacktestActivityData }) {
  return (
    <>
      <strong className="text-[13px] text-foreground">
        Backtest Run • {data.symbol} • {getTimeframeLabel(data.timeframe)}
      </strong>
      <div className="mt-1.5">
        <span className={cn("pill", getBacktestStatusPillClass(data.status))}>
          {getBacktestStatusDisplay(data.status)}
        </span>
      </div>
    </>
  );
}

function AiUpdateActivity({ data }: { data: AiUpdateActivityData }) {
  return (
    <>
      <strong className="text-[13px] text-foreground">
        Draft Updated by AI
      </strong>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="text-xs text-foreground-muted mt-1.5 truncate max-w-full cursor-default">
            {data.messageContent}
          </p>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {data.messageContent}
        </TooltipContent>
      </Tooltip>
    </>
  );
}

export function ActivityCard({ activity }: { activity: StrategyActivityItem }) {
  const renderActivityContent = () => {
    switch (activity.type) {
      case ActivityTypeEnum.ORDER_FILLED:
        return (
          <OrderFilledActivity
            data={activity.data as FilledOrderActivityData}
          />
        );
      case ActivityTypeEnum.BACKTEST:
        return (
          <BacktestActivity data={activity.data as BacktestActivityData} />
        );
      case ActivityTypeEnum.AI_STRATEGY_UPDATED:
        return (
          <AiUpdateActivity data={activity.data as AiUpdateActivityData} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="event-card">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">{renderActivityContent()}</div>
        <span className="text-xs text-foreground-subtle whitespace-nowrap">
          {formatRelativeTime(activity.timestamp)}
        </span>
      </div>
    </div>
  );
}
