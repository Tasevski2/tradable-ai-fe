"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useStrategyActivities } from "@/lib/api/queries";
import { ActivityCard } from "./ActivityItems";

interface RecentActivityPanelProps {
  strategyId: string;
}

export function RecentActivityPanel({ strategyId }: RecentActivityPanelProps) {
  const { data, isLoading } = useStrategyActivities(strategyId);

  if (isLoading || !data) {
    return <RecentActivityPanelSkeleton />;
  }

  const activities = data;

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
