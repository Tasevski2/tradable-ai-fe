"use client";

import { useState, useEffect, useRef } from "react";
import { Monitor, Smartphone, ChevronRight } from "lucide-react";

const DESKTOP_BREAKPOINT = 768; // px

export function MobileBlocker() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    setIsClient(true);

    const checkViewport = () => {
      setIsMobile(window.innerWidth < DESKTOP_BREAKPOINT);
    };

    checkViewport();

    window.addEventListener("resize", checkViewport);
    return () => {
      window.removeEventListener("resize", checkViewport);
    };
  }, []);

  if (!isClient || !isMobile) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background p-8 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Monitor size={32} className="text-primary" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-3">Desktop Only</h1>

      <p className="text-foreground-muted max-w-sm mb-8">
        TradableAI is optimized for desktop browsers. Please access the platform
        from a computer with a screen width of at least 1024px.
      </p>

      <div className="flex items-center gap-4 text-foreground-muted">
        <div className="flex flex-col items-center">
          <Smartphone size={24} className="text-bearish mb-1" />
          <span className="text-xs">Mobile</span>
        </div>
        <ChevronRight size={20} />
        <div className="flex flex-col items-center">
          <Monitor size={24} className="text-bullish mb-1" />
          <span className="text-xs">Desktop</span>
        </div>
      </div>
    </div>
  );
}
