import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse, ClosePositionResponse } from "@/types/api";

export function useCloseAllPositions() {
  return useMutation({
    mutationFn: async (strategyId: string) => {
      const response = await apiClient.post<ApiResponse<ClosePositionResponse>>(
        API_ENDPOINTS.POSITIONS.CLOSE_ALL(strategyId),
        {},
      );
      return response.data;
    },
  });
}
