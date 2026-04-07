import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse, ClosePositionResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/utils/errors";

export function useCloseAllPositions() {
  return useMutation({
    mutationFn: async (strategyId: string) => {
      const response = await apiClient.post<ApiResponse<ClosePositionResponse>>(
        API_ENDPOINTS.POSITIONS.CLOSE_ALL(strategyId),
        {},
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Close orders submitted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to close positions"));
    },
  });
}
