import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/queryKeys";
import type { ChatMessage, ChatMessagesResponse } from "@/types/api";

/**
 * Mock data for chat messages - will be replaced with real API later
 */
const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Welcome! Describe the strategy you want to build. I'll update the draft rules and you can backtest on the right.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
];

/**
 * Hook to fetch chat messages for a strategy
 *
 * Currently returns mock data - will be connected to real API later
 */
export function useChatMessages(strategyId: string) {
  return useQuery<ChatMessagesResponse>({
    queryKey: queryKeys.chat.messages(strategyId),
    queryFn: async () => {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.get<ChatMessagesResponse>(
      //   `${API_ENDPOINTS.CHAT.BASE}/${strategyId}/messages`
      // );
      // return response;

      // Return mock data for now
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { data: MOCK_MESSAGES };
    },
    staleTime: 0,
  });
}
