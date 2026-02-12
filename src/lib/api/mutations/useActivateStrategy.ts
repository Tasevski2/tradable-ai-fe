import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";

interface SuccessResponse {
  success: boolean;
}

export function useActivateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (strategyId: string) => {
      return apiClient.post<SuccessResponse>(
        API_ENDPOINTS.STRATEGIES.ACTIVATE(strategyId),
        {},
      );
    },
    onSuccess: (_, strategyId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.strategies.detail(strategyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.strategies.listPrefix(),
      });
    },
  });
}
