import { APIError } from "@/lib/api/client";

export function getErrorMessage(
  error: unknown,
  defaultMessage = "An error occurred",
): string {
  if (error instanceof APIError) {
    if (typeof error.data === "string" && error.data.trim()) {
      return error.data.trim();
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}

/**
 * Narrows an unknown error to a 404 Not Found APIError.
 * Use this to branch on "resource not found" without inspecting raw status codes
 * throughout the component tree.
 */
export function is404Error(error: unknown): error is APIError {
  return error instanceof APIError && error.status === 404;
}

/**
 * Narrows an unknown error to a 5xx server-side APIError.
 */
export function is5xxError(error: unknown): error is APIError {
  return error instanceof APIError && error.status >= 500;
}
