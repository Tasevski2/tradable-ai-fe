"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { useLogin } from "@/lib/auth/useLogin";

const FEATURES: { title: string; description: string }[] = [
  {
    title: "AI-Powered Strategy Builder",
    description: "Describe your trading idea in plain English",
  },
  {
    title: "Historical Backtesting",
    description: "Test strategies against real market data",
  },
  {
    title: "Live Trading on Bybit",
    description: "Execute strategies automatically 24/7",
  },
];

export function LandingPage() {
  const login = useLogin();

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[70%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background-elevated to-primary/20" />
        <Image
          src="/landing-cover.png"
          alt="TradableAI"
          fill
          // sizes="60vw"
          // className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50" />
      </div>

      <div className="w-full lg:w-[30%] flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center">
            <Image
              src="/logo/main.png"
              alt="TradableAI Logo"
              height={60}
              width={250}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground leading-tight">
              Build trading strategies with{" "}
              <span className="text-gradient-gold">AI</span>
            </h1>
            <p className="text-lg text-foreground-muted">
              Create, backtest, and deploy automated trading strategies through
              natural language. No coding required.
            </p>
          </div>

          <div className="space-y-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-bullish/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-bullish" />
                </div>
                <div>
                  <div className="text-foreground font-medium">
                    {feature.title}
                  </div>
                  <div className="text-sm text-foreground-muted">
                    {feature.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={login}
            className="w-full py-4 btn-primary rounded-lg text-lg"
          >
            Sign In & Start Building
          </button>
        </div>
      </div>
    </div>
  );
}
