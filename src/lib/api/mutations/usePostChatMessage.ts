import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { SendMessageResponse } from "@/types/api";

interface SendChatMessageParams {
  strategyId: string;
  message: string;
}

export function useSendChatMessage() {
  return useMutation({
    mutationFn: async ({ strategyId, message }: SendChatMessageParams) => {
      return apiClient.post<SendMessageResponse>(
        API_ENDPOINTS.CHAT.SEND(strategyId),
        { message },
      );
    },
  });
}
