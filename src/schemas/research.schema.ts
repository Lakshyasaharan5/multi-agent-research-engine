import { z } from "zod";

export const researchSchema = z.object({
    findings: z.array(
        z.object({
            task: z.string(),
            answer: z.string(),
            sources: z
                .array(
                    z.object({
                        title: z.string(),
                        url: z.string(),
                        relevance: z.string(),
                    }),
                )
                .min(1)
                .max(4),
        }),
    ),
});

export type ResearchResult = z.infer<typeof researchSchema>;
