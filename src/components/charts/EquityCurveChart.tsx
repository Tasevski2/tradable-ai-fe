"use client";

import { useEffect, useRef } from "react";
import { createChart, type IChartApi, CrosshairMode } from "lightweight-charts";
import type { EquityOHLCDto } from "@/types/api";

interface EquityCurveChartProps {
  data: EquityOHLCDto[];
  height?: number;
}

const CHART_COLORS = {
  background: "#0C1220",
  line: "#8b5cf6",
  topColor: "rgba(139, 92, 246, 0.4)",
  bottomColor: "rgba(139, 92, 246, 0.0)",
  textColor: "rgba(234, 240, 255, 0.68)",
};

export function EquityCurveChart({
  data,
  height = 200,
}: EquityCurveChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { color: CHART_COLORS.background },
        textColor: CHART_COLORS.textColor,
        attributionLogo: false,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        visible: true,
      },
      timeScale: {
        visible: true,
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    const areaSeries = chart.addAreaSeries({
      lineColor: CHART_COLORS.line,
      topColor: CHART_COLORS.topColor,
      bottomColor: CHART_COLORS.bottomColor,
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
    });

    // Transform data - only need time and close value
    const chartData = data.map((d) => ({
      time: d.date.split("T")[0] ?? d.date,
      value: parseFloat(d.close),
    }));

    areaSeries.setData(chartData);
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, height]);

  return (
    <div className="relative">
      <span className="absolute top-2 left-3 text-xs text-foreground-muted z-10">
        Equity over time
      </span>
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-border/40"
      />
    </div>
  );
}
