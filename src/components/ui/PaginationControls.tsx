"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PaginationControlsProps {
  startItem: number;
  endItem: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

export function PaginationControls({
  startItem,
  endItem,
  totalItems,
  hasPreviousPage,
  hasNextPage,
  onPrevious,
  onNext,
  className,
}: PaginationControlsProps) {
  return (
    <div className={cn("panel-footer", className)}>
      <span className="text-xs text-foreground-subtle">
        Showing {startItem}–{endItem} from {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!hasPreviousPage}
          className="btn-secondary px-3 py-1.5 text-[13px] rounded-xl flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNextPage}
          className="btn-secondary px-3 py-1.5 text-[13px] rounded-xl flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
