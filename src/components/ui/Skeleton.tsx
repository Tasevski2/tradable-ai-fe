import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("bg-background animate-pulse rounded", className)} />;
}

interface StrategiesSkeletonProps {
  count?: number;
}

export function StrategiesSkeleton({ count = 3 }: StrategiesSkeletonProps) {
  return (
    <div className="bg-background-elevated/80 backdrop-blur-sm border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Strategies</h2>
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="grid gap-3">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className="p-4 bg-background border border-border rounded-lg animate-pulse"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <Skeleton className="h-5 w-48 bg-background-overlay" />
                <Skeleton className="h-4 w-24 bg-background-overlay mt-2" />
              </div>
              <Skeleton className="h-6 w-16 bg-background-overlay" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
