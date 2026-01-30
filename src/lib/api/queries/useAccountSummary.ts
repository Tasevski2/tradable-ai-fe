import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { AccountSummary, ApiResponse } from "@/types/api";

export function useAccountSummary() {
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: queryKeys.account.summary(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AccountSummary | null>>(
        API_ENDPOINTS.ACCOUNTS.SUMMARY
      );
      return response.data;
    },
    enabled: isAuthenticated,
  });
}
