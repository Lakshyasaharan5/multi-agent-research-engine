import { generateText, Output } from "ai";
import openai from "../lib/ai";
import { reportPrompt } from "../prompts/report.prompt";
import { reportSchema, type ReportResult } from "../schemas/report.schema";
import mockReportResult from "../dummy/mockReportResult.json";

export async function runReportAgent(input: {
    userQuery: string;
    goal: string;
    findings: unknown;
}): Promise<ReportResult> {
    if (process.env.USE_MOCK === "true" || process.env.USE_MOCK_REPORT === "true") {
        return mockReportResult as ReportResult;
    }
    const response = await generateText({
        model: openai("gpt-5.4-nano"),
        output: Output.object({
            schema: reportSchema,
        }),
        prompt: reportPrompt(input),
    });

    return response.output;
}
