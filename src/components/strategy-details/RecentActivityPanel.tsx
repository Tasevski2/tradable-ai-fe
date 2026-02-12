"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/cn";
import { formatRelativeTime, formatValue } from "@/lib/utils/format";
import { getBacktestStatusDisplay } from "@/lib/utils/status";
import { useStrategyActivities } from "@/lib/api/queries";
import {
  ActivityTypeEnum,
  BacktestStatusEnum,
  PositionIdx,
} from "@/types/common";
import type {
  StrategyActivityItem,
  FilledOrderActivityData,
  BacktestActivityData,
  AiUpdateActivityData,
} from "@/types/api";
import { getTimeframeLabel } from "@/lib/utils/timeframe";

interface RecentActivityPanelProps {
  strategyId: string;
}

function getPositionSide(
  positionIdx: PositionIdx,
): "Long" | "Short" | "One-Way" {
  switch (positionIdx) {
    case PositionIdx.LONG:
      return "Long";
    case PositionIdx.SHORT:
      return "Short";
    default:
      return "One-Way";
  }
}

function getPositionSideClass(positionIdx: PositionIdx): string {
  switch (positionIdx) {
    case PositionIdx.LONG:
      return "text-bullish";
    case PositionIdx.SHORT:
      return "text-bearish";
    default:
      return "text-foreground-muted";
  }
}

function getBacktestStatusPillClass(status: BacktestStatusEnum): string {
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

function ActivityCard({ activity }: { activity: StrategyActivityItem }) {
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

export function RecentActivityPanel({ strategyId }: RecentActivityPanelProps) {
  const { data, isLoading } = useStrategyActivities(strategyId);

  if (isLoading || !data) {
    return <RecentActivityPanelSkeleton />;
  }

  const activities = data.data;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Recent Activity</h2>
      </div>

      <div className="panel-body">
        <div className="flex flex-col gap-2.5 max-h-100 overflow-y-auto scrollbar-hide">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-foreground-muted">
              No recent activity
            </div>
          ) : (
            activities.map((activity, index) => (
              <ActivityCard
                key={`${activity.type}-${activity.timestamp}-${index}`}
                activity={activity}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function RecentActivityPanelSkeleton() {
  return (
    <div className="panel">
      <div className="panel-header">
        <Skeleton className="h-4 w-28 bg-background-overlay" />
      </div>
      <div className="panel-body">
        <div className="flex flex-col gap-2.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="event-card">
              <div className="flex items-start justify-between gap-2.5">
                <Skeleton className="h-4 w-40 bg-background-overlay" />
                <Skeleton className="h-3 w-16 bg-background-overlay" />
              </div>
              <Skeleton className="h-3 w-32 bg-background-overlay mt-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
