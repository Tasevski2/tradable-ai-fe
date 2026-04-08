export const queryKeys = {
  user: {
    all: ["user"] as const,
    me: () => [...queryKeys.user.all, "me"] as const,
  },
  account: {
    all: ["account"] as const,
    details: () => [...queryKeys.account.all, "details"] as const,
    summary: () => [...queryKeys.account.all, "summary"] as const,
  },
  strategies: {
    all: ["strategies"] as const,
    listPrefix: () => [...queryKeys.strategies.all, "list"] as const,
    list: (params?: {
      page?: number;
      limit?: number;
      sortOrder?: string;
      status?: string;
      search?: string;
    }) => [...queryKeys.strategies.all, "list", params] as const,
    detail: (id: string) =>
      [...queryKeys.strategies.all, "detail", id] as const,
    markets: (id: string) =>
      [...queryKeys.strategies.all, "markets", id] as const,
    marketsWithStatus: (id: string) =>
      [...queryKeys.strategies.all, "marketsWithStatus", id] as const,
    activities: (id: string) =>
      [...queryKeys.strategies.all, "activities", id] as const,
  },
  positions: {
    all: ["positions"] as const,
    byStrategyPrefix: (strategyId: string) =>
      [...queryKeys.positions.all, "byStrategy", strategyId] as const,
    byStrategy: (strategyId: string, page?: number, limit?: number) =>
      [
        ...queryKeys.positions.all,
        "byStrategy",
        strategyId,
        { page, limit },
      ] as const,
  },
  backtests: {
    all: ["backtests"] as const,
    byStrategyPrefix: (strategyId: string) =>
      [...queryKeys.backtests.all, "byStrategy", strategyId] as const,
    forStrategy: (strategyId: string) =>
      [...queryKeys.backtests.all, "forStrategy", strategyId] as const,
    byStrategy: (strategyId: string, page?: number, limit?: number) =>
      [
        ...queryKeys.backtests.all,
        "byStrategy",
        strategyId,
        { page, limit },
      ] as const,
    latest: (strategyId: string) =>
      [...queryKeys.backtests.all, "latest", strategyId] as const,
    detail: (strategyId: string, backtestId: string) =>
      [...queryKeys.backtests.all, "detail", strategyId, backtestId] as const,
    trades: (
      strategyId: string,
      backtestId: string,
      page?: number,
      limit?: number,
    ) =>
      [
        ...queryKeys.backtests.all,
        "trades",
        strategyId,
        backtestId,
        { page, limit },
      ] as const,
    equityLatest: (strategyId: string) =>
      [...queryKeys.backtests.all, "equityLatest", strategyId] as const,
    equity: (strategyId: string, backtestId: string) =>
      [...queryKeys.backtests.all, "equity", strategyId, backtestId] as const,
    chartTrades: (strategyId: string, backtestId: string, from: number, to: number, timeframe: string) =>
      [...queryKeys.backtests.all, "chartTrades", strategyId, backtestId, { from, to, timeframe }] as const,
  },
  orders: {
    all: ["orders"] as const,
    byStrategy: (strategyId: string, page?: number, limit?: number) =>
      [
        ...queryKeys.orders.all,
        "byStrategy",
        strategyId,
        { page, limit },
      ] as const,
  },
  markets: {
    all: ["markets"] as const,
    list: () => [...queryKeys.markets.all, "list"] as const,
    byStrategy: (strategyId: string, search?: string) =>
      [...queryKeys.markets.all, "byStrategy", strategyId, { search }] as const,
  },
  chat: {
    all: ["chat"] as const,
    messages: (strategyId: string) =>
      [...queryKeys.chat.all, "messages", strategyId] as const,
  },
} as const;
