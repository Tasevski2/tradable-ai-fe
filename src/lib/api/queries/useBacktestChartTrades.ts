import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/api/queryKeys";
import { useIsAuthenticated } from "@/stores/useAuthStore";
import type { BacktestChartTradesResponse } from "@/types/api";
import type { TimeframeEnum } from "@/types/common";

interface UseBacktestChartTradesOptions {
  enabled?: boolean;
}

export function useBacktestChartTrades(
  strategyId: string,
  backtestId: string,
  from: number,
  to: number,
  timeframe: TimeframeEnum,
  options: UseBacktestChartTradesOptions = {},
) {
  const isAuthenticated = useIsAuthenticated();
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.backtests.chartTrades(strategyId, backtestId, from, to, timeframe),
    queryFn: () =>
      apiClient.get<BacktestChartTradesResponse>(
        API_ENDPOINTS.BACKTESTS.CHART_TRADES(strategyId, backtestId, from, to, timeframe),
      ),
    enabled: isAuthenticated && enabled && !!backtestId && from > 0 && to > 0,
    staleTime: 0,
  });
}
