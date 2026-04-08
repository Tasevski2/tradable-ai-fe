"use client";

import type { ReactNode } from "react";
import { Sidebar, SIDEBAR_WIDTH } from "./Sidebar";
import { MobileBlocker } from "./MobileBlocker";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <MobileBlocker />
      <Sidebar />

      <main
        className="min-h-screen relative"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <div
          className="fixed inset-0 gradient-mesh-gold -z-10"
          style={{ marginLeft: SIDEBAR_WIDTH }}
        />
        {children}
      </main>
    </>
  );
}
