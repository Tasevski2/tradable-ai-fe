import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse, ClosePositionResponse } from "@/types/api";

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
    // No query invalidation for now - will be added later
  });
}
