"use client";

import { useEffect, useRef, useState } from "react";
import {
  LineType,
  CandleType,
  PolygonType,
  dispose,
  init as klineInit,
  registerOverlay,
} from "klinecharts";
import type { Chart, OverlayCreate } from "klinecharts";
import { KLineChartPro } from "@klinecharts/pro";
import "@klinecharts/pro/dist/klinecharts-pro.css";
import {
  useMarkets,
  useBacktestDetail,
  useBacktestChartTrades,
} from "@/lib/api/queries";
import {
  BybitDatafeed,
  calculatePricePrecision,
} from "@/lib/bybit/BybitDatafeed";
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
import { timeframeEnumToPeriodText } from "@/lib/utils/timeframe";
import { useDebounce } from "@/hooks";
import { TimeframeEnum } from "@/types/common";
import { Loader2 } from "lucide-react";

interface TradingChartProps {
  strategyId: string;
  activeBacktestId?: string;
}

// ── Custom trade marker overlays ───────────────────────────────────────────
// Registered once at module load (client-only, component is ssr:false).

registerOverlay({
  name: "buyTradeMarker",
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,
  totalStep: 1,
  lock: true,
  createPointFigures: ({ overlay, coordinates }) => {
    const count = overlay.extendData as number;
    const coord = coordinates[0];
    if (!coord) return [];
    const { x, y } = coord;
    const gap = 5;
    const h = 9;
    const w = 8;
    return [
      {
        type: "polygon",
        ignoreEvent: true,
        attrs: {
          coordinates: [
            { x, y: y + gap },
            { x: x - w, y: y + gap + h },
            { x: x + w, y: y + gap + h },
          ],
        },
        styles: { style: PolygonType.Fill, color: "#22c55e" },
      },
      {
        type: "text",
        ignoreEvent: true,
        attrs: { x, y: y + gap + h + 2, text: String(count), align: "center" as CanvasTextAlign, baseline: "top" as CanvasTextBaseline },
        styles: { style: PolygonType.Stroke, borderSize: 0, backgroundColor: "transparent", color: "#22c55e", size: 9, weight: "bold", family: "sans-serif" },
      },
    ];
  },
});

registerOverlay({
  name: "sellTradeMarker",
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,
  totalStep: 1,
  lock: true,
  createPointFigures: ({ overlay, coordinates }) => {
    const count = overlay.extendData as number;
    const coord = coordinates[0];
    if (!coord) return [];
    const { x, y } = coord;
    const gap = 5;
    const h = 9;
    const w = 8;
    return [
      {
        type: "polygon",
        ignoreEvent: true,
        attrs: {
          coordinates: [
            { x, y: y - gap },
            { x: x - w, y: y - gap - h },
            { x: x + w, y: y - gap - h },
          ],
        },
        styles: { style: PolygonType.Fill, color: "#ef4444" },
      },
      {
        type: "text",
        ignoreEvent: true,
        attrs: { x, y: y - gap - h - 2, text: String(count), align: "center" as CanvasTextAlign, baseline: "bottom" as CanvasTextBaseline },
        styles: { style: PolygonType.Stroke, borderSize: 0, backgroundColor: "transparent", color: "#ef4444", size: 9, weight: "bold", family: "sans-serif" },
      },
    ];
  },
});

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

export function TradingChart({
  strategyId,
  activeBacktestId,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<KLineChartPro | null>(null);
  const innerChartRef = useRef<Chart | null>(null);
  const datafeedRef = useRef<BybitDatafeed | null>(null);
  const tradeOverlayIdsRef = useRef<string[]>([]);

  const [visibleRange, setVisibleRange] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const debouncedRange = useDebounce(visibleRange, 400);

  const { data: marketsData, isLoading: marketsLoading } = useMarkets();
  const markets = marketsData ?? [];

  const { data: backtestDetail } = useBacktestDetail(
    strategyId,
    activeBacktestId,
    { enabled: !!activeBacktestId },
  );

  // ── Lazy inner chart accessor ──────────────────────────────────────────────
  // klinecharts-pro wraps klinecharts internally and never exposes the raw
  // Chart instance. We recover it by finding the element stamped with
  // [k-line-chart-id] and passing it to klineInit(), which looks up the
  // already-registered instance from its internal map via dom.id.
  const resolveInnerChart = (): Chart | null => {
    if (innerChartRef.current) return innerChartRef.current;
    const el = containerRef.current?.querySelector(
      "[k-line-chart-id]",
    ) as HTMLElement | null;
    const chartId = el?.getAttribute("k-line-chart-id");
    if (!el || !chartId) return null;
    el.id = chartId;
    const chart = klineInit(el) as Chart | null;
    if (chart) innerChartRef.current = chart;
    return chart;
  };

  // Fetch grouped trade markers for the visible window
  const { data: chartTradesData } = useBacktestChartTrades(
    strategyId,
    activeBacktestId ?? "",
    debouncedRange?.from ?? 0,
    debouncedRange?.to ?? 0,
    backtestDetail?.timeframe ?? TimeframeEnum.FIVE_MIN,
    { enabled: !!activeBacktestId && !!debouncedRange },
  );

  // ── Chart initialisation ───────────────────────────────────────────────────
  // The chart is recreated whenever backtestDetail changes so the correct
  // symbol and period are passed directly to the KLineChartPro constructor.
  //
  // WHY NOT setSymbol() + setPeriod()?
  // klinecharts-pro uses SolidJS 1.6 which runs reactive effects synchronously
  // outside a batch. Calling setSymbol() triggers the data-fetch effect
  // immediately (sets internal flag a=true). The subsequent setPeriod() call
  // hits a=true and is silently skipped — candles never reload.
  // Recreating the chart avoids this race entirely.

  useEffect(() => {
    if (!containerRef.current || markets.length === 0) return;

    // Wait for backtest data before creating the chart so the constructor
    // receives the correct symbol/period in one shot.
    if (activeBacktestId && backtestDetail === undefined) return;

    const container = containerRef.current;
    let isMounted = true;

    // Capture backtest at effect-invocation time (closure-safe).
    const capturedBacktest = activeBacktestId ? (backtestDetail ?? null) : null;

    const init = async () => {
      const saved = loadChartPreferences(strategyId);

      const symbolTicker =
        capturedBacktest?.symbol ?? saved?.symbol ?? DEFAULT_SYMBOL;

      const price = await fetchLatestPrice(symbolTicker);
      const precision = calculatePricePrecision(price);
      if (!isMounted) return;

      const periodObj = capturedBacktest
        ? findPeriod(timeframeEnumToPeriodText(capturedBacktest.timeframe))
        : findPeriod(saved?.timeframe ?? DEFAULT_PERIOD_TEXT);

      const datafeed = new BybitDatafeed(
        markets,
        (symbol, periodText) => {
          saveChartPreferences(strategyId, { symbol, timeframe: periodText });
        },
        (from, to) => {
          if (isMounted) setVisibleRange({ from, to });
        },
      );
      datafeedRef.current = datafeed;

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
      isMounted = false;
      if (container) {
        dispose(container);       // klinecharts: removes internal canvas/panes
        container.textContent = ""; // clears SolidJS DOM left behind by klinecharts-pro
      }
      datafeedRef.current?.destroy();
      datafeedRef.current = null;
      chartRef.current = null;
      innerChartRef.current = null;
      tradeOverlayIdsRef.current = [];
    };
  // backtestDetail in deps: recreate chart when backtest changes so
  // constructor gets the new symbol/period (avoids setSymbol race).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets, strategyId, activeBacktestId, backtestDetail]);

  // ── Clear visible-range state when backtest is deselected ──────────────────

  useEffect(() => {
    if (!activeBacktestId) {
      setVisibleRange(null);
    }
  }, [activeBacktestId]);

  // ── Render grouped trade markers as overlays ───────────────────────────────

  useEffect(() => {
    const inner = resolveInnerChart();
    if (!inner) return;

    tradeOverlayIdsRef.current.forEach((id) => inner.removeOverlay(id));
    tradeOverlayIdsRef.current = [];

    if (!chartTradesData?.data?.length) return;

    const candleMap = new Map(inner.getDataList().map((c) => [c.timestamp, c]));

    const overlays: OverlayCreate[] = chartTradesData.data.flatMap((group) => {
      const results: OverlayCreate[] = [];
      const candle = candleMap.get(group.timestamp);

      if (group.buyCount > 0) {
        results.push({
          name: "buyTradeMarker",
          groupId: "backtest-trades",
          points: [{ timestamp: group.timestamp, value: candle?.low ?? 0 }],
          extendData: group.buyCount,
        });
      }

      if (group.sellCount > 0) {
        results.push({
          name: "sellTradeMarker",
          groupId: "backtest-trades",
          points: [{ timestamp: group.timestamp, value: candle?.high ?? 0 }],
          extendData: group.sellCount,
        });
      }

      return results;
    });

    if (overlays.length > 0) {
      const ids = inner.createOverlay(overlays);
      tradeOverlayIdsRef.current = (Array.isArray(ids) ? ids : [ids]).filter(
        (id): id is string => id !== null,
      );
    }
  }, [chartTradesData]);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (marketsLoading || markets.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-foreground-muted" />
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
