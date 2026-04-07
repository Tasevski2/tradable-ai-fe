import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { BacktestDetailResponse } from "@/types/api";

interface UseBacktestDetailOptions {
  enabled?: boolean;
}

export function useBacktestDetail(
  strategyId: string,
  backtestId?: string,
  options: UseBacktestDetailOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { enabled = true } = options;

  return useQuery({
    queryKey: backtestId
      ? queryKeys.backtests.detail(strategyId, backtestId)
      : queryKeys.backtests.latest(strategyId),
    queryFn: async () => {
      const endpoint = backtestId
        ? API_ENDPOINTS.BACKTESTS.DETAIL(strategyId, backtestId)
        : API_ENDPOINTS.BACKTESTS.LATEST(strategyId);

      const response = await apiClient.get<BacktestDetailResponse>(endpoint);
      return response.data;
    },
    enabled: isAuthenticated && enabled && !!strategyId,
    staleTime: backtestId ? Infinity : 30_000,
  });
}
