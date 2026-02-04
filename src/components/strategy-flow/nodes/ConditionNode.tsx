import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import type {
  LeafCondition,
  ValueRef,
  IndicatorDefinition,
} from "@/types/strategy";
import {
  CONDITION_TYPES,
  isIndicatorValueRef,
  isCandleValueRef,
  isConstValueRef,
} from "@/types/strategy";

export interface ConditionNodeData {
  condition: LeafCondition;
  indicators: IndicatorDefinition[];
  signalType: "BUY" | "SELL";
}

const conditionLabels: Record<string, string> = {
  [CONDITION_TYPES.GT]: ">",
  [CONDITION_TYPES.LT]: "<",
  [CONDITION_TYPES.CROSS_UP]: "crosses above",
  [CONDITION_TYPES.CROSS_DOWN]: "crosses below",
};

function formatValueRef(
  ref: ValueRef,
  indicators: IndicatorDefinition[]
): string {
  if (isIndicatorValueRef(ref)) {
    const indicator = indicators.find((i) => i.id === ref.id);
    if (indicator) {
      if (indicator.kind === "ATR") {
        return `ATR(${indicator.period})`;
      }
      return `${indicator.kind}(${indicator.period})`;
    }
    return ref.id;
  }

  if (isCandleValueRef(ref)) {
    return ref.field.charAt(0).toUpperCase() + ref.field.slice(1);
  }

  if (isConstValueRef(ref)) {
    return ref.value.toString();
  }

  return "?";
}

function ConditionNodeComponent({ data }: NodeProps<ConditionNodeData>) {
  const { condition, indicators, signalType } = data;
  const isBuy = signalType === "BUY";

  const leftLabel = formatValueRef(condition.left, indicators);
  const rightLabel = formatValueRef(condition.right, indicators);
  const operator = conditionLabels[condition.type] || condition.type;

  return (
    <div className="px-3 py-2 rounded-xl border border-border bg-background-overlay min-w-[120px]">
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-2 !h-2 ${
          isBuy
            ? "!bg-bullish !border-bullish-dark"
            : "!bg-bearish !border-bearish-dark"
        }`}
      />
      <div className="text-center">
        <span className="text-xs text-foreground-muted">{leftLabel}</span>
        <span className="text-xs text-primary font-bold mx-1.5">{operator}</span>
        <span className="text-xs text-foreground-muted">{rightLabel}</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={`!w-2 !h-2 ${
          isBuy
            ? "!bg-bullish !border-bullish-dark"
            : "!bg-bearish !border-bearish-dark"
        }`}
      />
    </div>
  );
}

export const ConditionNode = memo(ConditionNodeComponent);
