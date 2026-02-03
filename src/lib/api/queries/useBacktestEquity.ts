import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { BacktestEquityResponse } from "@/types/api";

interface UseBacktestEquityOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch backtest equity curve data.
 * If backtestId is provided, fetches equity for that specific backtest.
 * Otherwise, fetches equity for the latest backtest.
 */
export function useBacktestEquity(
  strategyId: string,
  backtestId?: string,
  options: UseBacktestEquityOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { enabled = true } = options;

  return useQuery({
    queryKey: backtestId
      ? queryKeys.backtests.equity(strategyId, backtestId)
      : queryKeys.backtests.equityLatest(strategyId),
    queryFn: async () => {
      const endpoint = backtestId
        ? API_ENDPOINTS.BACKTESTS.EQUITY(strategyId, backtestId)
        : API_ENDPOINTS.BACKTESTS.EQUITY_LATEST(strategyId);

      const response = await apiClient.get<BacktestEquityResponse>(endpoint);
      return response.data;
    },
    enabled: isAuthenticated && enabled && !!strategyId,
  });
}
