import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { PaginatedResponse, PositionAllocationItem } from "@/types/api";

interface UseStrategyPositionsOptions {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useStrategyPositions(
  strategyId: string,
  options: UseStrategyPositionsOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { page = 1, limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.positions.byStrategy(strategyId, page, limit),
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<PositionAllocationItem>>(
        API_ENDPOINTS.POSITIONS.BY_STRATEGY(strategyId, page, limit),
      );
      return response;
    },
    enabled: isAuthenticated && enabled && !!strategyId,
  });
}
