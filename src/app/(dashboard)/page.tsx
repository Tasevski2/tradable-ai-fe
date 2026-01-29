"use client";

import { useIsAuthenticated, useAuthLoading } from "@/stores/useAuthStore";
import { LandingPage } from "@/components/home/LandingPage";
import { AuthenticatedHome } from "@/components/home/AuthenticatedHome";

/**
 * Home Page
 *
 * Conditionally renders:
 * - LandingPage for unauthenticated users (no sidebar)
 * - AuthenticatedHome for authenticated users (with sidebar from layout)
 */
export default function HomePage() {
  // Read state from Zustand (synced by AuthProvider)
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

  // Loading state handled by layout, but show nothing during transition
  if (isLoading) {
    return null;
  }

  // Not authenticated - show landing page
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Authenticated - show home with prompt input and recent strategies
  return <AuthenticatedHome />;
}
