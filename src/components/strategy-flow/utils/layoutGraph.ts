import type { Node, Edge } from "reactflow";
import dagre from "dagre";

const NODE_WIDTH = 140;
const NODE_HEIGHT = 50;

/**
 * Apply Dagre layout to nodes and edges for hierarchical positioning.
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
    nodesep: 40,
    ranksep: 60,
    marginx: 20,
    marginy: 20,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    const width = node.width ?? NODE_WIDTH;
    const height = node.height ?? NODE_HEIGHT;
    dagreGraph.setNode(node.id, { width, height });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Map positions back to nodes
  // Dagre positions nodes by center, but ReactFlow uses top-left
  const layoutedNodes = nodes.map((node) => {
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

  return { nodes: layoutedNodes, edges };
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
