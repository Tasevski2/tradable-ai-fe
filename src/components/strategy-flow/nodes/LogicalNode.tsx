import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type { LogicalOperator } from "@/types/strategy";

export interface LogicalNodeData {
  operator: LogicalOperator;
  signalType: "BUY" | "SELL";
}

function LogicalNodeComponent({ data }: NodeProps<LogicalNodeData>) {
  const { operator } = data;

  return (
    <div className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 min-w-[50px]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-2! h-2! bg-border! border-border!"
      />
      <div className="text-center">
        <span className="text-xs font-bold text-primary">{operator}</span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-2! h-2! bg-border! border-border!"
      />
    </div>
  );
}

export const LogicalNode = memo(LogicalNodeComponent);
