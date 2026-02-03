const API_BASE = "/api";

export const API_ENDPOINTS = {
  USERS: {
    ME: `${API_BASE}/users/me`,
  },
  STRATEGIES: {
    BASE: `${API_BASE}/strategies`,
    DETAIL: (id: string) => `${API_BASE}/strategies/${id}`,
    LIVE_CONFIG: (id: string) => `${API_BASE}/strategies/${id}/live-config`,
    MARKETS_SUMMARY: (id: string) => `${API_BASE}/strategies/${id}/markets/summary`,
    MARKETS_ALL_WITH_STATUS: (id: string) => `${API_BASE}/strategies/${id}/markets/all-with-status`,
    ACTIVITIES: (id: string) => `${API_BASE}/strategies/${id}/activities`,
    CREATE_WITH_PROMPT: `${API_BASE}/strategies/create-with-initial-prompt`,
  },
  CHAT: {
    BASE: `${API_BASE}/chat`,
  },
  ACCOUNTS: {
    BASE: `${API_BASE}/accounts`,
    SUMMARY: `${API_BASE}/accounts/summary`,
    SET_API_KEYS: `${API_BASE}/accounts/set-api-keys`,
    REMOVE_API_KEYS: `${API_BASE}/accounts/api-keys`,
  },
  POSITIONS: {
    BY_STRATEGY: (strategyId: string, page = 1, limit = 10) =>
      `${API_BASE}/positions/strategies/${strategyId}?page=${page}&limit=${limit}`,
    CLOSE: (strategyId: string, symbol: string) =>
      `${API_BASE}/positions/strategies/${strategyId}/symbols/${symbol}/close`,
    CLOSE_ALL: (strategyId: string) =>
      `${API_BASE}/positions/strategies/${strategyId}/close-all`,
  },
  BACKTESTS: {
    BY_STRATEGY: (strategyId: string, page = 1, limit = 10) =>
      `${API_BASE}/strategies/${strategyId}/backtests?page=${page}&limit=${limit}`,
    LATEST: (strategyId: string) =>
      `${API_BASE}/strategies/${strategyId}/backtests/latest`,
    DETAIL: (strategyId: string, backtestId: string) =>
      `${API_BASE}/strategies/${strategyId}/backtests/${backtestId}`,
    TRADES: (strategyId: string, backtestId: string, page = 1, limit = 10) =>
      `${API_BASE}/strategies/${strategyId}/backtests/${backtestId}/trades?page=${page}&limit=${limit}`,
  },
  ORDERS: {
    BY_STRATEGY: (strategyId: string, page = 1, limit = 10) =>
      `${API_BASE}/strategies/${strategyId}/orders?page=${page}&limit=${limit}`,
  },
  MARKETS: {
    BY_STRATEGY: (strategyId: string, page = 1, limit = 10, search?: string) =>
      `${API_BASE}/strategies/${strategyId}/markets?page=${page}&limit=${limit}${search ? `&search=${search}` : ""}`,
  },
} as const;
