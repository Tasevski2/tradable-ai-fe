"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { useCreateStrategyWithPrompt } from "@/lib/api/mutations";

interface NewStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewStrategyModal({ isOpen, onClose }: NewStrategyModalProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const createStrategyMutation = useCreateStrategyWithPrompt();

  const errorMessage =
    validationError ||
    (createStrategyMutation.error instanceof Error
      ? createStrategyMutation.error.message
      : createStrategyMutation.error
        ? "Failed to create strategy"
        : null);

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setValidationError(null);
      createStrategyMutation.reset();
    }
  }, [isOpen, createStrategyMutation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      setValidationError("Please describe your strategy");
      return;
    }

    if (trimmedMessage.length < 10) {
      setValidationError("Message must be at least 10 characters");
      return;
    }

    createStrategyMutation.mutate(
      { message: trimmedMessage },
      {
        onSuccess: (result) => {
          setMessage("");
          onClose();
          router.push(`/strategies/${result.id}`);
        },
      },
    );
  };

  const handleClose = () => {
    setMessage("");
    setValidationError(null);
    createStrategyMutation.reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Strategy">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="strategy-message"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Describe Your Strategy
          </label>
          <textarea
            id="strategy-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the trading strategy you want to create..."
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-primary transition-colors resize-none"
            disabled={createStrategyMutation.isPending}
            autoFocus
            rows={4}
          />
        </div>

        {errorMessage && (
          <div className="text-sm text-bearish bg-bearish/10 border border-bearish/20 rounded-lg px-4 py-2">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={createStrategyMutation.isPending}
            className="flex-1 px-4 py-2.5 text-sm btn-secondary rounded-lg disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createStrategyMutation.isPending || !message.trim()}
            className="flex-1 px-4 py-2.5 text-sm btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createStrategyMutation.isPending ? "Creating..." : "Create Strategy"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
