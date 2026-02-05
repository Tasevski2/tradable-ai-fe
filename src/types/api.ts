import {
  StrategyStatusEnum,
  TimeframeEnum,
  PositionIdx,
  BacktestStatusEnum,
  OrderSideEnum,
  ActivityTypeEnum,
  OrderStatus,
  OrderType,
} from "./common";

export interface ApiResponse<T> {
  data: T;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
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

export type StrategiesListResponse = PaginatedResponse<StrategyListItem>;

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

export interface AccountSummary {
  availableBalance: string;
  marginInUse: string;
  unrealizedPnl: string;
  liveStrategies: number;
  openPositions: number;
  totalRealizedPnl: string;
}

export interface StrategyDetail {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  timeframe: TimeframeEnum | null;
  status: StrategyStatusEnum;
  perOrderUsd: string | null;
  draftConfigVersion: number;
  liveConfigVersion: number;
  draftConfigJson: unknown | null;
  liveConfigJson: unknown | null;
  lastPublishedAt: string | null;
  lastDraftEditedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStrategyDto {
  name?: string;
  description?: string | null;
}

export interface DeleteStrategyResponse {
  success: boolean;
}

export interface StrategyMarketsSummary {
  markets: string[];
  totalCount: number;
}

export interface PositionAllocationItem {
  id: string;
  symbol: string;
  positionIdx: PositionIdx;
  strategyId: string;
  allocatedQty: string;
  entryPrice: string | null;
  updatedAt: string;
}

export interface ClosePositionResponse {
  success: boolean;
  commandId: string;
}

export interface BacktestListItem {
  id: string;
  symbol: string;
  timeframe: TimeframeEnum;
  status: BacktestStatusEnum;
  strategyVersion: number;
  finishedAt: string | null;
  totalPnlPct: string | null;
}

export interface BacktestMetrics {
  initialEquityUsd: string;
  finalEquityUsd: string;
  totalPnlUsd: string;
  totalPnlPct: string;
  totalTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: string;
  avgPnlUsd: string;
  avgWinUsd: string;
  avgLossUsd: string;
  profitFactor: string | null;
  bestTradeUsd: string;
  worstTradeUsd: string;
  avgHoldMinutes: string;
  maxDrawdownPct: string;
  maxDrawdownUsd: string;
  returnOverMaxDrawdown: string | null;
  startT: string;
  endT: string;
  tradesPerDay: string;
}

export interface BacktestDetail {
  id: string;
  strategyId: string;
  symbol: string;
  timeframe: TimeframeEnum;
  status: BacktestStatusEnum;
  strategyVersion: number;
  metrics: BacktestMetrics | null;
  strategyConfigJson: unknown;
  startedAt: string | null;
  finishedAt: string | null;
  updatedAt: string;
}

export interface BacktestDetailResponse {
  data: BacktestDetail | null;
}

export interface BacktestTradeItem {
  id: string;
  side: OrderSideEnum;
  entryT: string;
  exitT: string;
  entryPrice: string;
  exitPrice: string;
  qty: string | null;
  pnlUsd: string;
  pnlPct: string;
}

export type BacktestTradesResponse = PaginatedResponse<BacktestTradeItem>;

export interface FilledOrderActivityData {
  symbol: string;
  side: OrderSideEnum;
  positionIdx: PositionIdx;
  qty: string;
  avgPrice: string;
  isCloseOrder: boolean;
}

export interface BacktestActivityData {
  symbol: string;
  timeframe: TimeframeEnum;
  status: BacktestStatusEnum;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface AiUpdateActivityData {
  messageContent: string;
}

export interface StrategyActivityItem {
  type: ActivityTypeEnum;
  timestamp: string;
  data: FilledOrderActivityData | BacktestActivityData | AiUpdateActivityData;
}

export interface StrategyActivitiesResponse {
  data: StrategyActivityItem[];
}

export interface StrategyOrderItem {
  id: string;
  symbol: string;
  clientOrderId: string;
  bybitOrderId: string | null;
  side: OrderSideEnum;
  orderType: OrderType;
  price: string | null;
  qty: string;
  reduceOnly: boolean;
  status: OrderStatus;
  positionIdx: PositionIdx;
  createdAt: string;
  updatedAt: string;
  avgPrice: string | null;
  triggerPrice: string | null;
  stopOrderType: string | null;
}

export type StrategyOrdersResponse = PaginatedResponse<StrategyOrderItem>;

export type StrategyMarketsListResponse = PaginatedResponse<string>;

export interface MarketWithStatus {
  symbol: string;
  isSelected: boolean;
  hasOpenPosition: boolean;
}

export interface MarketsWithStatusResponse {
  data: MarketWithStatus[];
}

/**
 * DTO for updating a strategy's live configuration
 * POST /api/strategies/:strategyId/live-config
 */
export interface UpdateLiveConfigDto {
  timeframe: TimeframeEnum;
  perOrderUsd: number;
  strategyMarkets: string[];
  promoteDraftToLive: boolean;
  status: StrategyStatusEnum.LIVE | StrategyStatusEnum.PAUSED;
}

export interface UpdateLiveConfigResponse {
  success: boolean;
}

/**
 * Equity OHLC data point for backtest equity curve
 */
export interface EquityOHLCDto {
  date: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

export interface BacktestEquityResponse {
  data: EquityOHLCDto[];
}

export interface RunBacktestDto {
  symbol?: string;
  timeframe?: TimeframeEnum;
}

export interface RunBacktestResponse {
  backtestId: string;
  status: string;
}

/**
 * Chat message types for strategy builder AI chat
 */
export type ChatMessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
}

export interface ChatMessagesResponse {
  data: ChatMessage[];
  nextCursor: string | null;
}

export interface SendMessageResponse {
  threadId: string;
  messageId: string;
}

export interface ToolCallStatus {
  name: string;
  status: "calling" | "completed";
}
