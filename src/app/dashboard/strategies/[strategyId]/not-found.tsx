import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function StrategyNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bearish/10 border border-bearish/20 mb-6">
          <AlertCircle size={32} className="text-bearish" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Strategy Not Found
        </h1>

        <p className="text-foreground-muted mb-8">
          The strategy you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>

        <Link
          href="/dashboard/strategies"
          className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back to Strategies
        </Link>
      </div>
    </div>
  );
}
