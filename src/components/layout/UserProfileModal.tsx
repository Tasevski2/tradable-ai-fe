"use client";

import { Modal } from "@/components/ui/Modal";
import { useLogout } from "@/lib/auth/useLogout";
import { useUserFromStore } from "@/stores/useAuthStore";
import { BybitApiConnectionSection } from "./BybitApiConnectionSection";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const user = useUserFromStore();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!user) return null;

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

        <BybitApiConnectionSection isOpen={isOpen} />

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
