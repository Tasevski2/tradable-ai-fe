const API_BASE = "/api";

export const API_ENDPOINTS = {
  USERS: {
    ME: `${API_BASE}/users/me`,
  },
  STRATEGIES: {
    BASE: `${API_BASE}/strategies`,
    CREATE_WITH_PROMPT: `${API_BASE}/strategies/create-with-initial-prompt`,
  },
  CHAT: {
    BASE: `${API_BASE}/chat`,
  },
  ACCOUNTS: {
    BASE: `${API_BASE}/accounts`,
    SET_API_KEYS: `${API_BASE}/accounts/set-api-keys`,
    REMOVE_API_KEYS: `${API_BASE}/accounts/api-keys`,
  },
} as const;
