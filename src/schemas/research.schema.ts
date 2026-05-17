import { z } from "zod";

export const researchSchema = z.object({
    findings: z
        .array(
            z.object({
                task: z
                    .string()
                    .describe("Original planner task that this research finding addresses."),

                answer: z
                    .string()
                    .describe(
                        "Concise evidence-based research summary for the task. May include markdown bullets and uncertainty notes if evidence is incomplete.",
                    ),

                sources: z
                    .array(
                        z.object({
                            title: z
                                .string()
                                .describe(
                                    "Real title of the source used to support the research finding.",
                                ),

                            url: z.string().describe("Direct URL of the supporting source."),

                            relevance: z
                                .string()
                                .describe(
                                    "Short explanation of why this source is relevant to the task.",
                                ),
                        }),
                    )
                    .min(1)
                    .max(4)
                    .describe("List of supporting sources used for this research finding."),
            }),
        )
        .describe("Research findings generated for each planner task."),
});

export type ResearchResult = z.infer<typeof researchSchema>;
