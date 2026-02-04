"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMarkets } from "@/lib/api/queries";
import { TimeframeEnum } from "@/types/common";

const LOCALSTORAGE_KEY = "tradable-ai-backtest-prefs";

const DEFAULT_SYMBOL = "BTCUSDT";
const DEFAULT_TIMEFRAME = TimeframeEnum.FIVE_MIN;

const TIMEFRAME_LABELS: Record<TimeframeEnum, string> = {
  [TimeframeEnum.ONE_MIN]: "1 Minute",
  [TimeframeEnum.FIVE_MIN]: "5 Minutes",
  [TimeframeEnum.FIFTEEN_MIN]: "15 Minutes",
  [TimeframeEnum.ONE_HOUR]: "1 Hour",
};

export interface BacktestPreferences {
  symbol: string;
  timeframe: TimeframeEnum;
}

type AllPreferences = Record<string, BacktestPreferences>;

function loadPreferences(strategyId: string): BacktestPreferences | null {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!raw) return null;
    const all: AllPreferences = JSON.parse(raw);
    return all[strategyId] ?? null;
  } catch {
    return null;
  }
}

function savePreferences(
  strategyId: string,
  prefs: BacktestPreferences,
): void {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    const all: AllPreferences = raw ? JSON.parse(raw) : {};
    all[strategyId] = prefs;
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(all));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function getBacktestPreferences(
  strategyId: string,
): BacktestPreferences | null {
  return loadPreferences(strategyId);
}

interface BacktestSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: string;
}

export function BacktestSettingsModal({
  isOpen,
  onClose,
  strategyId,
}: BacktestSettingsModalProps) {
  const { data: marketsData, isLoading: isLoadingMarkets } = useMarkets();
  const markets = marketsData?.data ?? [];

  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [timeframe, setTimeframe] = useState<TimeframeEnum>(DEFAULT_TIMEFRAME);

  // Load saved preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = loadPreferences(strategyId);
      if (saved) {
        setSymbol(saved.symbol);
        setTimeframe(saved.timeframe);
      } else {
        setSymbol(DEFAULT_SYMBOL);
        setTimeframe(DEFAULT_TIMEFRAME);
      }
    }
  }, [isOpen, strategyId]);

  const handleSave = () => {
    savePreferences(strategyId, { symbol, timeframe });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Backtest Settings" size="sm">
      <div className="flex flex-col gap-5">
        {/* Symbol Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Symbol</label>
          {isLoadingMarkets ? (
            <div className="flex items-center gap-2 h-9 px-3 border border-border rounded-md">
              <Spinner size="sm" />
              <span className="text-sm text-foreground-muted">
                Loading markets...
              </span>
            </div>
          ) : (
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select symbol" />
              </SelectTrigger>
              <SelectContent>
                {markets.map((market) => (
                  <SelectItem key={market} value={market}>
                    {market}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Timeframe Select */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            Timeframe
          </label>
          <Select
            value={timeframe}
            onValueChange={(value) => setTimeframe(value as TimeframeEnum)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIMEFRAME_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-sm rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary px-4 py-2 text-sm rounded-xl"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
