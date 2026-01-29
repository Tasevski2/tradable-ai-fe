export function getErrorMessage(
  error: unknown,
  defaultMessage = "An error occurred",
): string {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
}
