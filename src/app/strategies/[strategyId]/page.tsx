"use client";

import { use } from "react";
import { MessageSquare } from "lucide-react";

interface StrategyDetailPageProps {
  params: Promise<{
    strategyId: string;
  }>;
}

export default function StrategyDetailPage({
  params,
}: StrategyDetailPageProps) {
  const { strategyId } = use(params);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
          <MessageSquare size={32} className="text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          Strategy Workspace
        </h1>

        <p className="text-foreground-muted mb-6">
          This is where you&apos;ll build your trading strategy using AI. The
          chat interface and trading chart will be added here.
        </p>

        <div className="inline-block px-4 py-2 bg-background-elevated border border-border rounded-lg">
          <span className="text-sm text-foreground-muted">Strategy ID: </span>
          <span className="text-sm font-mono text-foreground">{strategyId}</span>
        </div>
      </div>
    </div>
  );
}
