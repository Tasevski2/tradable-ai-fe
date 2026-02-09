/**
 * Bybit Datafeed for @klinecharts/pro
 *
 * Implements the klinecharts Pro Datafeed interface using:
 * - Bybit REST API for historical kline data (public, no auth)
 * - Bybit WebSocket for real-time kline updates (public, no auth)
 *
 * The class is framework-agnostic — instantiated by the TradingChart component
 * and passed into KLineChartPro's constructor.
 */

import type { KLineData } from "klinecharts";
import type {
  SymbolInfo,
  Period,
  DatafeedSubscribeCallback,
} from "@klinecharts/pro";

import {
  BYBIT_REST_URL,
  BYBIT_KLINE_ENDPOINT,
  BYBIT_WS_URL,
  WS_PING_INTERVAL,
  WS_RECONNECT_MIN,
  WS_RECONNECT_MAX,
  PERIOD_TO_BYBIT_INTERVAL,
} from "./constants";

// ── Bybit response types ──────────────────────────────────────

interface BybitKlineResponse {
  retCode: number;
  retMsg: string;
  result: {
    symbol: string;
    category: string;
    list: string[][];
  };
}

interface BybitWSKlineData {
  start: number;
  end: number;
  interval: string;
  open: string;
  close: string;
  high: string;
  low: string;
  volume: string;
  turnover: string;
  confirm: boolean;
  timestamp: number;
}

interface BybitWSMessage {
  topic?: string;
  type?: string;
  ts?: number;
  data?: BybitWSKlineData[];
  op?: string;
  ret_msg?: string;
}

// ── Helpers ────────────────────────────────────────────────────

function periodToBybitInterval(period: Period): string {
  return PERIOD_TO_BYBIT_INTERVAL[period.text] ?? "5";
}

/**
 * Calculate price precision based on price magnitude.
 * Higher-priced assets need fewer decimals; micro-cap tokens need more.
 */
export function calculatePricePrecision(price: number): number {
  if (price === 0) return 2;
  if (price >= 100) return 2;
  if (price >= 1) return 4;
  if (price >= 0.01) return 5;
  if (price >= 0.0001) return 6;
  if (price >= 0.000001) return 8;
  return 10;
}

// ── BybitDatafeed ──────────────────────────────────────────────

export class BybitDatafeed {
  private markets: string[];
  private onPreferenceChange?: (symbol: string, periodText: string) => void;

  // WebSocket state
  private ws: WebSocket | null = null;
  private wsState: "disconnected" | "connecting" | "connected" = "disconnected";
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = WS_RECONNECT_MIN;

  // Subscription state
  private currentTopic: string | null = null;
  private subscriptionCallback: DatafeedSubscribeCallback | null = null;
  private pendingSubscription: {
    symbol: SymbolInfo;
    period: Period;
    callback: DatafeedSubscribeCallback;
  } | null = null;

  constructor(
    markets: string[],
    onPreferenceChange?: (symbol: string, periodText: string) => void,
  ) {
    this.markets = markets;
    this.onPreferenceChange = onPreferenceChange;
  }

  // ── searchSymbols ──────────────────────────────────────────

  async searchSymbols(search?: string): Promise<SymbolInfo[]> {
    const query = (search ?? "").toUpperCase().trim();

    const filtered = query
      ? this.markets.filter((s) => s.includes(query))
      : this.markets;

    return filtered.map((symbol) => ({
      ticker: symbol,
      name: symbol,
      shortName: symbol.replace("USDT", ""),
      exchange: "Bybit",
      market: "crypto",
      priceCurrency: "USD",
      type: "perpetual",
    }));
  }

  // ── getHistoryKLineData ────────────────────────────────────

  async getHistoryKLineData(
    symbol: SymbolInfo,
    period: Period,
    from: number,
    to: number,
  ): Promise<KLineData[]> {
    const interval = periodToBybitInterval(period);

    const params = new URLSearchParams({
      category: "linear",
      symbol: symbol.ticker,
      interval,
      start: String(from),
      end: String(to),
      limit: "1000",
    });

    const url = `${BYBIT_REST_URL}${BYBIT_KLINE_ENDPOINT}?${params}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Bybit kline request failed: ${response.status}`);
      }

      const json: BybitKlineResponse = await response.json();

      if (json.retCode !== 0) {
        throw new Error(`Bybit API error: ${json.retMsg}`);
      }

      // Bybit returns data in reverse chronological order → reverse for klinecharts
      const klines: KLineData[] = json.result.list
        .map((row) => ({
          timestamp: Number(row[0]),
          open: Number(row[1]),
          high: Number(row[2]),
          low: Number(row[3]),
          close: Number(row[4]),
          volume: Number(row[5]),
          turnover: Number(row[6]),
        }))
        .reverse();

      return klines;
    } catch (err) {
      console.error("[BybitDatafeed] History fetch error:", err);
      return [];
    }
  }

  // ── subscribe ──────────────────────────────────────────────

  subscribe(
    symbol: SymbolInfo,
    period: Period,
    callback: DatafeedSubscribeCallback,
  ): void {
    const interval = periodToBybitInterval(period);
    const topic = `kline.${interval}.${symbol.ticker}`;

    // Notify preference change
    this.onPreferenceChange?.(symbol.ticker, period.text);

    // If not connected yet, queue and connect
    if (this.wsState === "disconnected") {
      this.pendingSubscription = { symbol, period, callback };
      this.connect();
      return;
    }

    if (this.wsState === "connecting") {
      this.pendingSubscription = { symbol, period, callback };
      return;
    }

    // Already connected — switch topics
    this.switchTopic(topic, callback);
  }

  // ── unsubscribe ────────────────────────────────────────────

  unsubscribe(_symbol: SymbolInfo, _period: Period): void {
    if (this.currentTopic && this.ws && this.wsState === "connected") {
      this.sendWS({
        op: "unsubscribe",
        args: [this.currentTopic],
      });
    }
    this.currentTopic = null;
    this.subscriptionCallback = null;
  }

  // ── destroy ────────────────────────────────────────────────

  destroy(): void {
    if (this.currentTopic && this.ws && this.wsState === "connected") {
      this.sendWS({
        op: "unsubscribe",
        args: [this.currentTopic],
      });
    }

    this.stopPing();
    this.clearReconnect();

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }

    this.wsState = "disconnected";
    this.currentTopic = null;
    this.subscriptionCallback = null;
    this.pendingSubscription = null;
  }

  // ── Private: WebSocket lifecycle ───────────────────────────

  private connect(): void {
    if (this.wsState !== "disconnected") return;

    this.wsState = "connecting";
    const ws = new WebSocket(BYBIT_WS_URL);
    this.ws = ws;

    ws.onopen = () => {
      this.wsState = "connected";
      this.reconnectDelay = WS_RECONNECT_MIN;
      this.startPing();

      // Execute pending subscription
      if (this.pendingSubscription) {
        const { symbol, period, callback } = this.pendingSubscription;
        this.pendingSubscription = null;
        this.subscribe(symbol, period, callback);
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      this.handleMessage(event);
    };

    ws.onerror = () => {
      // onclose will fire after this; reconnect handled there
    };

    ws.onclose = () => {
      this.wsState = "disconnected";
      this.ws = null;
      this.stopPing();

      // Auto-reconnect if we still have an active subscription
      if (this.subscriptionCallback) {
        this.scheduleReconnect();
      }
    };
  }

  private handleMessage(event: MessageEvent): void {
    let msg: BybitWSMessage;
    try {
      msg = JSON.parse(event.data as string);
    } catch {
      return;
    }

    // Pong response — ignore
    if (msg.op === "pong" || msg.ret_msg === "pong") return;

    // Kline data
    if (
      msg.topic &&
      msg.topic === this.currentTopic &&
      msg.data &&
      msg.data.length > 0 &&
      this.subscriptionCallback
    ) {
      const candle = msg.data[0];
      if (!candle) return;

      const kline: KLineData = {
        timestamp: candle.start,
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume),
        turnover: Number(candle.turnover),
      };

      // Validate
      if (
        kline.timestamp > 0 &&
        !isNaN(kline.open) &&
        !isNaN(kline.high) &&
        !isNaN(kline.low) &&
        !isNaN(kline.close)
      ) {
        this.subscriptionCallback(kline);
      }
    }
  }

  private switchTopic(
    newTopic: string,
    callback: DatafeedSubscribeCallback,
  ): void {
    // Unsubscribe from old topic
    if (this.currentTopic && this.ws && this.wsState === "connected") {
      this.sendWS({
        op: "unsubscribe",
        args: [this.currentTopic],
      });
    }

    // Subscribe to new topic
    this.currentTopic = newTopic;
    this.subscriptionCallback = callback;

    if (this.ws && this.wsState === "connected") {
      this.sendWS({
        op: "subscribe",
        args: [newTopic],
      });
    }
  }

  private sendWS(data: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  // ── Private: Ping / Reconnect ──────────────────────────────

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      this.sendWS({ req_id: "ping", op: "ping" });
    }, WS_PING_INTERVAL);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect(): void {
    this.clearReconnect();

    this.reconnectTimer = setTimeout(() => {
      // Re-queue the current subscription as pending
      if (this.currentTopic && this.subscriptionCallback) {
        // Parse topic back to symbol/interval: "kline.60.BTCUSDT"
        const parts = this.currentTopic.split(".");
        const interval = parts[1];
        const ticker = parts[2];

        if (interval && ticker) {
          // Find matching period text
          const periodEntry = Object.entries(PERIOD_TO_BYBIT_INTERVAL).find(
            ([, v]) => v === interval,
          );
          const periodText = periodEntry ? periodEntry[0] : "5m";

          this.pendingSubscription = {
            symbol: { ticker },
            period: { multiplier: 1, timespan: "minute", text: periodText },
            callback: this.subscriptionCallback,
          };
        }
      }

      this.currentTopic = null;
      this.connect();
    }, this.reconnectDelay);

    // Exponential backoff capped at max
    this.reconnectDelay = Math.min(
      this.reconnectDelay * 2,
      WS_RECONNECT_MAX,
    );
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
