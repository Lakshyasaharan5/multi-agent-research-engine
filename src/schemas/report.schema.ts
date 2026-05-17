import { z } from "zod";

const finalReportSchema = z.object({
    title: z.string().describe("Clear title for the final research report."),

    summary: z.string().describe("High-level summary of the research findings and conclusions."),

    sections: z
        .array(
            z.object({
                heading: z.string().describe("Section heading for a major topic in the report."),

                content: z
                    .string()
                    .describe("Detailed section content written in markdown-friendly format."),
            }),
        )
        .describe("Main sections of the final report."),

    citations: z
        .array(
            z.object({
                title: z.string().describe("Title of the cited source."),

                url: z.string().describe("Direct URL to the cited source."),
            }),
        )
        .describe("Unique citations referenced in the report."),

    limitations: z
        .array(
            z
                .string()
                .describe("Known limitations, uncertainty, weak evidence, or missing information."),
        )
        .describe("Research limitations or uncertainty notes."),
});

export const reportSchema = z.object({
    status: z
        .enum(["ready", "needs_more_research"])
        .describe("Whether the available evidence is sufficient for generating the final report."),

    reason: z
        .string()
        .describe("Explanation for why the report is ready or why more research is required."),

    followUpTasks: z
        .array(
            z
                .string()
                .describe(
                    "Additional focused research tasks required before writing the final report.",
                ),
        )
        .describe("List of follow-up research tasks. Empty if status is ready."),

    report: finalReportSchema
        .nullable()
        .describe("Final generated report. Present only when status is ready."),
});

export type ReportResult = z.infer<typeof reportSchema>;
