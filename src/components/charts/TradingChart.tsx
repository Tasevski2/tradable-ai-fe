"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

// Trade marker triangle + count label. Registered once at module load (ssr:false).

const GAP = 5;
const MARKER_H = 9;
const MARKER_W = 8;

function createTradeMarkerFigures(
  x: number,
  y: number,
  count: number,
  direction: "up" | "down",
  color: string,
) {
  const tip = direction === "up" ? y + GAP : y - GAP;
  const base = direction === "up" ? tip + MARKER_H : tip - MARKER_H;
  const textY = direction === "up" ? base + 2 : base - 2;
  const baseline = direction === "up" ? "top" : "bottom";

  return [
    {
      type: "polygon",
      ignoreEvent: true,
      attrs: {
        coordinates: [
          { x, y: tip },
          { x: x - MARKER_W, y: base },
          { x: x + MARKER_W, y: base },
        ],
      },
      styles: { style: PolygonType.Fill, color },
    },
    {
      type: "text",
      ignoreEvent: true,
      attrs: {
        x,
        y: textY,
        text: String(count),
        align: "center" as CanvasTextAlign,
        baseline: baseline as CanvasTextBaseline,
      },
      styles: {
        style: PolygonType.Stroke,
        borderSize: 0,
        backgroundColor: "transparent",
        color,
        size: 9,
        weight: "bold",
        family: "sans-serif",
      },
    },
  ];
}

registerOverlay({
  name: "buyTradeMarker",
  needDefaultPointFigure: false,
  needDefaultXAxisFigure: false,
  needDefaultYAxisFigure: false,
  totalStep: 1,
  lock: true,
  createPointFigures: ({ overlay, coordinates }) => {
    const coord = coordinates[0];
    if (!coord) return [];
    return createTradeMarkerFigures(
      coord.x,
      coord.y,
      overlay.extendData as number,
      "up",
      "#22c55e",
    );
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
    const coord = coordinates[0];
    if (!coord) return [];
    return createTradeMarkerFigures(
      coord.x,
      coord.y,
      overlay.extendData as number,
      "down",
      "#ef4444",
    );
  },
});

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

function findPeriod(text: string) {
  return (
    SUPPORTED_PERIODS.find((p) => p.text === text) ??
    SUPPORTED_PERIODS.find((p) => p.text === DEFAULT_PERIOD_TEXT)!
  );
}

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
  const renderedTimestampsRef = useRef<Set<number>>(new Set());

  const [visibleRange, setVisibleRange] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const [symbolMismatch, setSymbolMismatch] = useState(false);
  const debouncedRange = useDebounce(visibleRange, 400);

  const { data: marketsData, isLoading: marketsLoading } = useMarkets();
  const markets = marketsData ?? [];

  const { data: backtestDetail } = useBacktestDetail(
    strategyId,
    activeBacktestId,
    { enabled: !!activeBacktestId },
  );

  // klinecharts-pro never exposes the inner klinecharts Chart instance.
  // We recover it by locating the element stamped with [k-line-chart-id] and
  // calling klineInit() on it — klinecharts looks up the existing instance
  // from its internal map keyed by dom.id, so no new chart is created.
  const resolveInnerChart = useCallback((): Chart | null => {
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
  }, []);

  const { data: chartTradesData } = useBacktestChartTrades(
    strategyId,
    activeBacktestId ?? "",
    debouncedRange?.from ?? 0,
    debouncedRange?.to ?? 0,
    backtestDetail?.timeframe ?? TimeframeEnum.FIVE_MIN,
    { enabled: !!activeBacktestId && !!debouncedRange && !symbolMismatch },
  );

  // klinecharts-pro quirks that force full chart recreation on each backtest change:
  //
  // 1. VISIBLE RANGE: klinecharts-pro calls getHistoryKLineData() directly whenever
  //    the visible range changes (scroll, zoom). There is no event we can subscribe to,
  //    so we track range changes via the BybitDatafeed onRangeChange callback and
  //    debounce them to drive our own backtest trade marker queries.
  //
  // 2. SYMBOL/PERIOD RACE: klinecharts-pro uses SolidJS 1.6 whose reactive effects run
  //    synchronously outside a batch. Calling setSymbol() immediately triggers the
  //    data-fetch effect (sets internal flag a=true). The subsequent setPeriod() call
  //    sees a=true and is silently skipped — candles never reload. We avoid this by
  //    always passing symbol + period in the constructor rather than calling setters.
  //
  // 3. SOLIDJS DOM LEAK: KLineChartPro renders into the container via SolidJS render().
  //    The returned cleanup (t.textContent = "") is never captured or called by the
  //    library. After dispose(), the SolidJS DOM remains, causing the next constructor
  //    call to append a new chart tree instead of replacing. We clear it manually.

  useEffect(() => {
    if (!containerRef.current || markets.length === 0) return;
    if (activeBacktestId && backtestDetail === undefined) return;

    const container = containerRef.current;
    let isMounted = true;
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
          if (capturedBacktest && symbol !== capturedBacktest.symbol) {
            const inner = resolveInnerChart();
            if (inner) {
              tradeOverlayIdsRef.current.forEach((id) => inner.removeOverlay(id));
            }
            tradeOverlayIdsRef.current = [];
            renderedTimestampsRef.current = new Set();
            if (isMounted) setSymbolMismatch(true);
          } else {
            if (isMounted) setSymbolMismatch(false);
          }
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
        dispose(container);         // removes klinecharts canvas/panes
        container.textContent = ""; // clears orphaned SolidJS DOM (see quirk #3 above)
      }
      datafeedRef.current?.destroy();
      datafeedRef.current = null;
      chartRef.current = null;
      innerChartRef.current = null;
      tradeOverlayIdsRef.current = [];
      renderedTimestampsRef.current = new Set();
      setSymbolMismatch(false);
    };
  // backtestDetail in deps triggers full recreation on backtest change, passing
  // the new symbol/period directly to the constructor (avoids the setter race, quirk #2).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markets, strategyId, activeBacktestId, backtestDetail]);

  useEffect(() => {
    if (!activeBacktestId) {
      setVisibleRange(null);
      setSymbolMismatch(false);
    }
  }, [activeBacktestId]);

  useEffect(() => {
    const inner = resolveInnerChart();
    if (!inner || !chartTradesData?.data?.length) return;

    const candleMap = new Map(inner.getDataList().map((c) => [c.timestamp, c]));

    const newGroups = chartTradesData.data.filter(
      (g) => !renderedTimestampsRef.current.has(g.timestamp),
    );
    if (newGroups.length === 0) return;

    const overlays: OverlayCreate[] = newGroups.flatMap((group) => {
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
      const newIds = (Array.isArray(ids) ? ids : [ids]).filter(
        (id): id is string => id !== null,
      );
      tradeOverlayIdsRef.current = [...tradeOverlayIdsRef.current, ...newIds];
      newGroups.forEach((g) => renderedTimestampsRef.current.add(g.timestamp));
    }
  }, [chartTradesData, resolveInnerChart]);

  if (marketsLoading || markets.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <Loader2 size={24} className="animate-spin text-foreground-muted" />
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
