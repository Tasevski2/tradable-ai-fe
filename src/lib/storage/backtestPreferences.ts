import { TimeframeEnum } from "@/types/common";

export interface BacktestPreferences {
  symbol: string;
  timeframe: TimeframeEnum;
}

const STORAGE_KEY = "tradable-ai-backtest-prefs";

type AllPreferences = Record<string, BacktestPreferences>;

function readAll(): AllPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AllPreferences) : {};
  } catch {
    return {};
  }
}

export function loadBacktestPreferences(
  strategyId: string,
): BacktestPreferences | null {
  return readAll()[strategyId] ?? null;
}

export function saveBacktestPreferences(
  strategyId: string,
  prefs: BacktestPreferences,
): void {
  try {
    const all = readAll();
    all[strategyId] = prefs;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}
