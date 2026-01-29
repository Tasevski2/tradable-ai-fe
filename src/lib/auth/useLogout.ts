"use client";

import { useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/queryKeys";

export function useLogout() {
  const { logout: privyLogout } = usePrivy();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);

  return useCallback(async () => {
    try {
      await privyLogout();
      clearUser();
      apiClient.setTokenGetter(null);
      queryClient.removeQueries({ queryKey: queryKeys.user.all });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [privyLogout, clearUser, queryClient]);
}
