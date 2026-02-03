import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { StrategyOrdersResponse } from "@/types/api";

interface UseStrategyOrdersOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useStrategyOrders(
  strategyId: string,
  options: UseStrategyOrdersOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { page = 1, limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.orders.byStrategy(strategyId, page, limit),
    queryFn: async () => {
      const response = await apiClient.get<StrategyOrdersResponse>(
        API_ENDPOINTS.ORDERS.BY_STRATEGY(strategyId, page, limit),
      );
      return response;
    },
    enabled: isAuthenticated && enabled && !!strategyId,
  });
}
