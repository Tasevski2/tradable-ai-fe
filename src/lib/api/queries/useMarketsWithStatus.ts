import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { MarketsWithStatusResponse } from "@/types/api";

interface UseMarketsWithStatusOptions {
  enabled?: boolean;
}

export function useMarketsWithStatus(
  strategyId: string,
  options: UseMarketsWithStatusOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.strategies.marketsWithStatus(strategyId),
    queryFn: async () => {
      const response = await apiClient.get<MarketsWithStatusResponse>(
        API_ENDPOINTS.STRATEGIES.MARKETS_ALL_WITH_STATUS(strategyId),
      );
      return response.data;
    },
    enabled: isAuthenticated && enabled && !!strategyId,
  });
}
