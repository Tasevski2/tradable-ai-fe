"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl" | "fullscreen";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Primary heading shown in the header bar. */
  title?: string;
  /** Small secondary text shown below the title. */
  subtitle?: string;
  size?: ModalSize;
  /**
   * When true the container is capped at 90 vh with a scrollable body.
   * Required for any modal whose content may overflow the viewport.
   */
  scrollable?: boolean;
  /**
   * Replaces the default X close button in the header.
   * Use when the modal needs custom actions (e.g. a badge + labelled button).
   */
  headerActions?: ReactNode;
  /**
   * Rendered between the header and the body — useful for search bars or
   * secondary toolbars that must stay pinned above scrollable content.
   */
  subHeader?: ReactNode;
  /**
   * Rendered below the body — useful for pagination controls or action rows
   * that must stay pinned below scrollable content.
   */
  footer?: ReactNode;
  /** Removes the default p-6 body padding. Use for full-bleed table layouts. */
  noPadding?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-5xl",
  fullscreen: "w-[95vw] h-[95vh] max-w-none",
};

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  size = "md",
  scrollable = false,
  headerActions,
  subHeader,
  footer,
  noPadding = false,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (typeof window === "undefined" || !isOpen) {
    return null;
  }

  const isFlexContainer = scrollable || size === "fullscreen";

  const containerClasses = [
    "relative z-10",
    size === "fullscreen" ? "" : "w-full",
    sizeClasses[size],
    "mx-4 bg-card border border-border rounded-lg shadow-xl animate-scale-in",
    isFlexContainer ? "max-h-[90vh] flex flex-col" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const bodyClasses = [
    isFlexContainer && size !== "fullscreen" ? "overflow-auto flex-1" : "",
    size === "fullscreen" ? "flex-1 overflow-hidden" : "",
    !noPadding ? "p-6" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className={containerClasses}>
        {(title !== undefined || headerActions !== undefined) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-foreground-muted mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions !== undefined ? (
              headerActions
            ) : (
              <button
                onClick={onClose}
                className="p-1 text-foreground-muted hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {subHeader}

        <div className={bodyClasses}>{children}</div>

        {footer}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
