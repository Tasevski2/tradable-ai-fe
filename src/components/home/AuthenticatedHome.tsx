"use client";

import { PromptInput } from "./PromptInput";
import { RecentStrategies } from "./RecentStrategies";

/**
 * Authenticated Home Component
 *
 * Main view for authenticated users.
 * Shows catchy headline, prompt input, and recent strategies.
 */
export function AuthenticatedHome() {
  return (
    <div className="min-h-screen p-8 relative">
      {/* Vibrant gradient background - fixed to viewport, behind sidebar */}
      <div className="fixed inset-0 gradient-mesh-gold z-0" />

      {/* Hero section with prompt - fixed height, pushed down 30% */}
      <div className="min-h-[60vh] flex flex-col items-center pt-[30vh] max-w-4xl mx-auto w-full relative z-10">
        {/* Catchy headline */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            What strategy would you like to build?
          </h1>
          <p className="text-lg text-foreground">
            Describe your trading idea and let AI turn it into a working
            strategy
          </p>
        </div>

        {/* Prompt input */}
        <PromptInput />
      </div>

      {/* Recent strategies section - pushes down, creates scroll */}
      <div className="max-w-2xl mx-auto w-full mt-[15vh] pb-8 relative z-10">
        <RecentStrategies />
      </div>
    </div>
  );
}
