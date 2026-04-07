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

/**
 * Load the saved backtest preferences for a specific strategy.
 * Returns `null` if no preferences have been saved yet.
 */
export function loadBacktestPreferences(
  strategyId: string,
): BacktestPreferences | null {
  return readAll()[strategyId] ?? null;
}

/**
 * Persist backtest preferences for a specific strategy.
 * Silently ignores errors (e.g. private browsing with storage disabled).
 */
export function saveBacktestPreferences(
  strategyId: string,
  prefs: BacktestPreferences,
): void {
  try {
    const all = readAll();
    all[strategyId] = prefs;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // Ignore — localStorage may be unavailable (private browsing, quota exceeded)
  }
}
