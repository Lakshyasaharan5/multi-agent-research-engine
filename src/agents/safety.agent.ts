import { generateText, Output } from "ai";
import openai from "../lib/ai.js";
import { safetySchema, SafetyResult } from "../schemas/safety.schema.js";
import { safetyPrompt } from "../prompts/safety.prompt.js";
import mockSafetyResult from "../dummy/mockSafetyResult.json" with { type: "json" };
import { Logger } from "../lib/logger.js";

export async function runSafetyAgent(userQuery: string, logger: Logger): Promise<SafetyResult> {
    if (process.env.USE_MOCK_ALL === "true" || process.env.USE_MOCK_SAFETY === "true") {
        return mockSafetyResult as SafetyResult;
    }
    const response = await generateText({
        model: openai(process.env.SAFETY_LLM_MODEL || "gpt-5.4-nano"),
        output: Output.object({
            schema: safetySchema,
        }),
        prompt: safetyPrompt(userQuery),
    });
    logger.metric("LLM metrics", {
        inputTokens: response.totalUsage.inputTokens,
        outputTokens: response.totalUsage.outputTokens,
        totalTokens: response.totalUsage.totalTokens,
        finishReason: response.finishReason,
    });
    return response.output;
}
