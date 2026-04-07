"use client";

import { cn } from "@/lib/utils/cn";
import { formatPnlPercent, formatDateTime } from "@/lib/utils/format";
import {
  getBacktestStatusDisplay,
  getBacktestStatusPillClass,
} from "@/lib/utils/status";
import { Skeleton } from "@/components/ui/Skeleton";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { BacktestStatusEnum } from "@/types/common";
import { useStrategyBacktests } from "@/lib/api/queries";
import { usePaginationInfo } from "@/hooks";
import { useState } from "react";

interface BacktestHistoryTableProps {
  strategyId: string;
  selectedId?: string;
  onViewDetails: (backtestId: string) => void;
}

export function BacktestHistoryTable({
  strategyId,
  selectedId,
  onViewDetails,
}: BacktestHistoryTableProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useStrategyBacktests(strategyId, {
    page,
    limit: 10,
  });
  const backtests = data?.data ?? [];
  const {
    startItem,
    endItem,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  } = usePaginationInfo(data?.pagination);

  return (
    <div className="flex flex-col border border-border/40 rounded-xl overflow-hidden bg-black/15">
      {/* Table */}
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Finished</th>
              <th>Symbol</th>
              <th>Ver</th>
              <th>Status</th>
              <th>Result</th>
              <th></th>
            </tr>
          </thead>
          {isLoading || !data ? (
            <BacktestHistoryTableBodySkeleton />
          ) : (
            <tbody>
              {backtests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-foreground-muted"
                  >
                    No backtests yet
                  </td>
                </tr>
              ) : (
                backtests.map((backtest) => (
                  <tr
                    key={backtest.id}
                    className={cn(
                      selectedId === backtest.id && "bg-primary/10",
                    )}
                  >
                    <td className="text-foreground-muted text-xs">
                      {formatDateTime(backtest.finishedAt)}
                    </td>
                    <td className="font-semibold">{backtest.symbol}</td>
                    <td>v{backtest.strategyVersion}</td>
                    <td>
                      <span
                        className={cn(
                          "pill",
                          getBacktestStatusPillClass(backtest.status),
                        )}
                      >
                        {getBacktestStatusDisplay(backtest.status)}
                      </span>
                    </td>
                    <td>
                      {backtest.totalPnlPct ? (
                        <span
                          className={cn(
                            "font-bold",
                            backtest.totalPnlPct.startsWith("-")
                              ? "text-bearish"
                              : "text-bullish",
                          )}
                        >
                          {formatPnlPercent(backtest.totalPnlPct)}
                        </span>
                      ) : (
                        <span className="text-foreground-muted">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => onViewDetails(backtest.id)}
                        disabled={
                          backtest.status !== BacktestStatusEnum.SUCCESS
                        }
                        className="btn-secondary px-2 py-1 text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </table>
      </div>

      {totalItems > 0 && (
        <PaginationControls
          startItem={startItem}
          endItem={endItem}
          totalItems={totalItems}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          onPrevious={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3.5 py-2.5 border-t border-border bg-background/35"
        />
      )}
    </div>
  );
}

export function BacktestHistoryTableBodySkeleton() {
  return (
    <tbody>
      {[...Array(5)].map((_, i) => (
        <tr key={i}>
          <td>
            <Skeleton className="h-4 w-28 bg-background-overlay" />
          </td>
          <td>
            <Skeleton className="h-4 w-16 bg-background-overlay" />
          </td>
          <td>
            <Skeleton className="h-4 w-10 bg-background-overlay" />
          </td>
          <td>
            <Skeleton className="h-6 w-16 rounded-full bg-background-overlay" />
          </td>
          <td>
            <Skeleton className="h-4 w-12 bg-background-overlay" />
          </td>
          <td>
            <Skeleton className="h-6 w-14 rounded-lg bg-background-overlay" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export function BacktestHistoryTableSkeleton() {
  return (
    <div className="flex flex-col border border-border/40 rounded-xl overflow-hidden bg-black/15">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border">
        <Skeleton className="h-4 w-32 bg-background-overlay" />
        <Skeleton className="h-6 w-36 rounded-full bg-background-overlay" />
      </div>
      <div className="p-3.5">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full bg-background-overlay" />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border">
        <Skeleton className="h-4 w-20 bg-background-overlay" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20 rounded-lg bg-background-overlay" />
          <Skeleton className="h-7 w-16 rounded-lg bg-background-overlay" />
        </div>
      </div>
    </div>
  );
}
