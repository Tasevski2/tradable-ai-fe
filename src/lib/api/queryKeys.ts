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
  },
} as const;
