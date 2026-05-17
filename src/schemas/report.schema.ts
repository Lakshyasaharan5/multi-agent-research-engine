import { z } from "zod";

export const reportSchema = z.object({
    title: z.string().describe("The title of the report"),
    summary: z.string().describe("A brief summary of the report"),
    sections: z.array(
        z.object({
            heading: z.string().describe("The heading of the section"),
            content: z.string().describe("The content of the section"),
        }).describe("A section of the report"),
    ),
    citations: z.array(
        z.object({
            title: z.string().describe("The title of the citation"),
            url: z.string().describe("The URL of the citation"),
        })
    ),
    limitations: z.array(z.string().describe("The limitations of the report")),
});

export type ReportResult = z.infer<typeof reportSchema>;