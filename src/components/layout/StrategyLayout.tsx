"use client";

import type { ReactNode } from "react";
import { StrategyHeader } from "./StrategyHeader";
import { MobileBlocker } from "./MobileBlocker";

interface StrategyLayoutProps {
  children: ReactNode;
  /** Optional right-side header content (for future publish buttons) */
  headerRightContent?: ReactNode;
}

export function StrategyLayout({
  children,
  headerRightContent,
}: StrategyLayoutProps) {
  return (
    <>
      <MobileBlocker />
      <StrategyHeader rightContent={headerRightContent} />
      <main className="min-h-[calc(100vh-60px)] bg-background">{children}</main>
    </>
  );
}
