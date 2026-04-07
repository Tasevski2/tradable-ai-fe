"use client";

import { useState, useEffect } from "react";

interface UsePaginatedModalOptions {
  isOpen: boolean;
  limit?: number;
}

/**
 * Manages page/limit state for paginated modals. Automatically resets to
 * page 1 whenever the modal is opened.
 */
export function usePaginatedModal({ isOpen, limit = 10 }: UsePaginatedModalOptions) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isOpen) setPage(1);
  }, [isOpen]);

  return { page, setPage, limit };
}
