"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StrategiesListError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-8">
      <div className="flex flex-col items-center gap-3 text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-4 py-6">
        <p>Something went wrong loading your strategies.</p>
        <button
          onClick={reset}
          className="btn-secondary px-4 py-2 text-sm rounded-lg"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
