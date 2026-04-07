"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { cn } from "@/lib/utils/cn";
import { formatPnlPercent, formatDateTime } from "@/lib/utils/format";
import {
  getBacktestStatusDisplay,
  getBacktestStatusPillClass,
} from "@/lib/utils/status";
import { useStrategyBacktests } from "@/lib/api/queries";
import { usePaginationInfo } from "@/hooks";
import { BacktestStatusEnum } from "@/types/common";
import { BacktestHistoryTableBodySkeleton } from "@/components/strategy-builder/BacktestHistoryTable";

interface BacktestHistoryPanelProps {
  strategyId: string;
  selectedBacktestId?: string;
  onViewDetails: (backtestId: string) => void;
}

export function BacktestHistoryPanel({
  strategyId,
  selectedBacktestId,
  onViewDetails,
}: BacktestHistoryPanelProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useStrategyBacktests(strategyId, { page });

  const backtests = data?.data || [];
  const {
    startItem,
    endItem,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  } = usePaginationInfo(data?.pagination);

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Backtest History</h2>
      </div>

      <div className="panel-body p-0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Finished</th>
              <th>Symbol</th>
              <th>Version</th>
              <th>Status</th>
              <th>PnL</th>
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
                      selectedBacktestId === backtest.id && "bg-primary/10",
                    )}
                  >
                    <td className="text-foreground-muted">
                      {formatDateTime(backtest.finishedAt)}
                    </td>
                    <td>{backtest.symbol}</td>
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
                        <span className="text-foreground-muted">N/A</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => onViewDetails(backtest.id)}
                        disabled={
                          backtest.status !== BacktestStatusEnum.SUCCESS
                        }
                        className="btn-secondary px-2.5 py-1 text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Details
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
        />
      )}
    </div>
  );
}


export function BacktestHistoryPanelSkeleton() {
  return (
    <div className="panel">
      <div className="panel-header">
        <Skeleton className="h-4 w-32 bg-background-overlay" />
      </div>
      <div className="panel-body p-0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Finished</th>
              <th>Symbol</th>
              <th>Version</th>
              <th>Status</th>
              <th>PnL</th>
              <th></th>
            </tr>
          </thead>
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
        </table>
      </div>
      <div className="panel-footer">
        <Skeleton className="h-4 w-32 bg-background-overlay" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-xl bg-background-overlay" />
          <Skeleton className="h-8 w-20 rounded-xl bg-background-overlay" />
        </div>
      </div>
    </div>
  );
}
