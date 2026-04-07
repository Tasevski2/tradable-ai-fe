import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type {
  ApiResponse,
  StrategyDetail,
  UpdateStrategyDto,
} from "@/types/api";
import { getErrorMessage } from "@/lib/utils/errors";

interface UpdateStrategyParams {
  strategyId: string;
  data: UpdateStrategyDto;
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ strategyId, data }: UpdateStrategyParams) => {
      const response = await apiClient.patch<ApiResponse<StrategyDetail>>(
        API_ENDPOINTS.STRATEGIES.DETAIL(strategyId),
        data,
      );
      return response.data;
    },
    onSuccess: (_, { strategyId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.strategies.detail(strategyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.strategies.listPrefix(),
      });
      toast.success("Changes saved");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to save changes"));
    },
  });
}
