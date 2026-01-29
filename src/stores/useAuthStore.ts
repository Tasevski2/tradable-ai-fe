import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types/api";

/**
 * Authentication store state
 */
interface AuthState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  clearUser: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Authentication store with persistence
 *
 * Stores user data in localStorage for persistence across sessions
 * Syncs with Privy authentication and /api/users/me endpoint
 *
 * @example
 * ```typescript
 * const { user, setUser, clearUser } = useAuthStore();
 *
 * // Set user after authentication
 * setUser(userData);
 *
 * // Clear user on logout
 * clearUser();
 *
 * // Update specific fields
 * updateUser({ bybitApiKey: 'new-key' });
 * ```
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start as loading to prevent flash of logged-out state

      // Set user and authentication status
      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
          isLoading: false,
        }),

      // Clear user and authentication status
      clearUser: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // Update specific user fields (partial update)
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Set loading state (used during auth initialization)
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: "tradable-auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),

      // Only persist user data, not loading states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

/**
 * Selector hook for accessing user (prevents unnecessary re-renders)
 * Named useUserFromStore to avoid conflict with React Query's useUser hook
 */
export const useUserFromStore = () => useAuthStore((state) => state.user);

/**
 * Selector hook for authentication status
 */
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);

/**
 * Selector hook for loading state
 */
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
