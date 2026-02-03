import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { StrategyMarketsListResponse } from "@/types/api";

interface UseStrategyMarketsListOptions {
  search?: string;
  limit?: number;
  enabled?: boolean;
}

export function useStrategyMarketsList(
  strategyId: string,
  options: UseStrategyMarketsListOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { search, limit = 10, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: queryKeys.markets.byStrategy(strategyId, search),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<StrategyMarketsListResponse>(
        API_ENDPOINTS.MARKETS.BY_STRATEGY(strategyId, pageParam, limit, search),
      );
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: isAuthenticated && enabled && !!strategyId,
  });
}
