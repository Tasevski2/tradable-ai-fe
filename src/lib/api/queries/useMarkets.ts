import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";

interface MarketsResponse {
  data: string[];
}

export function useMarkets() {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: queryKeys.markets.list(),
    queryFn: async () => {
      const response =
        await apiClient.get<MarketsResponse>(API_ENDPOINTS.MARKETS.LIST);
      return response;
    },
    enabled: isAuthenticated,
  });
}
