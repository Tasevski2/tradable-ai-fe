/**
 * Per-Strategy Chart Preferences
 *
 * Persists the user's selected symbol and timeframe for each strategy
 * in localStorage. Mirrors the pattern used for backtest preferences.
 */

import { CHART_PREFS_KEY, DEFAULT_SYMBOL, DEFAULT_PERIOD_TEXT } from "./constants";

export interface ChartPreferences {
  symbol: string;
  timeframe: string;
}

type AllChartPrefs = Record<string, ChartPreferences>;

export function loadChartPreferences(
  strategyId: string,
): ChartPreferences | null {
  try {
    const raw = localStorage.getItem(CHART_PREFS_KEY);
    if (!raw) return null;
    const all: AllChartPrefs = JSON.parse(raw);
    return all[strategyId] ?? null;
  } catch {
    return null;
  }
}

export function saveChartPreferences(
  strategyId: string,
  prefs: ChartPreferences,
): void {
  try {
    const raw = localStorage.getItem(CHART_PREFS_KEY);
    const all: AllChartPrefs = raw ? JSON.parse(raw) : {};
    all[strategyId] = prefs;
    localStorage.setItem(CHART_PREFS_KEY, JSON.stringify(all));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function getDefaultPreferences(): ChartPreferences {
  return { symbol: DEFAULT_SYMBOL, timeframe: DEFAULT_PERIOD_TEXT };
}
