import { z } from "zod";

export const plannerSchema = z.object({
  goal: z.string().describe("The research goal"),
  tasks: z.array(z.string()).min(3).max(5).describe("Research tasks to be executed"),
});

export type PlannerResult = z.infer<typeof plannerSchema>;