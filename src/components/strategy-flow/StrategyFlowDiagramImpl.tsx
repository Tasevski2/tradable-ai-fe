"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import { IndicatorNode, SignalNode, ConditionNode, LogicalNode } from "./nodes";
import { getLayoutedElements } from "./utils/layoutGraph";
import {
  transformConfigToFlow,
  isValidStrategyConfig,
} from "./utils/transformConfig";
import { cn } from "@/lib/utils/cn";

interface StrategyFlowDiagramImplProps {
  config: unknown | null;
  className?: string;
}

const nodeTypes: NodeTypes = {
  indicator: IndicatorNode,
  signal: SignalNode,
  condition: ConditionNode,
  logical: LogicalNode,
};

export function StrategyFlowDiagramImpl({
  config,
  className,
}: StrategyFlowDiagramImplProps) {
  const { nodes, edges, isEmpty } = useMemo(() => {
    if (!config || !isValidStrategyConfig(config)) {
      return { nodes: [], edges: [], isEmpty: true };
    }

    const { nodes: rawNodes, edges: rawEdges } = transformConfigToFlow(config);

    if (rawNodes.length === 0) {
      return { nodes: [], edges: [], isEmpty: true };
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges,
      "LR",
    );

    return { nodes: layoutedNodes, edges: layoutedEdges, isEmpty: false };
  }, [config]);

  // Show empty state when no config
  if (isEmpty) {
    return (
      <div
        className={`flex items-center justify-center h-full w-full min-h-50 rounded-xl border border-dashed border-border bg-background-overlay/50 ${className ?? ""}`}
      >
        <div className="text-center">
          <p className="text-sm text-foreground-muted font-medium">
            No strategy configuration
          </p>
          <p className="text-xs text-foreground-subtle mt-1">
            Chat with AI to build your strategy
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full w-full min-h-50 rounded-xl overflow-hidden border border-border/40",
        className,
      )}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={true}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(139, 92, 246, 0.15)"
          style={{ backgroundColor: "var(--background-elevated)" }}
        />
      </ReactFlow>
    </div>
  );
}
