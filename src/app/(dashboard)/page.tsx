"use client";

import { useIsAuthenticated, useAuthLoading } from "@/stores/useAuthStore";
import { LandingPage } from "@/components/home/LandingPage";
import { AuthenticatedHome } from "@/components/home/AuthenticatedHome";

export default function HomePage() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

  if (isLoading) return null;
  if (!isAuthenticated) return <LandingPage />;

  return <AuthenticatedHome />;
}
