import { z } from "zod";
import { TimeframeEnum, StrategyStatusEnum } from "@/types/common";

/**
 * Deploy Strategy form validation schema
 *
 * Validates only the required fields that need input validation:
 * - timeframe: Required, must be valid enum value
 * - perOrderUsd: Required, must be valid positive number
 *
 * Note: markets, promoteDraft, and deployStatus are managed separately
 * as they are UI state (dual-list) or configuration toggles without
 * validation requirements.
 */
export const deployStrategyFormSchema = z.object({
  timeframe: z.nativeEnum(TimeframeEnum, {
    errorMap: () => ({ message: "Timeframe is required" }),
  }),
  perOrderUsd: z
    .string()
    .min(1, "Per order USD is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Must be a valid number greater than 0"
    ),
});

export type DeployStrategyFormData = z.infer<typeof deployStrategyFormSchema>;

/**
 * Initial values type for change detection
 * Includes all fields that can be modified in the modal
 */
export interface DeployInitialValues {
  timeframe: TimeframeEnum | null;
  perOrderUsd: string;
  markets: string[];
  promoteDraft: boolean;
  deployStatus: StrategyStatusEnum;
}
