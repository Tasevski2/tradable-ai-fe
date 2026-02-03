"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { HoldButton } from "@/components/ui/HoldButton";
import { useUpdateStrategy, useDeleteStrategy } from "@/lib/api/mutations";
import { getErrorMessage } from "@/lib/utils/errors";

interface StrategySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategyId: string;
  currentName: string;
  currentDescription: string | null;
}

export function StrategySettingsModal({
  isOpen,
  onClose,
  strategyId,
  currentName,
  currentDescription,
}: StrategySettingsModalProps) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [description, setDescription] = useState(currentDescription ?? "");

  const updateMutation = useUpdateStrategy();
  const deleteMutation = useDeleteStrategy();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setDescription(currentDescription ?? "");
      updateMutation.reset();
      deleteMutation.reset();
    }
  }, [isOpen, currentName, currentDescription]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  const hasChanges =
    name !== currentName || description !== (currentDescription ?? "");

  const isNameValid = name.trim().length >= 1 && name.trim().length <= 100;
  const isDescriptionValid = description.length <= 500;
  const canSave =
    hasChanges &&
    isNameValid &&
    isDescriptionValid &&
    !updateMutation.isPending;

  const handleSave = () => {
    if (!canSave) return;

    const data: { name?: string; description?: string | null } = {};

    if (name !== currentName) {
      data.name = name.trim();
    }

    if (description !== (currentDescription ?? "")) {
      data.description = description.trim() === "" ? null : description.trim();
    }

    updateMutation.mutate(
      { strategyId, data },
      {
        onSuccess: () => {
          // Keep modal open to show success message
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(strategyId, {
      onSuccess: () => {
        onClose();
        router.push("/dashboard/strategies");
      },
    });
  };

  const updateError = updateMutation.error
    ? getErrorMessage(updateMutation.error, "Failed to update strategy")
    : null;

  const deleteError = deleteMutation.error
    ? getErrorMessage(deleteMutation.error, "Failed to delete strategy")
    : null;

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-xl animate-scale-in max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            Strategy Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-foreground-muted hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto flex-1 p-6 space-y-6">
          {/* Edit Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Edit Details
            </h3>

            <div>
              <label
                htmlFor="strategy-name"
                className="block text-sm text-foreground-muted mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="strategy-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Strategy name"
                maxLength={100}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary text-foreground placeholder:text-foreground-muted"
              />
              {!isNameValid && name.trim().length > 0 && (
                <p className="mt-1 text-xs text-bearish">
                  Name must be between 1 and 100 characters
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="strategy-description"
                className="block text-sm text-foreground-muted mb-1"
              >
                Description{" "}
                <span className="text-foreground-muted/60">(optional)</span>
              </label>
              <textarea
                id="strategy-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your strategy..."
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary text-foreground placeholder:text-foreground-muted resize-none"
              />
              <div className="flex justify-between mt-1">
                {!isDescriptionValid ? (
                  <p className="text-xs text-bearish">
                    Description must be 500 characters or less
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-foreground-muted">
                  {description.length}/500
                </span>
              </div>
            </div>

            {updateError && (
              <div className="text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-3 py-2">
                {updateError}
              </div>
            )}

            {updateMutation.isSuccess && (
              <div className="text-sm text-bullish bg-bullish/10 border border-bullish/20 rounded-lg px-3 py-2">
                Strategy updated successfully
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!canSave}
              className="w-full px-4 py-2 text-sm btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Danger Zone */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-bearish" />
              <h3 className="text-sm font-medium text-bearish">Danger Zone</h3>
            </div>
            <p className="text-xs text-foreground-muted/80">
              Note: You cannot delete a strategy that has open positions. Close
              all positions first.
            </p>

            {deleteError && (
              <div className="text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-3 py-2">
                {deleteError}
              </div>
            )}

            <HoldButton
              onComplete={handleDelete}
              isPending={deleteMutation.isPending}
              labels={{
                default: "Delete Strategy (Hold)",
                holding: "Hold to delete...",
                pending: "Deleting...",
              }}
            />
            <p className="text-xs text-foreground-muted text-center">
              Hold button for 2 seconds to delete
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") {
    return null;
  }

  return createPortal(modalContent, document.body);
}
