"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Plus, ChevronRight, Layers, Key } from "lucide-react";
import { useLogin } from "@/lib/auth/useLogin";
import { useBybitAccount } from "@/lib/api/queries";
import { BybitSyncStatusEnum } from "@/types/api";
import {
  useUserFromStore,
  useIsAuthenticated,
  useAuthLoading,
} from "@/stores/useAuthStore";
import { UserProfileModal } from "@/components/layout/UserProfileModal";
import { AccountSummary } from "@/components/layout/AccountSummary";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIDEBAR_WIDTH = 280;

export function Sidebar() {
  const pathname = usePathname();

  const user = useUserFromStore();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

  const login = useLogin();

  const { data: bybitAccount, isLoading: isLoadingBybit } = useBybitAccount();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const showApiKeysButton =
    isAuthenticated &&
    !isLoadingBybit &&
    (!bybitAccount || bybitAccount.syncStatus === BybitSyncStatusEnum.ERROR);

  return (
    <>
      <aside
        className="fixed left-0 top-0 h-screen z-40 bg-background-elevated border-r border-border flex flex-col"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="px-3 py-5 border-b border-border">
          <Link href="/" className="h-10 w-40">
            <Image
              src="/logo/main.png"
              alt="TradableAI Logo"
              height={40}
              width={167}
              className="rounded-lg"
            />
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          <TooltipProvider>
            <div
              className={`group flex items-center rounded-lg transition-colors ${
                isActive("/") ? "bg-primary/10" : "hover:bg-primary/10"
              }`}
            >
              <Link
                href="/"
                className={`flex-1 flex items-center gap-3 px-3 py-2.5 transition-colors ${
                  isActive("/")
                    ? "text-primary"
                    : "text-foreground-muted group-hover:text-primary"
                }`}
              >
                <House size={20} />
                <span className="text-sm font-medium">Home</span>
              </Link>

              {pathname !== "/" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/"
                      className="p-1.5 mr-1 rounded-md border border-primary text-primary group-hover:bg-background-elevated transition-colors"
                      aria-label="Create Strategy"
                    >
                      <Plus size={18} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Create Strategy</TooltipContent>
                </Tooltip>
              )}
            </div>

            <Link
              href="/dashboard/strategies"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                pathname.startsWith("/dashboard/strategies")
                  ? "bg-primary/10 text-primary"
                  : "text-foreground-muted hover:text-primary hover:bg-primary/10"
              }`}
            >
              <Layers size={20} />
              <span className="text-sm font-medium">Strategies</span>
            </Link>
          </TooltipProvider>
        </nav>

        {isAuthenticated && <AccountSummary />}

        <div className="px-3 py-4 border-t border-border">
          {showApiKeysButton && (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-3 rounded-lg btn-primary text-sm"
            >
              <Key size={16} />
              Set Bybit API Keys
            </button>
          )}

          {isLoading ? (
            <ProfileSkeleton />
          ) : isAuthenticated && user ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground truncate">
                  {user.email}
                </div>
              </div>
              <ChevronRight size={16} className="text-foreground-muted" />
            </button>
          ) : (
            <button
              onClick={login}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg btn-primary text-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </aside>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}

export { SIDEBAR_WIDTH };
