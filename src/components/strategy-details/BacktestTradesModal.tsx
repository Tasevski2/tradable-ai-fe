"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import {
  formatDateTime,
  formatSmartCurrency,
  formatPnlPercent,
} from "@/lib/utils/format";
import { useBacktestTrades } from "@/lib/api/queries";
import { usePaginationInfo } from "@/hooks";
import { OrderSideEnum } from "@/types/common";

interface BacktestTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: string;
  backtestId: string;
}

function getSidePillClass(side: OrderSideEnum): string {
  return side === OrderSideEnum.BUY ? "text-bullish" : "text-bearish";
}

function TradesTableSkeleton() {
  return (
    <tbody>
      {[...Array(10)].map((_, i) => (
        <tr key={i}>
          {[...Array(8)].map((_, i) => (
            <td key={i}>
              <Skeleton className="h-5 w-20 bg-background-overlay" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function BacktestTradesModal({
  isOpen,
  onClose,
  strategyId,
  backtestId,
}: BacktestTradesModalProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useBacktestTrades(strategyId, backtestId, {
    page,
    limit,
    enabled: isOpen,
  });

  // Reset page when modal opens
  useEffect(() => {
    if (isOpen) {
      setPage(1);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  const trades = data?.data ?? [];
  const paginationInfo = data?.pagination
    ? usePaginationInfo(data.pagination)
    : null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-5xl mx-4 bg-card border border-border rounded-lg shadow-xl animate-scale-in max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            Backtest Trades
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-auto flex-1">
          <table className="data-table">
            <thead>
              <tr>
                <th>Side</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>Qty</th>
                <th>PnL USD</th>
                <th>PnL %</th>
              </tr>
            </thead>
            {isLoading ? (
              <TradesTableSkeleton />
            ) : (
              <tbody>
                {trades.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-8 text-foreground-muted"
                    >
                      No trades found
                    </td>
                  </tr>
                ) : (
                  trades.map((trade) => {
                    const isPnlPositive = !trade.pnlUsd.startsWith("-");
                    return (
                      <tr key={trade.id}>
                        <td>
                          <span
                            className={cn(
                              "font-semibold",
                              getSidePillClass(trade.side),
                            )}
                          >
                            {trade.side}
                          </span>
                        </td>
                        <td className="text-foreground-muted">
                          {formatDateTime(trade.entryT)}
                        </td>
                        <td className="text-foreground-muted">
                          {formatDateTime(trade.exitT)}
                        </td>
                        <td>{formatSmartCurrency(trade.entryPrice, 4)}</td>
                        <td>{formatSmartCurrency(trade.exitPrice, 4)}</td>
                        <td>{trade.qty ?? "—"}</td>
                        <td
                          className={cn(
                            "font-semibold",
                            isPnlPositive ? "text-bullish" : "text-bearish",
                          )}
                        >
                          {formatSmartCurrency(trade.pnlUsd)}
                        </td>
                        <td
                          className={cn(
                            "font-semibold",
                            isPnlPositive ? "text-bullish" : "text-bearish",
                          )}
                        >
                          {formatPnlPercent(trade.pnlPct)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* Footer with Pagination */}
        {paginationInfo && trades.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
            <span className="text-xs text-foreground-subtle">
              Showing {paginationInfo.startItem}–{paginationInfo.endItem} from{" "}
              {paginationInfo.totalItems}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!paginationInfo.hasPreviousPage}
                className="btn-secondary px-3 py-1.5 text-[13px] rounded-xl flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(paginationInfo.totalPages, p + 1))
                }
                disabled={!paginationInfo.hasNextPage}
                className="btn-secondary px-3 py-1.5 text-[13px] rounded-xl flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(modalContent, document.body);
}
