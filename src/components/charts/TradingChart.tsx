"use client";

import { useEffect, useRef } from "react";
import { LineType, CandleType } from "klinecharts";
import { KLineChartPro } from "@klinecharts/pro";
import "@klinecharts/pro/dist/klinecharts-pro.css";
import { useMarkets } from "@/lib/api/queries";
import { BybitDatafeed, calculatePricePrecision } from "@/lib/bybit/BybitDatafeed";
import {
  SUPPORTED_PERIODS,
  DEFAULT_SYMBOL,
  DEFAULT_PERIOD_TEXT,
  BYBIT_REST_URL,
  BYBIT_KLINE_ENDPOINT,
} from "@/lib/bybit/constants";
import {
  loadChartPreferences,
  saveChartPreferences,
} from "@/lib/bybit/chartPreferences";
import { Loader2 } from "lucide-react";

interface TradingChartProps {
  strategyId: string;
}

/**
 * Fetch the latest price for a symbol from Bybit to calculate display precision.
 */
async function fetchLatestPrice(symbol: string): Promise<number> {
  try {
    const params = new URLSearchParams({
      category: "linear",
      symbol,
      interval: "1",
      limit: "1",
    });
    const res = await fetch(
      `${BYBIT_REST_URL}${BYBIT_KLINE_ENDPOINT}?${params}`,
    );
    if (!res.ok) return 0;
    const json = await res.json();
    const close = json?.result?.list?.[0]?.[4];
    return close ? Number(close) : 0;
  } catch {
    return 0;
  }
}

/**
 * Find the Period object that matches a saved timeframe string.
 */
function findPeriod(text: string) {
  return (
    SUPPORTED_PERIODS.find((p) => p.text === text) ??
    SUPPORTED_PERIODS.find((p) => p.text === DEFAULT_PERIOD_TEXT)!
  );
}

/**
 * Chart style configuration matching the project's luxury dark theme.
 */
const CHART_STYLES = {
  grid: {
    horizontal: {
      show: true,
      color: "rgba(255, 255, 255, 0.04)",
      size: 1,
      style: LineType.Dashed,
      dashedValue: [3, 3],
    },
    vertical: {
      show: true,
      color: "rgba(255, 255, 255, 0.04)",
      size: 1,
      style: LineType.Dashed,
      dashedValue: [3, 3],
    },
  },
  candle: {
    type: CandleType.CandleSolid,
    bar: {
      upColor: "#22c55e",
      downColor: "#ef4444",
      noChangeColor: "#6b7280",
      upBorderColor: "#22c55e",
      downBorderColor: "#ef4444",
      noChangeBorderColor: "#6b7280",
      upWickColor: "#22c55e",
      downWickColor: "#ef4444",
      noChangeWickColor: "#6b7280",
    },
    priceMark: {
      high: { color: "rgba(234, 240, 255, 0.48)" },
      low: { color: "rgba(234, 240, 255, 0.48)" },
      last: {
        show: true,
        line: { color: "rgba(139, 92, 246, 0.5)", style: LineType.Dashed },
        text: {
          color: "#EAF0FF",
          borderColor: "rgba(139, 92, 246, 0.6)",
          backgroundColor: "rgba(139, 92, 246, 0.35)",
        },
      },
    },
    tooltip: {
      rect: {
        color: "#0C1220",
        borderColor: "rgba(255, 255, 255, 0.08)",
      },
      text: { color: "#EAF0FF" },
    },
  },
  indicator: {
    tooltip: {
      text: { color: "#EAF0FF" },
    },
  },
  xAxis: {
    axisLine: { color: "rgba(255, 255, 255, 0.08)" },
    tickText: { color: "rgba(234, 240, 255, 0.48)" },
    tickLine: { color: "rgba(255, 255, 255, 0.08)" },
  },
  yAxis: {
    axisLine: { color: "rgba(255, 255, 255, 0.08)" },
    tickText: { color: "rgba(234, 240, 255, 0.48)" },
    tickLine: { color: "rgba(255, 255, 255, 0.08)" },
  },
  separator: { color: "rgba(255, 255, 255, 0.08)" },
  crosshair: {
    horizontal: {
      line: { color: "rgba(234, 240, 255, 0.3)", style: LineType.Dashed },
      text: {
        color: "#EAF0FF",
        borderColor: "rgba(255, 255, 255, 0.1)",
        backgroundColor: "#0C1220",
      },
    },
    vertical: {
      line: { color: "rgba(234, 240, 255, 0.3)", style: LineType.Dashed },
      text: {
        color: "#EAF0FF",
        borderColor: "rgba(255, 255, 255, 0.1)",
        backgroundColor: "#0C1220",
      },
    },
  },
};

export function TradingChart({ strategyId }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<KLineChartPro | null>(null);
  const datafeedRef = useRef<BybitDatafeed | null>(null);
  const { data: marketsData, isLoading: marketsLoading } = useMarkets();

  const markets = marketsData?.data ?? [];

  useEffect(() => {
    if (!containerRef.current || markets.length === 0) return;

    // Prevent double-init (React strict mode)
    if (chartRef.current) return;

    const container = containerRef.current;

    const init = async () => {
      // Load saved preferences
      const saved = loadChartPreferences(strategyId);
      const symbolTicker = saved?.symbol ?? DEFAULT_SYMBOL;
      const periodObj = findPeriod(saved?.timeframe ?? DEFAULT_PERIOD_TEXT);

      // Get price precision
      const price = await fetchLatestPrice(symbolTicker);
      const precision = calculatePricePrecision(price);

      // Create datafeed with preference persistence callback
      const datafeed = new BybitDatafeed(markets, (symbol, periodText) => {
        saveChartPreferences(strategyId, {
          symbol,
          timeframe: periodText,
        });
      });
      datafeedRef.current = datafeed;

      // Initialize chart
      const chart = new KLineChartPro({
        container,
        theme: "dark",
        locale: "en-US",
        watermark: "",
        drawingBarVisible: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        symbol: {
          ticker: symbolTicker,
          name: symbolTicker,
          shortName: symbolTicker.replace("USDT", ""),
          exchange: "Bybit",
          market: "crypto",
          priceCurrency: "USD",
          type: "perpetual",
          pricePrecision: precision,
          volumePrecision: 2,
        },
        period: periodObj,
        periods: [...SUPPORTED_PERIODS],
        datafeed,
        styles: CHART_STYLES,
      });

      chartRef.current = chart;
    };

    init();

    return () => {
      datafeedRef.current?.destroy();
      datafeedRef.current = null;
      chartRef.current = null;
    };
  }, [markets, strategyId]);

  if (marketsLoading || markets.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-foreground-muted" />
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
