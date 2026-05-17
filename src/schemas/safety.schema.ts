import { z } from "zod";

export const safetySchema = z.object({
  result: z.enum(["safe", "unsafe"]),
  reason: z.string().describe("Reason for the safety assessment"),
  userQuery: z.string().describe("The original user query"),
});

export type SafetyResult = z.infer<typeof safetySchema>;