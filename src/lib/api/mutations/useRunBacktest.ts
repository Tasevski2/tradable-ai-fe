import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { RunBacktestDto, RunBacktestResponse } from "@/types/api";
import { queryKeys } from "../queryKeys";
import { getErrorMessage } from "@/lib/utils/errors";

interface RunBacktestParams {
  strategyId: string;
  data?: RunBacktestDto;
}

export function useRunBacktest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ strategyId, data }: RunBacktestParams) => {
      return apiClient.post<RunBacktestResponse>(
        API_ENDPOINTS.BACKTESTS.RUN(strategyId),
        data ?? {},
      );
    },
    onSuccess: (_, { strategyId }) => {
      // Invalidate backtest list/table (partial key matches all pagination)
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtests.byStrategyPrefix(strategyId),
      });
      // Invalidate latest backtest query
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtests.latest(strategyId),
      });
      // Invalidate latest equity data
      queryClient.invalidateQueries({
        queryKey: queryKeys.backtests.equityLatest(strategyId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to start backtest"));
    },
  });
}
