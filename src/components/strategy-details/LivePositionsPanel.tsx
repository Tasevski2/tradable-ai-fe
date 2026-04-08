"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { useStrategyPositions } from "@/lib/api/queries";
import { useClosePosition } from "@/lib/api/mutations";
import { usePaginationInfo } from "@/hooks";
import { formatValue } from "@/lib/utils/format";
import { getPositionSide, getPositionSideClass } from "@/lib/utils/position";
import { StrategyOrdersModal } from "./StrategyOrdersModal";

interface LivePositionsPanelProps {
  strategyId: string;
}

interface ClosePositionButtonProps {
  strategyId: string;
  symbol: string;
}

function ClosePositionButton({ strategyId, symbol }: ClosePositionButtonProps) {
  const closePositionMutation = useClosePosition();
  const isPending = closePositionMutation.isPending;

  return (
    <button
      onClick={() => closePositionMutation.mutate({ strategyId, symbol })}
      disabled={isPending}
      className="btn-danger px-2.5 py-1 text-xs rounded-lg relative disabled:cursor-not-allowed"
    >
      <span className={isPending ? "opacity-0" : ""}>Close</span>
      {isPending && (
        <Loader2 className="absolute inset-0 m-auto h-3 w-3 animate-spin" />
      )}
    </button>
  );
}

export function LivePositionsPanel({ strategyId }: LivePositionsPanelProps) {
  const [page, setPage] = useState(1);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  const { data, isLoading } = useStrategyPositions(strategyId, {
    page,
  });

  const positions = data?.data || [];
  const {
    startItem,
    endItem,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  } = usePaginationInfo(data?.pagination);

  const handleViewOrders = () => {
    setIsOrdersModalOpen(true);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Live Positions</h2>
        <button
          onClick={handleViewOrders}
          className="btn-secondary px-3 py-1.5 text-[13px] rounded-xl"
        >
          View Orders
        </button>
      </div>

      <div className="panel-body p-0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Side</th>
              <th>Qty</th>
              <th>Entry</th>
              <th>Actions</th>
            </tr>
          </thead>
          {isLoading || !data ? (
            <LivePositionsTableBodySkeleton />
          ) : (
            <tbody>
              {positions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-foreground-muted"
                  >
                    No open positions
                  </td>
                </tr>
              ) : (
                positions.map((position) => (
                  <tr key={position.id}>
                    <td>
                      <strong className="text-foreground">
                        {position.symbol}
                      </strong>
                    </td>
                    <td className={getPositionSideClass(position.positionIdx)}>
                      {getPositionSide(position.positionIdx)}
                    </td>
                    <td>{formatValue(position.allocatedQty)}</td>
                    <td>
                      {position.entryPrice
                        ? formatValue(position.entryPrice)
                        : "—"}
                    </td>
                    <td>
                      <ClosePositionButton
                        strategyId={strategyId}
                        symbol={position.symbol}
                      />
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

      <StrategyOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        strategyId={strategyId}
      />
    </div>
  );
}

function LivePositionsTableBodySkeleton() {
  return (
    <tbody>
      {[...Array(3)].map((_, i) => (
        <tr key={i}>
          <td>
            <Skeleton className="h-4 w-20 bg-background-overlay" />
          </td>
          <td>
            <Skeleton className="h-4 w-12 bg-background-overlay" />
          </td>
          <td>
            <Skeleton className="h-4 w-14 bg-background-overlay" />
          </td>
          <td>
            <Skeleton className="h-4 w-16 bg-background-overlay" />
          </td>
          <td>
            <Skeleton className="h-6 w-14 rounded-lg bg-background-overlay" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export function LivePositionsPanelSkeleton() {
  return (
    <div className="panel">
      <div className="panel-header">
        <Skeleton className="h-4 w-28 bg-background-overlay" />
        <Skeleton className="h-8 w-24 rounded-xl bg-background-overlay" />
      </div>
      <div className="panel-body p-0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Side</th>
              <th>Qty</th>
              <th>Entry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, i) => (
              <tr key={i}>
                <td>
                  <Skeleton className="h-4 w-20 bg-background-overlay" />
                </td>
                <td>
                  <Skeleton className="h-4 w-12 bg-background-overlay" />
                </td>
                <td>
                  <Skeleton className="h-4 w-14 bg-background-overlay" />
                </td>
                <td>
                  <Skeleton className="h-4 w-16 bg-background-overlay" />
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
