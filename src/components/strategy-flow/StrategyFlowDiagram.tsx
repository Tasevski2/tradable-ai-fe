"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

const StrategyFlowDiagramImpl = dynamic(
  () =>
    import("./StrategyFlowDiagramImpl").then(
      (mod) => mod.StrategyFlowDiagramImpl,
    ),
  {
    ssr: false,
    loading: () => <StrategyFlowDiagramSkeleton />,
  },
);

interface StrategyFlowDiagramProps {
  config: unknown | null;
  className?: string;
}

export function StrategyFlowDiagram({
  config,
  className,
}: StrategyFlowDiagramProps) {
  return <StrategyFlowDiagramImpl config={config} className={className} />;
}

function StrategyFlowDiagramSkeleton() {
  return (
    <Skeleton className="h-[440px] w-full rounded-xl bg-background-overlay" />
  );
}
