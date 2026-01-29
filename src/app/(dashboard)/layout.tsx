"use client";

import type { ReactNode } from "react";
import { useIsAuthenticated, useAuthLoading } from "@/stores/useAuthStore";
import { MainLayout } from "@/components/layout/MainLayout";
import { MobileBlocker } from "@/components/layout/MobileBlocker";
import { Spinner } from "@/components/ui/Spinner";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
    return (
      <>
        <MobileBlocker />
        {children}
      </>
    );
  }

  return <MainLayout>{children}</MainLayout>;
}
