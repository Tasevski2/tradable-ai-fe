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
    byStrategy: (strategyId: string, page?: number, limit?: number) =>
      [...queryKeys.positions.all, "byStrategy", strategyId, { page, limit }] as const,
  },
  backtests: {
    all: ["backtests"] as const,
    byStrategy: (strategyId: string, page?: number, limit?: number) =>
      [...queryKeys.backtests.all, "byStrategy", strategyId, { page, limit }] as const,
    latest: (strategyId: string) =>
      [...queryKeys.backtests.all, "latest", strategyId] as const,
    detail: (strategyId: string, backtestId: string) =>
      [...queryKeys.backtests.all, "detail", strategyId, backtestId] as const,
    trades: (strategyId: string, backtestId: string, page?: number, limit?: number) =>
      [...queryKeys.backtests.all, "trades", strategyId, backtestId, { page, limit }] as const,
  },
  orders: {
    all: ["orders"] as const,
    byStrategy: (strategyId: string, page?: number, limit?: number) =>
      [...queryKeys.orders.all, "byStrategy", strategyId, { page, limit }] as const,
  },
  markets: {
    all: ["markets"] as const,
    byStrategy: (strategyId: string, search?: string) =>
      [...queryKeys.markets.all, "byStrategy", strategyId, { search }] as const,
  },
} as const;
