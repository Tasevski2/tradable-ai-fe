import type { ReactNode } from "react";
import { StrategyLayout } from "@/components/layout/StrategyLayout";

interface StrategyDetailLayoutProps {
  children: ReactNode;
}

/**
 * Strategy Detail Layout
 *
 * Full-width layout without sidebar for strategy workspace.
 * Includes minimal header with back button.
 */
export default function StrategyDetailLayout({
  children,
}: StrategyDetailLayoutProps) {
  return <StrategyLayout>{children}</StrategyLayout>;
}
