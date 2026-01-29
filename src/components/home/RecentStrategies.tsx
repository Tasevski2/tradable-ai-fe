"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useStrategies } from "@/lib/api/queries";
import { StrategyListCard } from "@/components/strategy/StrategyListCard";
import { StrategiesSkeleton } from "@/components/ui/Skeleton";
import { getErrorMessage } from "@/lib/utils/errors";

export function RecentStrategies() {
  const { data, isLoading, error } = useStrategies({
    limit: 10,
    sortOrder: "desc",
  });

  const strategies = data?.data ?? [];
  const errorMessage = getErrorMessage(error, "Failed to load strategies");

  if (isLoading) {
    return <StrategiesSkeleton count={3} />;
  }

  if (error) {
    return (
      <div className="bg-background-elevated/80 backdrop-blur-sm border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Strategies</h2>
        </div>
        <div className="text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-4 py-3">
          {errorMessage}
        </div>
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="bg-background-elevated/80 backdrop-blur-sm border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Strategies</h2>
        </div>
        <div className="text-center py-8 text-foreground-muted border border-dashed border-border rounded-lg">
          <p>No strategies yet</p>
          <p className="text-sm mt-1">Create your first strategy above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-elevated/80 backdrop-blur-sm border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Strategies</h2>
        <Link
          href="/dashboard/strategies"
          className="text-sm text-primary hover:text-primary-light transition-colors flex items-center gap-1"
        >
          Browse all
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-3">
        {strategies.map((strategy) => (
          <StrategyListCard key={strategy.strategyId} strategy={strategy} />
        ))}
      </div>
    </div>
  );
}
