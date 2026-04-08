"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useIsAuthenticated, useAuthLoading } from "@/stores/useAuthStore";
import { MobileBlocker } from "@/components/layout/MobileBlocker";
import { Spinner } from "@/components/ui/Spinner";

interface StrategyBuilderLayoutProps {
  children: ReactNode;
}

export default function StrategyBuilderLayout({
  children,
}: StrategyBuilderLayoutProps) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

  if (isLoading) {
    return (
      <>
        <MobileBlocker />
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    router.replace("/");
    return null;
  }

  return (
    <>
      <MobileBlocker />
      {children}
    </>
  );
}
