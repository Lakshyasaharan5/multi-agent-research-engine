import { z } from "zod";

export const plannerSchema = z.object({
  goal: z.string(),
  tasks: z.array(z.string()).min(3).max(5),
});

export type PlannerResult = z.infer<typeof plannerSchema>;