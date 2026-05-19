import { generateText, Output } from "ai";
import openai from "../lib/ai.js";
import { reportPrompt } from "../prompts/report.prompt.js";
import { reportSchema, type ReportResult } from "../schemas/report.schema.js";
import mockReportResult from "../dummy/mockReportResult.json" with { type: "json" };
import { Logger } from "../lib/logger.js";

export async function runReportAgent(
    input: {
        userQuery: string;
        goal: string;
        findings: unknown;
        allowFollowUpResearch: boolean;
    },
    logger: Logger,
): Promise<ReportResult> {
    if (process.env.USE_MOCK_ALL === "true" || process.env.USE_MOCK_REPORT === "true") {
        return mockReportResult as ReportResult;
    }
    const response = await generateText({
        model: openai(process.env.REPORT_LLM_MODEL || "gpt-5.4-nano"),
        output: Output.object({
            schema: reportSchema,
        }),
        prompt: reportPrompt(input),
    });
    logger.metric("LLM metrics", {
        inputTokens: response.totalUsage.inputTokens,
        outputTokens: response.totalUsage.outputTokens,
        totalTokens: response.totalUsage.totalTokens,
        finishReason: response.finishReason,
    });
    return response.output;
}
