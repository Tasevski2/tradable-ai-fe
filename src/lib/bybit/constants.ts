/**
 * Bybit Public API Constants
 *
 * Configuration for Bybit REST + WebSocket integration used by the trading chart.
 * All endpoints are public (no auth required).
 */

export const BYBIT_REST_URL = "https://api.bybit.com";
export const BYBIT_WS_URL = "wss://stream.bybit.com/v5/public/linear";
export const BYBIT_KLINE_ENDPOINT = "/v5/market/kline";

/** Heartbeat interval in ms — Bybit recommends every 20s */
export const WS_PING_INTERVAL = 20_000;

/** Reconnect delay bounds (ms) for exponential backoff */
export const WS_RECONNECT_MIN = 1_000;
export const WS_RECONNECT_MAX = 30_000;

/**
 * Only the 4 timeframes our platform supports for trading.
 * These map directly to klinecharts Pro's `Period` type.
 */
export const SUPPORTED_PERIODS = [
  { multiplier: 1, timespan: "minute" as const, text: "1m" },
  { multiplier: 5, timespan: "minute" as const, text: "5m" },
  { multiplier: 15, timespan: "minute" as const, text: "15m" },
  { multiplier: 1, timespan: "hour" as const, text: "1H" },
];

/**
 * Map from klinecharts Period.text → Bybit interval query parameter.
 *
 * Bybit intervals: 1, 3, 5, 15, 30, 60, 120, 240, 360, 720, D, W, M
 * We only use 1, 5, 15, 60.
 */
export const PERIOD_TO_BYBIT_INTERVAL: Record<string, string> = {
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "1H": "60",
};

/**
 * How far back to fetch history on initial chart load, keyed by Bybit interval.
 */
export const LOOKBACK_MS: Record<string, number> = {
  "1": 24 * 60 * 60 * 1000, // 1 day
  "5": 3 * 24 * 60 * 60 * 1000, // 3 days
  "15": 7 * 24 * 60 * 60 * 1000, // 7 days
  "60": 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const DEFAULT_SYMBOL = "BTCUSDT";
export const DEFAULT_PERIOD_TEXT = "5m";
export const CHART_PREFS_KEY = "tradable-ai-chart-prefs";
