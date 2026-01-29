import { z } from "zod";

/**
 * Bybit API Key validation schema
 *
 * Validates:
 * - API Key: Required, alphanumeric format
 * - API Secret: Required, alphanumeric format
 */
export const apiKeysSchema = z.object({
  apiKey: z
    .string()
    .min(1, "API Key is required")
    .regex(/^[A-Za-z0-9]+$/, "Invalid API Key format"),
  apiSecret: z
    .string()
    .min(1, "API Secret is required")
    .regex(/^[A-Za-z0-9]+$/, "Invalid API Secret format"),
});

export type ApiKeysFormData = z.infer<typeof apiKeysSchema>;
