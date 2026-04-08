"use client";

import { PromptInput } from "./PromptInput";
import { RecentStrategies } from "./RecentStrategies";

export function AuthenticatedHome() {
  return (
    <div className="min-h-screen p-8 relative">
      <div className="fixed inset-0 gradient-mesh-gold z-0" />

      <div className="min-h-[60vh] flex flex-col items-center pt-[30vh] max-w-4xl mx-auto w-full relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            What strategy would you like to build?
          </h1>
          <p className="text-lg text-foreground">
            Describe your trading idea and let AI turn it into a working
            strategy
          </p>
        </div>

        <PromptInput />
      </div>

      <div className="max-w-2xl mx-auto w-full mt-[15vh] pb-8 relative z-10">
        <RecentStrategies />
      </div>
    </div>
  );
}
