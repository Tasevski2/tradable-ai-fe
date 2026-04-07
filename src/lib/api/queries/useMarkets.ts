import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { ApiResponse } from "@/types/api";

export function useMarkets() {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: queryKeys.markets.list(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<string[]>>(
        API_ENDPOINTS.MARKETS.LIST,
      );
      return response.data;
    },
    enabled: isAuthenticated,
  });
}
