"use client";

import { useEffect, useCallback } from "react";

/**
 * Closes a modal on Escape key and locks body scroll while it is open.
 * Attach to any portal-based modal that follows the isOpen/onClose pattern.
 */
export function useModalKeydown(isOpen: boolean, onClose: () => void): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);
}
