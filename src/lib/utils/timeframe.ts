import { TimeframeEnum } from "@/types/common";

const TIMEFRAME_LABELS: Record<TimeframeEnum, string> = {
  [TimeframeEnum.ONE_MIN]: "1 min",
  [TimeframeEnum.FIVE_MIN]: "5 min",
  [TimeframeEnum.FIFTEEN_MIN]: "15 min",
  [TimeframeEnum.ONE_HOUR]: "1 hour",
};

export function getTimeframeLabel(timeframe: TimeframeEnum | null): string {
  if (!timeframe) return "Not set";
  return TIMEFRAME_LABELS[timeframe] ?? timeframe;
}
