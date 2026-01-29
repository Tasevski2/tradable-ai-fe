"use client";

import type { ReactNode } from "react";
import { StrategyHeader } from "./StrategyHeader";
import { MobileBlocker } from "./MobileBlocker";

interface StrategyLayoutProps {
  children: ReactNode;
  /** Optional right-side header content (for future publish buttons) */
  headerRightContent?: ReactNode;
}

/**
 * Strategy Layout Component
 *
 * Full-width layout without sidebar for strategy detail pages.
 * Includes minimal header with back button.
 */
export function StrategyLayout({
  children,
  headerRightContent,
}: StrategyLayoutProps) {
  return (
    <>
      {/* Mobile blocker */}
      <MobileBlocker />

      {/* Strategy header */}
      <StrategyHeader rightContent={headerRightContent} />

      {/* Main content area */}
      <main className="min-h-[calc(100vh-60px)] bg-background">{children}</main>
    </>
  );
}
