export enum TimeframeEnum {
  ONE_MIN = "M1",
  FIVE_MIN = "M5",
  FIFTEEN_MIN = "M15",
  ONE_HOUR = "H1",
}

export enum OrderSideEnum {
  BUY = "Buy",
  SELL = "Sell",
}

export enum StrategyStatusEnum {
  NOT_CONFIGURED = "not_configured",
  LIVE = "live",
  PAUSED = "paused",
}

export enum SSEEventEnum {
  POSITION_OPENED = "POSITION_OPENED",
  POSITION_CLOSED = "POSITION_CLOSED",
  BACKTEST_COMPLETE = "BACKTEST_COMPLETE",
}

export enum ToolCallStatusEnum {
  CALLING = "calling",
  COMPLETED = "completed",
}

export enum PositionIdx {
  ONE_WAY = 0,
  LONG = 1,
  SHORT = 2,
}

export enum BacktestStatusEnum {
  QUEUED = "queued",
  RUNNING = "running",
  SUCCESS = "success",
  ERROR = "error",
}

export enum ActivityTypeEnum {
  ORDER_FILLED = "ORDER_FILLED",
  BACKTEST = "BACKTEST",
  AI_STRATEGY_UPDATED = "AI_STRATEGY_UPDATED",
}

export enum OrderStatus {
  SENT = "Sent",
  NEW = "New",
  PARTIALLY_FILLED = "PartiallyFilled",
  UNTRIGGERED = "Untriggered",
  FILLED = "Filled",
  CANCELLED = "Cancelled",
  REJECTED = "Rejected",
  PARTIALLY_FILLED_CANCELLED = "PartiallyFilledCanceled",
  TRIGGERED = "Triggered",
  DEACTIVATED = "Deactivated",
}

export enum OrderType {
  MARKET = "Market",
  LIMIT = "Limit",
}
