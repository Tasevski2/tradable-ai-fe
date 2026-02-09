"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Pause,
  Play,
  Rocket,
  Loader2,
  ExternalLink,
  Menu,
  Home,
  BrainCog,
} from "lucide-react";
import { StrategyStatusEnum } from "@/types/common";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  StrategySettingsModal,
  DeployModal,
} from "@/components/strategy-details";
import { useActivateStrategy, usePauseStrategy } from "@/lib/api/mutations";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

interface BuilderHeaderProps {
  strategyId: string;
  name: string;
  description: string | null;
  status: StrategyStatusEnum;
}

export function BuilderHeader({
  strategyId,
  name,
  description,
  status,
}: BuilderHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);

  const { mutate: activate, isPending: isActivating } = useActivateStrategy();
  const { mutate: pause, isPending: isPausing } = usePauseStrategy();

  const isNotConfigured = status === StrategyStatusEnum.NOT_CONFIGURED;
  const isLive = status === StrategyStatusEnum.LIVE;
  const isLoading = isActivating || isPausing;

  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-gradient-to-b from-background/90 to-background/65 border-b border-border">
      <div className="w-full px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Navigation Menu */}
          <Menubar className="border-none bg-transparent h-auto p-0">
            <MenubarMenu>
              <MenubarTrigger className="btn-ghost p-2 rounded-xl">
                <Menu size={18} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem asChild className="hover:cursor-pointer">
                  <Link href="/" className="flex items-center gap-2.5">
                    <Home size={14} />
                    Home
                  </Link>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem asChild className="hover:cursor-pointer">
                  <Link
                    href="/dashboard/strategies"
                    className="flex items-center gap-2.5"
                  >
                    <BrainCog size={14} />
                    Strategies
                  </Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>

          {/* Title */}
          <h1 className="text-base font-semibold tracking-wide">
            Strategy Builder — {name}
          </h1>

          <div className="flex-1" />

          {/* Right side actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status badge when not configured */}
            {isNotConfigured && (
              <span className="pill pill-warn">Not Configured</span>
            )}

            {/* Open Details link */}
            <Link
              href={`/dashboard/strategies/${strategyId}`}
              className="btn-secondary px-3 py-2 text-[13px] rounded-xl flex items-center gap-2"
            >
              <ExternalLink size={14} />
              Open Details
            </Link>

            {/* Deploy button */}
            <button
              onClick={() => setIsDeployOpen(true)}
              className="btn-primary px-3 py-2 text-[13px] rounded-xl flex items-center gap-2"
            >
              <Rocket size={14} />
              Deploy
            </button>

            {/* Pause/Resume button (only when configured) */}
            {!isNotConfigured && (
              <button
                onClick={() =>
                  isLive ? pause(strategyId) : activate(strategyId)
                }
                disabled={isLoading}
                className="btn-danger px-3 py-2 text-[13px] rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isLive ? (
                  <>
                    <Pause size={14} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Resume
                  </>
                )}
              </button>
            )}

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="btn-ghost p-2 rounded-xl"
              title="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StrategySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        strategyId={strategyId}
        currentName={name}
        currentDescription={description}
      />

      <DeployModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
        strategyId={strategyId}
      />
    </div>
  );
}

export function BuilderHeaderSkeleton() {
  return (
    <div className="sticky top-0 z-20 backdrop-blur-xl bg-gradient-to-b from-background/90 to-background/65 border-b border-border">
      <div className="w-full px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Skeleton className="h-9 w-9 rounded-xl bg-background-overlay" />
          <Skeleton className="h-5 w-56 bg-background-overlay" />
          <div className="flex-1" />
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-28 rounded-xl bg-background-overlay" />
            <Skeleton className="h-9 w-24 rounded-xl bg-background-overlay" />
            <Skeleton className="h-9 w-9 rounded-xl bg-background-overlay" />
          </div>
        </div>
      </div>
    </div>
  );
}
