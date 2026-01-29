"use client";

import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/api/client";
import { useUser } from "@/lib/api/queries";
import type { User } from "@/types/api";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  privyReady: boolean;
  privyAuthenticated: boolean;
}

/**
 * Unified authentication hook combining Privy with backend user management.
 * CRITICAL: Calls /api/users/me after Privy auth to create user on backend.
 */
export function useAuth(): UseAuthReturn {
  const {
    ready: privyReady,
    authenticated: privyAuthenticated,
    getAccessToken,
  } = usePrivy();

  const setUserInStore = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    if (privyReady && privyAuthenticated) {
      apiClient.setTokenGetter(getAccessToken);
    } else if (privyReady && !privyAuthenticated) {
      apiClient.setTokenGetter(null);
    }
  }, [privyReady, privyAuthenticated, getAccessToken]);

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useUser({
    enabled: privyReady && privyAuthenticated,
  });

  useEffect(() => {
    if (userError) {
      console.error("Failed to fetch user:", userError);
    }
  }, [userError]);

  useEffect(() => {
    if (user) {
      setUserInStore(user);
    } else if (privyReady && !privyAuthenticated) {
      clearUser();
    }
  }, [user, privyReady, privyAuthenticated, setUserInStore, clearUser]);

  const isLoading = !privyReady || (privyAuthenticated && isUserLoading);
  const isAuthenticated = privyAuthenticated && !!user;

  return {
    user: user ?? null,
    isAuthenticated,
    isLoading,
    privyReady,
    privyAuthenticated,
  };
}
