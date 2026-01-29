import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { RemoveApiKeysResponse, ApiResponse } from "@/types/api";

export function useRemoveApiKeys() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete<ApiResponse<RemoveApiKeysResponse>>(
        API_ENDPOINTS.ACCOUNTS.REMOVE_API_KEYS,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account.all });
    },
  });
}
