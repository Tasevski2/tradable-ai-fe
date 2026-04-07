"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { Modal } from "@/components/ui/Modal";
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

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) setSearch("");
  }, [isOpen]);

  const markets = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.pagination.totalItems ?? 0;
  const subtitle =
    totalCount > 0
      ? `${totalCount} market${totalCount !== 1 ? "s" : ""} total`
      : undefined;

  const searchBar = (
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
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Strategy Markets"
      subtitle={subtitle}
      size="lg"
      scrollable
      noPadding
      subHeader={searchBar}
    >
      <div className="min-h-52">
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

            {hasNextPage && (
              <div ref={loadMoreRef} className="flex justify-center py-4 mt-2">
                {isFetchingNextPage && (
                  <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
