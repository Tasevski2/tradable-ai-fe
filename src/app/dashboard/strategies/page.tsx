"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useStrategies } from "@/lib/api/queries";
import { useDebounce } from "@/hooks/useDebounce";
import { StrategyListCard } from "@/components/strategy/StrategyListCard";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/utils/errors";
import { StrategyStatusEnum } from "@/types/common";

type StatusFilter = StrategyStatusEnum | "all";

const ITEMS_PER_PAGE = 12;

function StrategyCardSkeleton() {
  return (
    <div className="p-4 bg-background border border-border rounded-lg animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-5 w-40 bg-background-overlay" />
          <Skeleton className="h-4 w-24 bg-background-overlay mt-2" />
        </div>
        <Skeleton className="h-6 w-16 bg-background-overlay" />
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        <Skeleton className="flex-1 h-9 bg-background-overlay rounded-lg" />
        <Skeleton className="flex-1 h-9 bg-background-overlay rounded-lg" />
      </div>
    </div>
  );
}

export default function DashboardStrategiesPage() {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, error } = useStrategies({
    limit: ITEMS_PER_PAGE,
    sortOrder,
    page,
    status: status === "all" ? undefined : status,
    search: debouncedSearch || undefined,
  });

  const strategies = data?.data ?? [];
  const pagination = data?.pagination;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: StatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  const handleSortChange = (value: "asc" | "desc") => {
    setSortOrder(value);
    setPage(1);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Strategies</h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search strategies..."
            className="w-full pl-10 pr-4 py-2.5 bg-background-elevated border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(255,215,0,0.1)] transition-all"
          />
        </div>

        <Select value={sortOrder} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[150px] bg-background-elevated">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Last edited</SelectItem>
            <SelectItem value="asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[140px] bg-background-elevated">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any status</SelectItem>
            <SelectItem value={StrategyStatusEnum.LIVE}>Live</SelectItem>
            <SelectItem value={StrategyStatusEnum.PAUSED}>Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <StrategyCardSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-4 py-3">
          {getErrorMessage(error, "Failed to load strategies")}
        </div>
      )}

      {!isLoading && !error && strategies.length === 0 && (
        <div className="text-center py-16 text-foreground-muted border border-dashed border-border rounded-lg">
          <p className="text-lg">No strategies found</p>
          <p className="text-sm mt-1">
            {search || status !== "all"
              ? "Try adjusting your filters"
              : "Create your first strategy to get started"}
          </p>
        </div>
      )}

      {!isLoading && !error && strategies.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strategy) => (
              <StrategyListCard key={strategy.strategyId} strategy={strategy} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <p className="text-sm text-foreground/70">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-background-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium border border-border rounded-lg text-foreground hover:bg-background-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
