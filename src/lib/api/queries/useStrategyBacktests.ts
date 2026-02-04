import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { PaginatedResponse, BacktestListItem } from "@/types/api";

interface UseStrategyBacktestsOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useStrategyBacktests(
  strategyId: string,
  options: UseStrategyBacktestsOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { page = 1, limit = 5, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.backtests.byStrategy(strategyId, page, limit),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<BacktestListItem>>(
        API_ENDPOINTS.BACKTESTS.BY_STRATEGY(strategyId, page, limit),
      );
      return response;
    },
    enabled: isAuthenticated && enabled && !!strategyId,
  });
}
