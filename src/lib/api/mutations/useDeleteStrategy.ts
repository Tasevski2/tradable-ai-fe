import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { ApiResponse, DeleteStrategyResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/utils/errors";

export function useDeleteStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (strategyId: string) => {
      const response = await apiClient.delete<ApiResponse<DeleteStrategyResponse>>(
        API_ENDPOINTS.STRATEGIES.DETAIL(strategyId),
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.strategies.all,
      });
      toast.success("Strategy deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete strategy"));
    },
  });
}
