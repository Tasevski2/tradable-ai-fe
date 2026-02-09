import { memo } from "react";
import { type NodeProps } from "reactflow";
import { TrendingUp, Activity, BarChart3 } from "lucide-react";
import type { IndicatorDefinition } from "@/types/strategy";
import { INDICATOR_KINDS } from "@/types/strategy";

export interface IndicatorNodeData {
  indicator: IndicatorDefinition;
}

const indicatorIcons = {
  [INDICATOR_KINDS.EMA]: TrendingUp,
  [INDICATOR_KINDS.RSI]: Activity,
  [INDICATOR_KINDS.ATR]: BarChart3,
};

function IndicatorNodeComponent({ data }: NodeProps<IndicatorNodeData>) {
  const { indicator } = data;
  const Icon = indicatorIcons[indicator.kind];

  const getLabel = () => {
    if (indicator.kind === INDICATOR_KINDS.ATR) {
      return `ATR ${indicator.period}`;
    }
    return `${indicator.kind} ${indicator.period}`;
  };

  const getSubLabel = () => {
    if ("source" in indicator) {
      return indicator.source.toUpperCase();
    }
    return null;
  };

  const subLabel = getSubLabel();

  return (
    <div className="px-3 py-2 rounded-xl border border-primary/40 bg-background-elevated min-w-[100px]">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Icon size={14} className="text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground">{getLabel()}</span>
          {subLabel && (
            <span className="text-[10px] text-foreground-subtle">{subLabel}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export const IndicatorNode = memo(IndicatorNodeComponent);
