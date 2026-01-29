"use client";

import type { ReactNode } from "react";
import { Sidebar, SIDEBAR_WIDTH } from "./Sidebar";
import { MobileBlocker } from "./MobileBlocker";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main Layout Component
 *
 * Standard layout with sidebar navigation.
 * Used for all pages except strategy detail.
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      {/* Mobile blocker */}
      <MobileBlocker />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main
        className="min-h-screen relative"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        {/* Gradient background */}
        <div
          className="fixed inset-0 gradient-mesh-gold -z-10"
          style={{ marginLeft: SIDEBAR_WIDTH }}
        />
        {children}
      </main>
    </>
  );
}
