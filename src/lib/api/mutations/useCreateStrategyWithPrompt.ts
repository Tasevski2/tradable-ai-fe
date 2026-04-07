import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import type { ApiResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/utils/errors";

interface CreateStrategyWithPromptRequest {
  message: string;
}

interface CreateStrategyWithPromptResponse {
  id: string;
  name: string;
  messageId: string;
  threadId: string;
}

export function useCreateStrategyWithPrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStrategyWithPromptRequest) => {
      const response = await apiClient.post<ApiResponse<CreateStrategyWithPromptResponse>>(
        API_ENDPOINTS.STRATEGIES.CREATE_WITH_PROMPT,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create strategy"));
    },
  });
}
