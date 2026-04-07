import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { BacktestTradesResponse } from "@/types/api";

interface UseBacktestTradesOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useBacktestTrades(
  strategyId: string,
  backtestId: string,
  options: UseBacktestTradesOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { page = 1, limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.backtests.trades(strategyId, backtestId, page, limit),
    queryFn: async () => {
      const response = await apiClient.get<BacktestTradesResponse>(
        API_ENDPOINTS.BACKTESTS.TRADES(strategyId, backtestId, page, limit),
      );
      return response;
    },
    enabled: isAuthenticated && enabled && !!strategyId && !!backtestId,
    staleTime: Infinity,
  });
}
