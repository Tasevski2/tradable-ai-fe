import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { ApiResponse, StrategyMarketsSummary } from "@/types/api";

interface UseStrategyMarketsOptions {
  enabled?: boolean;
}

export function useStrategyMarkets(
  strategyId: string,
  options: UseStrategyMarketsOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.strategies.markets(strategyId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<StrategyMarketsSummary>>(
        API_ENDPOINTS.STRATEGIES.MARKETS_SUMMARY(strategyId),
      );
      return response.data;
    },
    enabled: isAuthenticated && enabled && !!strategyId,
  });
}
