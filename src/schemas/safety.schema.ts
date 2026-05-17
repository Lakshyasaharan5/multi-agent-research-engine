import { z } from "zod";

export const safetySchema = z.object({
  result: z.enum(["safe", "unsafe"]),
  reason: z.string().describe("Reason for the safety assessment"),
});

export type SafetyResult = z.infer<typeof safetySchema>;