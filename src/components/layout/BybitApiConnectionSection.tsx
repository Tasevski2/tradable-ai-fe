"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Spinner } from "@/components/ui/Spinner";
import { HoldButton } from "@/components/ui/HoldButton";
import { useBybitAccount } from "@/lib/api/queries";
import { useSetApiKeys, useRemoveApiKeys } from "@/lib/api/mutations";
import {
  apiKeysSchema,
  type ApiKeysFormData,
} from "@/lib/validations/apiKeys";
import { getErrorMessage, is404Error } from "@/lib/utils/errors";
import { getBybitSyncStatusStyle } from "@/lib/utils/status";
import { BybitSyncStatusEnum } from "@/types/api";

interface BybitApiConnectionSectionProps {
  isOpen: boolean;
}

export function BybitApiConnectionSection({
  isOpen,
}: BybitApiConnectionSectionProps) {
  const {
    data: account,
    isLoading: isLoadingAccount,
    error: accountQueryError,
  } = useBybitAccount();

  const setApiKeysMutation = useSetApiKeys();
  const removeApiKeysMutation = useRemoveApiKeys();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApiKeysFormData>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: { apiKey: "", apiSecret: "" },
  });

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const accountNotFound = is404Error(accountQueryError);
  const hasApiKeys = !!account && !accountNotFound;
  const hasSyncError = account?.syncStatus === BybitSyncStatusEnum.ERROR;
  const syncStyle = account
    ? getBybitSyncStatusStyle(account.syncStatus)
    : null;

  const accountError =
    accountQueryError && !accountNotFound
      ? getErrorMessage(accountQueryError, "Failed to load account")
      : null;

  const mutationError = setApiKeysMutation.error
    ? getErrorMessage(setApiKeysMutation.error, "Failed to set API keys")
    : null;

  const removeError = removeApiKeysMutation.error
    ? getErrorMessage(removeApiKeysMutation.error, "Failed to remove API keys")
    : null;

  const onSubmit = handleSubmit((data) => {
    setApiKeysMutation.mutate(data, { onSuccess: () => reset() });
  });

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

          {setApiKeysMutation.isSuccess && (
            <div className="text-sm text-bullish bg-bullish/10 border border-bullish/20 rounded-lg px-3 py-2">
              API keys {hasApiKeys ? "updated" : "set"} successfully
            </div>
          )}

          <button
            type="submit"
            disabled={setApiKeysMutation.isPending}
            className="w-full px-4 py-2 text-sm btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {setApiKeysMutation.isPending
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
            onComplete={() => removeApiKeysMutation.mutate()}
            isPending={removeApiKeysMutation.isPending}
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
