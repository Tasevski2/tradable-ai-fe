"use client";

import { useAuth } from "@/lib/auth/useAuth";

/**
 * Auth Provider
 *
 * Calls useAuth() ONCE at the top of the component tree.
 * This is the single source of truth for authentication:
 * - Initializes Privy authentication
 * - Fetches user data via /api/users/me
 * - Syncs auth state to Zustand for the rest of the app
 *
 * All other components should read auth state from Zustand:
 * - useUserFromStore() for user data
 * - useIsAuthenticated() for auth status
 * - useAuthLoading() for loading state
 *
 * Only use useAuth() directly when you need login/logout actions.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This is the ONLY place useAuth should be called for state sync
  // It handles Privy auth, calls /api/users/me, and syncs to Zustand
  useAuth();

  return <>{children}</>;
}
