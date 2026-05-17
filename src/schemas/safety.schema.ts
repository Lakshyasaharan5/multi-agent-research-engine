import { z } from "zod";

export const safetySchema = z.object({
  decision: z.enum(["allow", "refuse", "caution"]),
  cleanedQuery: z.string().describe("The cleaned user query"),
  reason: z.string().describe("Reason for the safety assessment"),
  riskFlags: z.array(z.string()).describe("List of risk flags"),
});

export type SafetyResult = z.infer<typeof safetySchema>;