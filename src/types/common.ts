export enum TimeframeEnum {
  ONE_MIN = "1m",
  FIVE_MIN = "5m",
  FIFTEEN_MIN = "15m",
  ONE_HOUR = "1h",
}

export enum OrderSideEnum {
  BUY = "Buy",
  SELL = "Sell",
}

export enum StrategyStatusEnum {
  LIVE = "live",
  PAUSED = "paused",
}

export enum SSEEventEnum {
  POSITION_OPENED = "POSITION_OPENED",
  POSITION_CLOSED = "POSITION_CLOSED",
  BACKTEST_COMPLETE = "BACKTEST_COMPLETE",
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
