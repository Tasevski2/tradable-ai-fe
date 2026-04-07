import { PositionIdx } from "@/types/common";

/** Human-readable label for a Bybit position side. */
export function getPositionSide(positionIdx: PositionIdx): string {
  switch (positionIdx) {
    case PositionIdx.LONG:
      return "Long";
    case PositionIdx.SHORT:
      return "Short";
    case PositionIdx.ONE_WAY:
      return "One-Way";
    default:
      return "Unknown";
  }
}

/** Tailwind colour class for a Bybit position side. */
export function getPositionSideClass(positionIdx: PositionIdx): string {
  switch (positionIdx) {
    case PositionIdx.LONG:
      return "text-bullish";
    case PositionIdx.SHORT:
      return "text-bearish";
    default:
      return "text-foreground-muted";
  }
}
