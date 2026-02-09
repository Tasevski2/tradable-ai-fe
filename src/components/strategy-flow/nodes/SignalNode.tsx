import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export interface SignalNodeData {
  signalType: "BUY" | "SELL";
}

function SignalNodeComponent({ data }: NodeProps<SignalNodeData>) {
  const { signalType } = data;
  const isBuy = signalType === "BUY";

  const Icon = isBuy ? ArrowUpCircle : ArrowDownCircle;

  return (
    <div
      className={`px-4 py-2.5 rounded-xl border min-w-[80px] flex items-center justify-center gap-2 ${
        isBuy
          ? "border-bullish/40 bg-bullish/10"
          : "border-bearish/40 bg-bearish/10"
      }`}
    >
      <Icon
        size={16}
        className={isBuy ? "text-bullish" : "text-bearish"}
      />
      <span
        className={`text-sm font-bold ${
          isBuy ? "text-bullish" : "text-bearish"
        }`}
      >
        {signalType}
      </span>
      <Handle
        type="target"
        position={Position.Left}
        className={`w-2! h-2! ${
          isBuy
            ? "bg-bullish! border-bullish-dark!"
            : "bg-bearish! border-bearish-dark!"
        }`}
      />
    </div>
  );
}

export const SignalNode = memo(SignalNodeComponent);
