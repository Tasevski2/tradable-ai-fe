import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types/api";

interface PostChatMessageParams {
  strategyId: string;
  message: string;
}

interface PostChatMessageResponse {
  messageId: string;
  threadId: string;
}

export function usePostChatMessage() {
  return useMutation({
    mutationFn: async ({ strategyId, message }: PostChatMessageParams) => {
      const response = await apiClient.post<ApiResponse<PostChatMessageResponse>>(
        `${API_ENDPOINTS.CHAT.BASE}/${strategyId}/messages`,
        { message },
      );
      return response.data;
    },
  });
}
