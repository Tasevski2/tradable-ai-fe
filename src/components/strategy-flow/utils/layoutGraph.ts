import type { Node, Edge } from "reactflow";
import dagre from "dagre";

const NODE_WIDTH = 140;
const NODE_HEIGHT = 50;

/**
 * Apply Dagre layout to nodes and edges for hierarchical positioning.
 * Indicator nodes are positioned separately on the left side as a legend.
 *
 * @param nodes - ReactFlow nodes to layout
 * @param edges - ReactFlow edges defining connections
 * @param direction - Layout direction: 'TB' (top-bottom) or 'LR' (left-right)
 * @returns Layouted nodes and edges with calculated positions
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 80,
    marginx: 30,
    marginy: 30,
  });

  // Separate indicator nodes from flow nodes
  const indicatorNodes = nodes.filter((n) => n.type === "indicator");
  const flowNodes = nodes.filter((n) => n.type !== "indicator");

  // Only add flow nodes to dagre (not indicators)
  flowNodes.forEach((node) => {
    const width = node.width ?? NODE_WIDTH;
    const height = node.height ?? NODE_HEIGHT;
    dagreGraph.setNode(node.id, { width, height });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout for flow nodes
  dagre.layout(dagreGraph);

  // Map positions back to flow nodes
  const layoutedFlowNodes = flowNodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.width ?? NODE_WIDTH;
    const height = node.height ?? NODE_HEIGHT;

    return {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    } as Node;
  });

  // Position indicator nodes on the left side, centered vertically
  let layoutedIndicatorNodes: Node[] = [];

  if (indicatorNodes.length > 0 && layoutedFlowNodes.length > 0) {
    // Find the leftmost X and Y range of flow nodes
    const flowXPositions = layoutedFlowNodes.map((n) => n.position.x);
    const flowYPositions = layoutedFlowNodes.map((n) => n.position.y);
    const minFlowX = Math.min(...flowXPositions);
    const minFlowY = Math.min(...flowYPositions);
    const maxFlowY = Math.max(...flowYPositions);
    const centerY = (minFlowY + maxFlowY) / 2;

    // Position indicators in a column to the left
    const indicatorSpacing = 60;
    const indicatorColumnX = minFlowX - 180;
    const totalHeight = (indicatorNodes.length - 1) * indicatorSpacing;
    const startY = centerY - totalHeight / 2;

    layoutedIndicatorNodes = indicatorNodes.map((node, index) => {
      const width = node.width ?? nodeDimensions.indicator.width;
      const height = node.height ?? nodeDimensions.indicator.height;

      return {
        ...node,
        position: {
          x: indicatorColumnX - width / 2,
          y: startY + index * indicatorSpacing - height / 2,
        },
      } as Node;
    });
  }

  return {
    nodes: [...layoutedIndicatorNodes, ...layoutedFlowNodes],
    edges,
  };
}

/**
 * Calculate dimensions for different node types.
 */
export const nodeDimensions = {
  indicator: { width: 120, height: 48 },
  signal: { width: 90, height: 44 },
  condition: { width: 160, height: 40 },
  logical: { width: 60, height: 32 },
} as const;
