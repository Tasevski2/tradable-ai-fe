"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPnlPercent, formatDateTime } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/Skeleton";
import { BacktestStatusEnum } from "@/types/common";
import { useStrategyBacktests } from "@/lib/api/queries";
import { useState } from "react";

interface BacktestHistoryTableProps {
  strategyId: string;
  selectedId?: string;
  onViewDetails: (backtestId: string) => void;
}

function getStatusPillClass(status: BacktestStatusEnum): string {
  switch (status) {
    case BacktestStatusEnum.SUCCESS:
      return "pill-ok";
    case BacktestStatusEnum.RUNNING:
      return "pill-warn";
    case BacktestStatusEnum.ERROR:
      return "pill-bad";
    default:
      return "";
  }
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
  const pagination = data?.pagination ?? {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const { currentPage, totalPages, hasNextPage, hasPreviousPage } = pagination;

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
                          getStatusPillClass(backtest.status),
                        )}
                      >
                        {backtest.status}
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

      {/* Pagination footer */}
      {backtests.length > 0 && (
        <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border bg-background/35">
          <span className="text-xs text-foreground-subtle">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={!hasPreviousPage}
              className="btn-secondary px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={12} />
              Previous
            </button>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={!hasNextPage}
              className="btn-secondary px-2.5 py-1 text-xs rounded-lg flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BacktestHistoryTableBodySkeleton() {
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
