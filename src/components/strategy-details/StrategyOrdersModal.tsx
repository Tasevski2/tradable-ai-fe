"use client";

import { Modal } from "@/components/ui/Modal";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { TableBodySkeleton } from "@/components/ui/TableBodySkeleton";
import { cn } from "@/lib/utils/cn";
import { formatDateTime, formatSmartCurrency } from "@/lib/utils/format";
import { useStrategyOrders } from "@/lib/api/queries";
import { usePaginationInfo, usePaginatedModal } from "@/hooks";
import { getOrderStatusPillClass, getSidePillClass } from "@/lib/utils/status";

interface StrategyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: string;
}

export function StrategyOrdersModal({
  isOpen,
  onClose,
  strategyId,
}: StrategyOrdersModalProps) {
  const { page, setPage, limit } = usePaginatedModal({ isOpen });

  const { data, isLoading } = useStrategyOrders(strategyId, {
    page,
    limit,
    enabled: isOpen,
  });

  const orders = data?.data ?? [];
  const paginationInfo = usePaginationInfo(data?.pagination);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Strategy Orders"
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
            <th>Symbol</th>
            <th>Side</th>
            <th>Close Order</th>
            <th>Avg Price</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Filled At</th>
          </tr>
        </thead>
        {isLoading ? (
          <TableBodySkeleton columns={7} />
        ) : (
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-8 text-foreground-muted"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="font-medium">{order.symbol}</td>
                  <td>
                    <span
                      className={cn(
                        "font-semibold",
                        getSidePillClass(order.side),
                      )}
                    >
                      {order.side}
                    </span>
                  </td>
                  <td>
                    {order.reduceOnly ? (
                      <span className="text-bullish font-medium">Yes</span>
                    ) : (
                      <span className="text-foreground-muted">No</span>
                    )}
                  </td>
                  <td>
                    {order.avgPrice
                      ? formatSmartCurrency(order.avgPrice, 4)
                      : "—"}
                  </td>
                  <td>{order.qty}</td>
                  <td>
                    <span className={getOrderStatusPillClass(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="text-foreground-muted">
                    {formatDateTime(order.updatedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        )}
      </table>
    </Modal>
  );
}
