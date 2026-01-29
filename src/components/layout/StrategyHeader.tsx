"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface StrategyHeaderProps {
  rightContent?: ReactNode;
}

export function StrategyHeader({ rightContent }: StrategyHeaderProps) {
  return (
    <header className="h-15 bg-background-elevated border-b border-border flex items-center justify-between px-4">
      <Link
        href="/"
        className="flex items-center gap-2 px-3 py-2 -ml-3 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back</span>
      </Link>

      <div className="flex items-center gap-2">{rightContent}</div>
    </header>
  );
}
