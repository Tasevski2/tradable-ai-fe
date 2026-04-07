"use client";

import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Spinner } from "@/components/ui/Spinner";
import { HoldButton } from "@/components/ui/HoldButton";
import type { ApiKeysFormData } from "@/lib/validations/apiKeys";
import type { BybitAccount } from "@/types/api";

interface SyncStyle {
  bg: string;
  text: string;
  label: string;
}

interface BybitApiConnectionSectionProps {
  account: BybitAccount | undefined;
  isLoadingAccount: boolean;
  accountError: string | null;
  removeError: string | null;
  hasApiKeys: boolean;
  hasSyncError: boolean;
  syncStyle: SyncStyle | null;
  // Form
  register: UseFormRegister<ApiKeysFormData>;
  errors: FieldErrors<ApiKeysFormData>;
  onSubmit: (e: React.FormEvent) => void;
  mutationError: string | null;
  isPendingSetKeys: boolean;
  isSuccessSetKeys: boolean;
  // Remove keys
  onRemoveKeys: () => void;
  isPendingRemoveKeys: boolean;
}

export function BybitApiConnectionSection({
  account,
  isLoadingAccount,
  accountError,
  removeError,
  hasApiKeys,
  hasSyncError,
  syncStyle,
  register,
  errors,
  onSubmit,
  mutationError,
  isPendingSetKeys,
  isSuccessSetKeys,
  onRemoveKeys,
  isPendingRemoveKeys,
}: BybitApiConnectionSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">
        Bybit API Connection
      </h3>

      {isLoadingAccount && (
        <div className="flex items-center gap-2 py-2">
          <Spinner size="sm" className="border-primary" />
          <span className="text-sm text-foreground-muted">
            Loading account...
          </span>
        </div>
      )}

      {accountError && (
        <div className="text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-3 py-2">
          {accountError}
        </div>
      )}

      {removeError && (
        <div className="text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-3 py-2">
          {removeError}
        </div>
      )}

      {!isLoadingAccount && hasApiKeys && account && syncStyle && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-muted">Status</span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded ${syncStyle.bg} ${syncStyle.text}`}
            >
              {syncStyle.label}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-muted">Leverage</span>
            <span className="text-sm text-foreground">
              {account.leverage}x
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground-muted">
              Position Mode
            </span>
            <span className="text-sm text-foreground">
              {account.hedgeMode ? "Hedge Mode" : "One-way Mode"}
            </span>
          </div>

          {account.lastSyncedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground-muted">
                Last Synced
              </span>
              <span className="text-sm text-foreground">
                {new Date(account.lastSyncedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {!isLoadingAccount && hasApiKeys && hasSyncError && (
        <div className="text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-3 py-2">
          Something is wrong with your API keys. Please update them.
        </div>
      )}

      {!isLoadingAccount && (
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm text-foreground-muted mb-1"
            >
              API Key
            </label>
            <input
              type="text"
              id="apiKey"
              {...register("apiKey")}
              placeholder={hasApiKeys ? "Enter new API Key" : "Enter API Key"}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary text-foreground placeholder:text-foreground-muted"
            />
            {errors.apiKey && (
              <p className="mt-1 text-xs text-bearish">
                {errors.apiKey.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="apiSecret"
              className="block text-sm text-foreground-muted mb-1"
            >
              API Secret
            </label>
            <input
              type="password"
              id="apiSecret"
              {...register("apiSecret")}
              placeholder={
                hasApiKeys ? "Enter new API Secret" : "Enter API Secret"
              }
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary text-foreground placeholder:text-foreground-muted"
            />
            {errors.apiSecret && (
              <p className="mt-1 text-xs text-bearish">
                {errors.apiSecret.message}
              </p>
            )}
          </div>

          {mutationError && (
            <div className="text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-3 py-2">
              {mutationError}
            </div>
          )}

          {isSuccessSetKeys && (
            <div className="text-sm text-bullish bg-bullish/10 border border-bullish/20 rounded-lg px-3 py-2">
              API keys {hasApiKeys ? "updated" : "set"} successfully
            </div>
          )}

          <button
            type="submit"
            disabled={isPendingSetKeys}
            className="w-full px-4 py-2 text-sm btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPendingSetKeys
              ? "Saving..."
              : hasApiKeys
                ? "Update API Keys"
                : "Set API Keys"}
          </button>
        </form>
      )}

      {!isLoadingAccount && hasApiKeys && (
        <div className="pt-2">
          <HoldButton
            onComplete={onRemoveKeys}
            isPending={isPendingRemoveKeys}
            labels={{
              default: "Remove API Keys (Hold)",
              holding: "Hold to remove...",
              pending: "Removing...",
            }}
          />
          <p className="text-xs text-foreground-muted mt-1 text-center">
            Hold button for 2 seconds to remove
          </p>
        </div>
      )}
    </div>
  );
}
