"use client";

import { Modal } from "@/components/ui/Modal";
import { useDeployModal } from "./useDeployModal";
import { DeployLiveParametersSection } from "./DeployLiveParametersSection";
import { DeployStrategyLogicSection } from "./DeployStrategyLogicSection";
import { Skeleton } from "@/components/ui/Skeleton";

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: string;
}

function DeployModalSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-4">
      <div className="space-y-4">
        <Skeleton className="h-8 w-full rounded-lg bg-background-overlay" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-lg bg-background-overlay" />
          <Skeleton className="h-10 flex-1 rounded-lg bg-background-overlay" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-64 rounded-lg bg-background-overlay" />
          <Skeleton className="h-64 rounded-lg bg-background-overlay" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-lg bg-background-overlay" />
        <Skeleton className="h-24 w-full rounded-lg bg-background-overlay" />
      </div>
    </div>
  );
}

export function DeployModal({ isOpen, onClose, strategyId }: DeployModalProps) {
  const {
    strategy,
    isLoading,
    deployMutation,
    deployError,
    control,
    handleSubmit,
    errors,
    marketSelection,
    promoteDraft,
    setPromoteDraft,
    deployStatus,
    setDeployStatus,
    noLiveConfig,
    bothVersionsZero,
    versionsMatch,
    isDeployDisabled,
    onDeploy,
  } = useDeployModal({ isOpen, strategyId, onClose });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deploy Strategy Changes"
      size="xl"
      scrollable
      headerActions={
        <div className="flex items-center gap-3">
          <span className="badge">Applies to live strategy behavior</span>
          <button
            onClick={onClose}
            className="btn-secondary px-3 py-1.5 text-sm rounded-lg"
          >
            Close
          </button>
        </div>
      }
    >
      {isLoading || !strategy ? (
        <DeployModalSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-4">
          <DeployLiveParametersSection
            strategy={strategy}
            control={control}
            errors={errors}
            marketSelection={marketSelection}
          />

          <DeployStrategyLogicSection
            strategy={strategy}
            promoteDraft={promoteDraft}
            setPromoteDraft={setPromoteDraft}
            versionsMatch={versionsMatch}
            noLiveConfig={noLiveConfig}
            bothVersionsZero={bothVersionsZero}
            deployStatus={deployStatus}
            setDeployStatus={setDeployStatus}
            deployError={deployError}
            isPending={deployMutation.isPending}
            isDeployDisabled={isDeployDisabled}
            onClose={onClose}
            handleSubmit={handleSubmit}
            onDeploy={onDeploy}
          />
        </div>
      )}
    </Modal>
  );
}
