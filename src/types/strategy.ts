/**
 * Strategy Configuration Types
 *
 * TypeScript type definitions for the strategy JSON schema.
 * These types mirror the backend strategy-core types and define
 * the structure of strategy configurations stored in
 * draftConfigJson and liveConfigJson fields.
 */

// ============================================
// Constants
// ============================================

export const INDICATOR_KINDS = {
  EMA: "EMA",
  RSI: "RSI",
  ATR: "ATR",
} as const;

export const CONDITION_TYPES = {
  GT: "gt",
  LT: "lt",
  CROSS_UP: "crossUp",
  CROSS_DOWN: "crossDown",
} as const;

export const VALUE_REF_KINDS = {
  INDICATOR: "indicator",
  CANDLE: "candle",
  CONST: "const",
} as const;

export const LOGICAL_OPERATORS = {
  AND: "AND",
  OR: "OR",
} as const;

export const CANDLE_SOURCES = {
  CLOSE: "close",
  OPEN: "open",
  HIGH: "high",
  LOW: "low",
} as const;

export const CANDLE_FIELDS = {
  ...CANDLE_SOURCES,
  VOLUME: "volume",
} as const;

// ============================================
// Indicator Definitions
// ============================================

export type IndicatorKind =
  (typeof INDICATOR_KINDS)[keyof typeof INDICATOR_KINDS];

export type CandleSource = (typeof CANDLE_SOURCES)[keyof typeof CANDLE_SOURCES];

export interface EmaIndicatorDef {
  id: string;
  kind: typeof INDICATOR_KINDS.EMA;
  period: number;
  source: CandleSource;
}

export interface RsiIndicatorDef {
  id: string;
  kind: typeof INDICATOR_KINDS.RSI;
  period: number;
  source: CandleSource;
}

export interface AtrIndicatorDef {
  id: string;
  kind: typeof INDICATOR_KINDS.ATR;
  period: number;
}

export type IndicatorDefinition =
  | EmaIndicatorDef
  | RsiIndicatorDef
  | AtrIndicatorDef;

// ============================================
// Value References
// ============================================

export interface IndicatorValueRef {
  kind: typeof VALUE_REF_KINDS.INDICATOR;
  id: string;
}

export interface CandleValueRef {
  kind: typeof VALUE_REF_KINDS.CANDLE;
  field: (typeof CANDLE_FIELDS)[keyof typeof CANDLE_FIELDS];
}

export interface ConstValueRef {
  kind: typeof VALUE_REF_KINDS.CONST;
  value: number;
}

export type ValueRef = IndicatorValueRef | CandleValueRef | ConstValueRef;

// ============================================
// Condition Nodes (Recursive)
// ============================================

export type ConditionType =
  (typeof CONDITION_TYPES)[keyof typeof CONDITION_TYPES];

export type LogicalOperator =
  (typeof LOGICAL_OPERATORS)[keyof typeof LOGICAL_OPERATORS];

/**
 * Leaf condition node - a comparison between two values.
 *
 * Condition types:
 * - gt: left > right
 * - lt: left < right
 * - crossUp: prevLeft <= prevRight AND currLeft > currRight
 * - crossDown: prevLeft >= prevRight AND currLeft < currRight
 */
export interface LeafCondition {
  type: ConditionType;
  left: ValueRef;
  right: ValueRef;
}

/**
 * Logical condition node - combines child conditions with AND/OR.
 */
export interface LogicalCondition {
  op: LogicalOperator;
  args: ConditionNode[];
}

/**
 * Condition node - either a leaf comparison or a logical combination.
 */
export type ConditionNode = LeafCondition | LogicalCondition;

// ============================================
// Type Guards
// ============================================

export function isLeafCondition(node: ConditionNode): node is LeafCondition {
  return "type" in node && "left" in node && "right" in node;
}

export function isLogicalCondition(
  node: ConditionNode
): node is LogicalCondition {
  return "op" in node && "args" in node;
}

export function isIndicatorValueRef(ref: ValueRef): ref is IndicatorValueRef {
  return ref.kind === VALUE_REF_KINDS.INDICATOR;
}

export function isCandleValueRef(ref: ValueRef): ref is CandleValueRef {
  return ref.kind === VALUE_REF_KINDS.CANDLE;
}

export function isConstValueRef(ref: ValueRef): ref is ConstValueRef {
  return ref.kind === VALUE_REF_KINDS.CONST;
}

// ============================================
// Signal Definition
// ============================================

export interface SignalDefinition {
  when: ConditionNode;
}

// ============================================
// Full Strategy Definition
// ============================================

/**
 * Complete strategy configuration as stored in liveConfigJson/draftConfigJson.
 *
 * - indicators: Array of indicator definitions with unique IDs
 * - buySignal: Condition tree that produces BUY signals
 * - sellSignal: Condition tree that produces SELL signals
 */
export interface StrategyDefinition {
  indicators: IndicatorDefinition[];
  buySignal: SignalDefinition;
  sellSignal: SignalDefinition;
}
