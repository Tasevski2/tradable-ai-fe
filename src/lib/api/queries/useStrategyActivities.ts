import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { StrategyActivitiesResponse } from "@/types/api";

interface UseStrategyActivitiesOptions {
  enabled?: boolean;
}

export function useStrategyActivities(
  strategyId: string,
  options: UseStrategyActivitiesOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.strategies.activities(strategyId),
    queryFn: async () => {
      const response = await apiClient.get<StrategyActivitiesResponse>(
        API_ENDPOINTS.STRATEGIES.ACTIVITIES(strategyId),
      );
      return response;
    },
    enabled: isAuthenticated && enabled && !!strategyId,
  });
}
