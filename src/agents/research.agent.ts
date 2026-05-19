import { generateText, Output, stepCountIs } from "ai";
import openai from "../lib/ai.js";
import { researchPrompt } from "../prompts/research.prompt.js";
import { researchSchema, type ResearchResult } from "../schemas/research.schema.js";
import mockResearchResult from "../dummy/mockResearchResult.json" with { type: "json" };
import { Logger } from "../lib/logger.js";

export async function runResearchAgent(tasks: string[], logger: Logger): Promise<ResearchResult> {
    if (process.env.USE_MOCK_ALL === "true" || process.env.USE_MOCK_RESEARCH === "true") {
        return mockResearchResult as ResearchResult;
    }
    const response = await generateText({
        model: openai(process.env.RESEARCH_LLM_MODEL || "gpt-5.4-nano"),
        output: Output.object({
            schema: researchSchema,
        }),
        prompt: researchPrompt(tasks),
        tools: {
            webSearch: openai.tools.webSearch(),
        },
        stopWhen: stepCountIs(5),
    });
    logger.metric("Research LLM metrics", {
        inputTokens: response.totalUsage.inputTokens,
        outputTokens: response.totalUsage.outputTokens,
        totalTokens: response.totalUsage.totalTokens,
        finishReason: response.finishReason,
        stepCount: response.steps.length,
        toolCallCount: response.toolCalls.length,
    });
    return response.output;
}
