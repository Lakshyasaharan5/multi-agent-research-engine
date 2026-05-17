import { z } from "zod";

export const plannerSchema = z.object({
    goal: z
        .string()
        .describe("Clear high-level research objective derived from the cleaned user query."),

    tasks: z
        .array(
            z
                .string()
                .describe(
                    "Focused research task that can be investigated independently using web research.",
                ),
        )
        .min(3)
        .max(5)
        .describe(
            "List of 3 to 5 specific research tasks that together help achieve the research goal.",
        ),
});

export type PlannerResult = z.infer<typeof plannerSchema>;
