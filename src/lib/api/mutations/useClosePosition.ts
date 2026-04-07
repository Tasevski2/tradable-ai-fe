import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse, ClosePositionResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/utils/errors";

interface ClosePositionParams {
  strategyId: string;
  symbol: string;
}

export function useClosePosition() {
  return useMutation({
    mutationFn: async ({ strategyId, symbol }: ClosePositionParams) => {
      const response = await apiClient.post<ApiResponse<ClosePositionResponse>>(
        API_ENDPOINTS.POSITIONS.CLOSE(strategyId, symbol),
        {},
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Close order submitted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to close position"));
    },
  });
}
