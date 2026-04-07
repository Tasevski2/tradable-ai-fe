"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
// Note: keyboard handling (Escape) and body scroll lock are delegated to the
// Modal component — no duplicate listeners needed here.
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStrategy, useMarketsWithStatus } from "@/lib/api/queries";
import { useDeployStrategy } from "@/lib/api/mutations";
import {
  deployStrategyFormSchema,
  type DeployStrategyFormData,
  type DeployInitialValues,
} from "@/lib/validations/deployStrategy";
import { useDeployMarketSelection } from "./useDeployMarketSelection";
import { getErrorMessage } from "@/lib/utils/errors";
import { StrategyStatusEnum } from "@/types/common";

interface UseDeployModalOptions {
  isOpen: boolean;
  strategyId: string;
  onClose: () => void;
}

/**
 * Encapsulates all state, derived values, and event handlers for the Deploy
 * Strategy modal. The component layer is responsible only for rendering.
 */
export function useDeployModal({
  isOpen,
  strategyId,
  onClose,
}: UseDeployModalOptions) {
  // ── Server data ─────────────────────────────────────────────────────────────
  const { data: strategy, isLoading: isStrategyLoading } = useStrategy(
    strategyId,
    { enabled: isOpen },
  );
  const { data: marketsData, isLoading: isMarketsLoading } =
    useMarketsWithStatus(strategyId, { enabled: isOpen });

  const deployMutation = useDeployStrategy();
  const { reset: resetDeploy } = deployMutation;

  // ── Form (validated fields) ─────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DeployStrategyFormData>({
    resolver: zodResolver(deployStrategyFormSchema),
    defaultValues: { timeframe: undefined, perOrderUsd: "" },
  });

  // ── Market selection (own hook) ─────────────────────────────────────────────
  const marketSelection = useDeployMarketSelection();
  const {
    localMarkets,
    setLocalMarkets,
    currentMarkets,
    resetSelection,
    ...marketSelectionView
  } = marketSelection;

  // ── UI state ────────────────────────────────────────────────────────────────
  const [promoteDraft, setPromoteDraft] = useState(false);
  const [deployStatus, setDeployStatus] = useState<StrategyStatusEnum>(
    StrategyStatusEnum.PAUSED,
  );

  // Snapshot of values at open-time, used to detect unsaved changes
  const [initialValues, setInitialValues] =
    useState<DeployInitialValues | null>(null);

  // ── Initialise state when data arrives ─────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !strategy || !marketsData) return;

    const initTimeframe = strategy.timeframe;
    const initPerOrderUsd = strategy.perOrderUsd ?? "";
    const initPromoteDraft =
      strategy.liveConfigVersion === 0
        ? strategy.draftConfigVersion > 0
        : strategy.liveConfigVersion === strategy.draftConfigVersion;
    const initDeployStatus =
      strategy.status === StrategyStatusEnum.NOT_CONFIGURED
        ? StrategyStatusEnum.LIVE
        : strategy.status;
    const initMarkets = marketsData
      .filter((m) => m.isSelected)
      .map((m) => m.symbol);

    reset({ timeframe: initTimeframe ?? undefined, perOrderUsd: initPerOrderUsd });
    setPromoteDraft(initPromoteDraft);
    setDeployStatus(initDeployStatus);
    setLocalMarkets(marketsData);
    setInitialValues({
      timeframe: initTimeframe,
      perOrderUsd: initPerOrderUsd,
      markets: initMarkets,
      promoteDraft: initPromoteDraft,
      deployStatus: initDeployStatus,
    });
  }, [isOpen, strategy, marketsData, reset, setPromoteDraft, setDeployStatus, setInitialValues, setLocalMarkets]);

  // Reset transient UI state each time the modal opens
  useEffect(() => {
    if (isOpen) {
      resetSelection();
      resetDeploy();
    }
  }, [isOpen, resetSelection, resetDeploy]);

  // ── Change detection ────────────────────────────────────────────────────────
  const initialMarketsKey = useMemo(
    () => (initialValues ? [...initialValues.markets].sort().join(",") : ""),
    [initialValues],
  );

  const hasNonFormChanges = useMemo(() => {
    if (!initialValues) return false;
    return (
      currentMarkets.join(",") !== initialMarketsKey ||
      promoteDraft !== initialValues.promoteDraft ||
      deployStatus !== initialValues.deployStatus
    );
  }, [initialValues, currentMarkets, initialMarketsKey, promoteDraft, deployStatus]);

  const hasChanges = isDirty || hasNonFormChanges;

  // ── Config version helpers ──────────────────────────────────────────────────
  const noLiveConfig = strategy ? strategy.liveConfigVersion === 0 : false;
  const bothVersionsZero =
    strategy
      ? strategy.liveConfigVersion === 0 && strategy.draftConfigVersion === 0
      : false;
  const versionsMatch =
    strategy
      ? strategy.liveConfigVersion === strategy.draftConfigVersion
      : false;

  const isDeployDisabled =
    !hasChanges || deployMutation.isPending || bothVersionsZero;

  const deployError = deployMutation.error
    ? getErrorMessage(deployMutation.error, "Failed to deploy strategy")
    : null;

  // ── Deploy submit ───────────────────────────────────────────────────────────
  const onDeploy = useCallback(
    (formData: DeployStrategyFormData) => {
      const selectedSymbols = localMarkets
        .filter((m) => m.isSelected)
        .map((m) => m.symbol);

      deployMutation.mutate(
        {
          strategyId,
          data: {
            timeframe: formData.timeframe,
            perOrderUsd: Number(formData.perOrderUsd),
            strategyMarkets: selectedSymbols,
            promoteDraftToLive: promoteDraft,
            status: deployStatus as
              | StrategyStatusEnum.LIVE
              | StrategyStatusEnum.PAUSED,
          },
        },
        { onSuccess: onClose },
      );
    },
    [localMarkets, strategyId, deployMutation, promoteDraft, deployStatus, onClose],
  );

  return {
    // Data / loading
    strategy,
    isLoading: isStrategyLoading || isMarketsLoading,
    deployMutation,
    deployError,

    // Form
    control,
    handleSubmit,
    errors,

    // Market selection (UI-facing subset; internal state stays in this hook)
    marketSelection: marketSelectionView,

    // Strategy logic panel
    promoteDraft,
    setPromoteDraft,
    deployStatus,
    setDeployStatus,
    noLiveConfig,
    bothVersionsZero,
    versionsMatch,

    // Submit
    isDeployDisabled,
    onDeploy,
  };
}
