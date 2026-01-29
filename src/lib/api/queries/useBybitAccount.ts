import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { BybitAccount, ApiResponse } from "@/types/api";

export function useBybitAccount() {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: queryKeys.account.details(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<BybitAccount | null>>(API_ENDPOINTS.ACCOUNTS.BASE);
      return response.data;
    },
    enabled: isAuthenticated,
  });
}
