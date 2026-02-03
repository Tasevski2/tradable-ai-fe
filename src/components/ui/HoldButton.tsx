"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

const DEFAULT_HOLD_DURATION_MS = 2000;

interface HoldButtonProps {
  onComplete: () => void;
  duration?: number;
  isPending?: boolean;
  disabled?: boolean;
  labels?: {
    default: string;
    holding: string;
    pending: string;
  };
  className?: string;
}

export function HoldButton({
  onComplete,
  duration = DEFAULT_HOLD_DURATION_MS,
  isPending = false,
  disabled = false,
  labels = {
    default: "Hold to confirm",
    holding: "Hold...",
    pending: "Processing...",
  },
  className,
}: HoldButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStartTimeRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearHoldInterval = useCallback(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  const resetHoldState = useCallback(() => {
    setIsHolding(false);
    holdStartTimeRef.current = null;
    setHoldProgress(0);
  }, []);

  const startHold = useCallback(() => {
    if (isPending || disabled) return;

    setIsHolding(true);
    holdStartTimeRef.current = Date.now();

    holdIntervalRef.current = setInterval(() => {
      if (holdStartTimeRef.current) {
        const elapsed = Date.now() - holdStartTimeRef.current;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setHoldProgress(progress);

        if (progress >= 100) {
          clearHoldInterval();
          resetHoldState();
          onComplete();
        }
      }
    }, 50);
  }, [isPending, disabled, duration, clearHoldInterval, resetHoldState, onComplete]);

  const endHold = useCallback(() => {
    clearHoldInterval();
    resetHoldState();
  }, [clearHoldInterval, resetHoldState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearHoldInterval();
    };
  }, [clearHoldInterval]);

  const buttonLabel = isPending
    ? labels.pending
    : isHolding
      ? labels.holding
      : labels.default;

  return (
    <button
      type="button"
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      disabled={isPending || disabled}
      className={cn(
        "relative w-full px-4 py-2 text-sm font-medium border border-bearish/30 text-bearish rounded-lg overflow-hidden transition-colors hover:border-bearish/50 disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      <div
        className="absolute inset-0 bg-bearish/20 transition-all duration-75"
        style={{ width: `${holdProgress}%` }}
      />
      <span className="relative z-10">{buttonLabel}</span>
    </button>
  );
}
