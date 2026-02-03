"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { formatDateTime, formatSmartCurrency } from "@/lib/utils/format";
import { useStrategyOrders } from "@/lib/api/queries";
import { usePaginationInfo } from "@/hooks";
import { OrderSideEnum, OrderStatus } from "@/types/common";

interface StrategyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: string;
}

function getSidePillClass(side: OrderSideEnum): string {
  return side === OrderSideEnum.BUY ? "text-bullish" : "text-bearish";
}

function getStatusPillClass(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.FILLED:
    case OrderStatus.TRIGGERED:
      return "pill pill-ok";
    case OrderStatus.CANCELLED:
    case OrderStatus.REJECTED:
    case OrderStatus.DEACTIVATED:
    case OrderStatus.PARTIALLY_FILLED_CANCELLED:
      return "pill pill-error";
    case OrderStatus.NEW:
    case OrderStatus.PARTIALLY_FILLED:
    case OrderStatus.UNTRIGGERED:
    case OrderStatus.SENT:
    default:
      return "pill pill-muted";
  }
}

function OrdersTableSkeleton() {
  return (
    <tbody>
      {[...Array(10)].map((_, i) => (
        <tr key={i}>
          {[...Array(7)].map((_, j) => (
            <td key={j}>
              <Skeleton className="h-5 w-20 bg-background-overlay" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export function StrategyOrdersModal({
  isOpen,
  onClose,
  strategyId,
}: StrategyOrdersModalProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useStrategyOrders(strategyId, {
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

  const orders = data?.data || [];
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
            Strategy Orders
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
              <OrdersTableSkeleton />
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
                        <span className={getStatusPillClass(order.status)}>
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
        </div>

        {/* Footer with Pagination */}
        {paginationInfo && orders.length > 0 && (
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
