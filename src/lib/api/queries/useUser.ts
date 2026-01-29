import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { User, ApiResponse } from "@/types/api";

interface UseUserOptions {
  enabled?: boolean;
}

export function useUser(options: UseUserOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.USERS.ME);
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
