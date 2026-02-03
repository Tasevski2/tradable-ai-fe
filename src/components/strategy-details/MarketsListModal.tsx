"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Search, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "@/hooks";
import { useStrategyMarketsList } from "@/lib/api/queries";

interface MarketsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: string;
}

function MarketsListSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4">
      {[...Array(12)].map((_, i) => (
        <Skeleton key={i} className="h-10 rounded-lg bg-background-overlay" />
      ))}
    </div>
  );
}

export function MarketsListModal({
  isOpen,
  onClose,
  strategyId,
}: MarketsListModalProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useStrategyMarketsList(strategyId, {
      search: debouncedSearch || undefined,
      enabled: isOpen,
    });

  // Infinite scroll trigger
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  // Auto-fetch next page when sentinel is visible
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearch("");
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

  // Flatten pages into single array
  const markets = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.pagination.totalItems ?? 0;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg mx-4 bg-card border border-border rounded-lg shadow-xl animate-scale-in max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Strategy Markets
            </h2>
            {totalCount > 0 && (
              <p className="text-xs text-foreground-muted mt-0.5">
                {totalCount} market{totalCount !== 1 ? "s" : ""} total
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
            />
            <input
              type="text"
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background-overlay border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Markets List */}
        <div className="overflow-auto flex-1 min-h-52">
          {isLoading ? (
            <MarketsListSkeleton />
          ) : markets.length === 0 ? (
            <div className="text-center py-12 text-foreground-muted">
              {debouncedSearch
                ? `No markets found for "${debouncedSearch}"`
                : "No markets available"}
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {markets.map((market) => (
                  <div
                    key={market}
                    className="px-3 py-2.5 bg-background-overlay rounded-lg text-sm font-medium text-foreground text-center"
                  >
                    {market}
                  </div>
                ))}
              </div>

              {/* Load More Sentinel */}
              {hasNextPage && (
                <div
                  ref={loadMoreRef}
                  className="flex justify-center py-4 mt-2"
                >
                  {isFetchingNextPage && (
                    <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(modalContent, document.body);
}
