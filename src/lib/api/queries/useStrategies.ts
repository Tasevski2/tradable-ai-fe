import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { StrategiesListResponse } from "@/types/api";
import type { StrategyStatusEnum } from "@/types/common";

interface UseStrategiesParams {
  limit?: number;
  sortOrder?: "asc" | "desc";
  page?: number;
  status?: StrategyStatusEnum;
  search?: string;
}

export function useStrategies(params: UseStrategiesParams = {}) {
  const isAuthenticated = useIsAuthenticated();
  const { limit = 10, sortOrder = "desc", page = 1, status, search } = params;

  return useQuery({
    queryKey: queryKeys.strategies.list({ limit, sortOrder, page, status, search }),
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        limit: String(limit),
        sortOrder,
        page: String(page),
      });

      if (status) {
        searchParams.set("status", status);
      }

      if (search) {
        searchParams.set("search", search);
      }

      return apiClient.get<StrategiesListResponse>(
        `${API_ENDPOINTS.STRATEGIES.BASE}?${searchParams}`,
      );
    },
    enabled: isAuthenticated,
  });
}
