import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { SetApiKeysResponse, ApiResponse } from "@/types/api";
import type { ApiKeysFormData } from "@/lib/validations/apiKeys";

export function useSetApiKeys() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApiKeysFormData) => {
      const response = await apiClient.post<ApiResponse<SetApiKeysResponse>>(
        API_ENDPOINTS.ACCOUNTS.SET_API_KEYS,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account.all });
    },
  });
}
