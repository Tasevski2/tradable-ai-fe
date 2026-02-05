import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { ChatMessagesResponse } from "@/types/api";

const MESSAGES_PER_PAGE = 30;

export function useChatMessages(
  strategyId: string,
  options?: { enabled?: boolean },
) {
  const isAuthenticated = useIsAuthenticated();

  return useInfiniteQuery({
    queryKey: queryKeys.chat.messages(strategyId),
    queryFn: async ({ pageParam }) => {
      return apiClient.get<ChatMessagesResponse>(
        API_ENDPOINTS.CHAT.MESSAGES(strategyId, MESSAGES_PER_PAGE, pageParam),
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isAuthenticated && !!strategyId && (options?.enabled ?? true),
  });
}
