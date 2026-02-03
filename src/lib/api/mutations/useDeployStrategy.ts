import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type {
  UpdateLiveConfigDto,
  UpdateLiveConfigResponse,
} from "@/types/api";

interface DeployStrategyParams {
  strategyId: string;
  data: UpdateLiveConfigDto;
}

/**
 * Mutation for deploying/updating a strategy's live configuration.
 * POST /api/strategies/:strategyId/live-config
 */
export function useDeployStrategy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ strategyId, data }: DeployStrategyParams) => {
      return apiClient.put<UpdateLiveConfigResponse>(
        API_ENDPOINTS.STRATEGIES.LIVE_CONFIG(strategyId),
        data,
      );
    },
    onSuccess: (_, { strategyId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.strategies.detail(strategyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.strategies.marketsWithStatus(strategyId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.strategies.all,
      });
    },
  });
}
