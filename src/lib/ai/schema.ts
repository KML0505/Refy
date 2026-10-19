import { z } from "zod";

export const ACTIONS = [
  "refund",
  "partial_refund",
  "status_reply",
  "pause_subscription",
  "hold",
  "deny",
] as const;

export const decisionSchema = z.object({
  action: z.enum(ACTIONS),
  amount_cents: z.number().int().nonnegative().nullable(),
  confidence: z.enum(["low", "medium", "high"]),
  reasoning: z.string().min(1),
  policy_clauses: z.array(z.string()),
  draft_reply: z.string().min(1),
});

export type Decision = z.infer<typeof decisionSchema>;