import type { Node, Edge } from "reactflow";
import type {
  StrategyDefinition,
  ConditionNode as ConditionNodeType,
  IndicatorDefinition,
} from "@/types/strategy";
import {
  isLeafCondition,
  isLogicalCondition,
} from "@/types/strategy";
import type { IndicatorNodeData } from "../nodes/IndicatorNode";
import type { SignalNodeData } from "../nodes/SignalNode";
import type { ConditionNodeData } from "../nodes/ConditionNode";
import type { LogicalNodeData } from "../nodes/LogicalNode";
import { nodeDimensions } from "./layoutGraph";

type SignalType = "BUY" | "SELL";

interface TransformResult {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Recursively transform a condition node tree into ReactFlow nodes and edges.
 */
function transformConditionTree(
  conditionNode: ConditionNodeType,
  indicators: IndicatorDefinition[],
  signalType: SignalType,
  parentId: string,
  idPrefix: string,
  counter: { current: number }
): TransformResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const nodeId = `${idPrefix}-${counter.current++}`;

  if (isLeafCondition(conditionNode)) {
    // Create condition node
    const conditionData: ConditionNodeData = {
      condition: conditionNode,
      indicators,
      signalType,
    };

    nodes.push({
      id: nodeId,
      type: "condition",
      data: conditionData,
      position: { x: 0, y: 0 },
      ...nodeDimensions.condition,
    });

    // Connect this condition to parent (reversed for LR layout - conditions flow into signal)
    edges.push({
      id: `edge-${nodeId}-${parentId}`,
      source: nodeId,
      target: parentId,
      style: {
        stroke: "var(--border)",
        strokeWidth: 1.5,
      },
    });
  } else if (isLogicalCondition(conditionNode)) {
    // Create logical node
    const logicalData: LogicalNodeData = {
      operator: conditionNode.op,
      signalType,
    };

    nodes.push({
      id: nodeId,
      type: "logical",
      data: logicalData,
      position: { x: 0, y: 0 },
      ...nodeDimensions.logical,
    });

    // Connect this logical node to parent (reversed for LR layout)
    edges.push({
      id: `edge-${nodeId}-${parentId}`,
      source: nodeId,
      target: parentId,
      style: {
        stroke: "var(--border)",
        strokeWidth: 1.5,
      },
    });

    // Process children
    conditionNode.args.forEach((childNode) => {
      const childResult = transformConditionTree(
        childNode,
        indicators,
        signalType,
        nodeId,
        idPrefix,
        counter
      );
      nodes.push(...childResult.nodes);
      edges.push(...childResult.edges);
    });
  }

  return { nodes, edges };
}

/**
 * Transform a StrategyDefinition into ReactFlow nodes and edges.
 */
export function transformConfigToFlow(
  config: StrategyDefinition
): TransformResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const { indicators, buySignal, sellSignal } = config;

  // Create indicator nodes
  indicators.forEach((indicator, index) => {
    const indicatorData: IndicatorNodeData = {
      indicator,
    };

    nodes.push({
      id: `indicator-${indicator.id}`,
      type: "indicator",
      data: indicatorData,
      position: { x: index * 150, y: 0 },
      ...nodeDimensions.indicator,
    });
  });

  // Create BUY signal node
  const buySignalId = "signal-buy";
  const buySignalData: SignalNodeData = {
    signalType: "BUY",
  };
  nodes.push({
    id: buySignalId,
    type: "signal",
    data: buySignalData,
    position: { x: 0, y: 100 },
    ...nodeDimensions.signal,
  });

  // Create SELL signal node
  const sellSignalId = "signal-sell";
  const sellSignalData: SignalNodeData = {
    signalType: "SELL",
  };
  nodes.push({
    id: sellSignalId,
    type: "signal",
    data: sellSignalData,
    position: { x: 200, y: 100 },
    ...nodeDimensions.signal,
  });

  // Transform buy signal condition tree
  const buyCounter = { current: 0 };
  const buyResult = transformConditionTree(
    buySignal.when,
    indicators,
    "BUY",
    buySignalId,
    "buy-cond",
    buyCounter
  );
  nodes.push(...buyResult.nodes);
  edges.push(...buyResult.edges);

  // Transform sell signal condition tree
  const sellCounter = { current: 0 };
  const sellResult = transformConditionTree(
    sellSignal.when,
    indicators,
    "SELL",
    sellSignalId,
    "sell-cond",
    sellCounter
  );
  nodes.push(...sellResult.nodes);
  edges.push(...sellResult.edges);

  return { nodes, edges };
}

/**
 * Check if a config object is a valid StrategyDefinition.
 */
export function isValidStrategyConfig(
  config: unknown
): config is StrategyDefinition {
  if (!config || typeof config !== "object") {
    return false;
  }

  const c = config as Record<string, unknown>;

  return (
    Array.isArray(c.indicators) &&
    c.buySignal !== undefined &&
    c.sellSignal !== undefined &&
    typeof c.buySignal === "object" &&
    typeof c.sellSignal === "object" &&
    c.buySignal !== null &&
    c.sellSignal !== null &&
    "when" in c.buySignal &&
    "when" in c.sellSignal
  );
}
