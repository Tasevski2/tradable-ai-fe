import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { ApiResponse, StrategyDetail } from "@/types/api";

interface UseStrategyOptions {
  enabled?: boolean;
}

export function useStrategy(
  strategyId: string,
  options: UseStrategyOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.strategies.detail(strategyId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<StrategyDetail>>(
        API_ENDPOINTS.STRATEGIES.DETAIL(strategyId),
      );
      return response.data;
    },
    enabled: isAuthenticated && enabled && !!strategyId,
  });
}
