import { StrategyStatusEnum } from "./common";

export interface ApiResponse<T> {
  data: T;
}

export interface User {
  id: string;
  email: string;
  privyUserId: string;
  createdAt: string;
  bybitApiKey?: string | null;
  bybitApiSecret?: string | null;
}

export interface StrategyListItem {
  strategyId: string;
  name: string;
  updatedAt: string;
  status: StrategyStatusEnum;
}

export interface StrategiesListResponse {
  data: StrategyListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export enum BybitSyncStatusEnum {
  OK = "ok",
  IDLE = "idle",
  ERROR = "error",
}

export interface BybitAccount {
  syncStatus: BybitSyncStatusEnum;
  leverage: string;
  hedgeMode: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
}

export interface SetApiKeysResponse {
  success: boolean;
  bybitAccountId: string;
}

export interface RemoveApiKeysResponse {
  success: boolean;
}
