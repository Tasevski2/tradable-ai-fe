"use client";

import { Modal } from "@/components/ui/Modal";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { TableBodySkeleton } from "@/components/ui/TableBodySkeleton";
import { cn } from "@/lib/utils/cn";
import {
  formatDateTime,
  formatSmartCurrency,
  formatPnlPercent,
} from "@/lib/utils/format";
import { useBacktestTrades } from "@/lib/api/queries";
import { usePaginationInfo, usePaginatedModal } from "@/hooks";
import { getSidePillClass } from "@/lib/utils/status";

interface BacktestTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: string;
  backtestId: string;
}

const TRADES_PAGE_LIMIT = 10;

export function BacktestTradesModal({
  isOpen,
  onClose,
  strategyId,
  backtestId,
}: BacktestTradesModalProps) {
  const { page, setPage, limit } = usePaginatedModal({ isOpen, limit: TRADES_PAGE_LIMIT });

  const { data, isLoading } = useBacktestTrades(strategyId, backtestId, {
    page,
    limit,
    enabled: isOpen,
  });

  const trades = data?.data ?? [];
  const paginationInfo = usePaginationInfo(data?.pagination);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Backtest Trades"
      size="xl"
      scrollable
      noPadding
      footer={
        paginationInfo.totalItems > 0 ? (
          <PaginationControls
            startItem={paginationInfo.startItem}
            endItem={paginationInfo.endItem}
            totalItems={paginationInfo.totalItems}
            hasPreviousPage={paginationInfo.hasPreviousPage}
            hasNextPage={paginationInfo.hasNextPage}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() =>
              setPage((p) => Math.min(paginationInfo.totalPages, p + 1))
            }
            className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0"
          />
        ) : undefined
      }
    >
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
          <TableBodySkeleton columns={8} />
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
    </Modal>
  );
}
