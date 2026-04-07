"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { useLogout } from "@/lib/auth/useLogout";
import { useUserFromStore } from "@/stores/useAuthStore";
import { useBybitAccount } from "@/lib/api/queries";
import { useSetApiKeys, useRemoveApiKeys } from "@/lib/api/mutations";
import { apiKeysSchema, type ApiKeysFormData } from "@/lib/validations/apiKeys";
import { getErrorMessage, is404Error } from "@/lib/utils/errors";
import { getBybitSyncStatusStyle } from "@/lib/utils/status";
import { BybitSyncStatusEnum } from "@/types/api";
import { BybitApiConnectionSection } from "./BybitApiConnectionSection";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const user = useUserFromStore();
  const logout = useLogout();

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
    defaultValues: {
      apiKey: "",
      apiSecret: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const accountNotFound = is404Error(accountQueryError);
  const hasApiKeys = !!account && !accountNotFound;

  const accountError =
    accountQueryError && !accountNotFound
      ? getErrorMessage(accountQueryError, "Failed to load account")
      : null;

  const onSubmit = handleSubmit((data) => {
    setApiKeysMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  });

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!user) {
    return null;
  }

  const syncStyle = account ? getBybitSyncStatusStyle(account.syncStatus) : null;
  const hasSyncError = account?.syncStatus === BybitSyncStatusEnum.ERROR;

  const mutationError = setApiKeysMutation.error
    ? getErrorMessage(setApiKeysMutation.error, "Failed to set API keys")
    : null;

  const removeError = removeApiKeysMutation.error
    ? getErrorMessage(removeApiKeysMutation.error, "Failed to remove API keys")
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile">
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-foreground-muted mb-1">
            Email
          </label>
          <div className="text-foreground">{user.email}</div>
        </div>

        <div className="border-t border-border" />

        <BybitApiConnectionSection
          account={account ?? undefined}
          isLoadingAccount={isLoadingAccount}
          accountError={accountError}
          removeError={removeError}
          hasApiKeys={hasApiKeys}
          hasSyncError={hasSyncError}
          syncStyle={syncStyle}
          register={register}
          errors={errors}
          onSubmit={onSubmit}
          mutationError={mutationError}
          isPendingSetKeys={setApiKeysMutation.isPending}
          isSuccessSetKeys={setApiKeysMutation.isSuccess}
          onRemoveKeys={() => removeApiKeysMutation.mutate()}
          isPendingRemoveKeys={removeApiKeysMutation.isPending}
        />

        <div className="border-t border-border" />

        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-sm font-medium bg-bearish/10 text-bearish border border-bearish/20 rounded-lg hover:bg-bearish/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </Modal>
  );
}
