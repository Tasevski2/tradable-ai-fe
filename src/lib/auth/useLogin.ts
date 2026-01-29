"use client";

import { usePrivy } from "@privy-io/react-auth";

/**
 * Hook to get the login function
 *
 * Use this hook when you only need the login action.
 * Does NOT trigger any React Query or Zustand subscriptions,
 * so it won't cause re-renders when auth state changes.
 *
 * @example
 * ```tsx
 * function LoginButton() {
 *   const login = useLogin();
 *   return <button onClick={login}>Sign In</button>;
 * }
 * ```
 */
export function useLogin() {
  const { login } = usePrivy();
  return login;
}
