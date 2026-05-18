import { generateText, Output } from "ai";
import { plannerPrompt } from "../prompts/planner.prompt";
import { plannerSchema, PlannerResult } from "../schemas/planner.schema";
import openai from "../lib/ai";
import mockPlannerResult from "../dummy/mockPlannerResult.json";
import { Logger } from "../lib/logger";

export async function runPlannerAgent(
    input: {
        cleanedQuery: string;
        safetyDecision: "allow" | "refuse" | "caution";
        riskFlags: string[];
    },
    logger: Logger,
): Promise<PlannerResult> {
    if (process.env.USE_MOCK_ALL === "true" || process.env.USE_MOCK_PLANNER === "true") {
        return mockPlannerResult as PlannerResult;
    }
    const response = await generateText({
        model: openai(process.env.PLANNER_LLM_MODEL || "gpt-5.4-nano"),
        output: Output.object({
            schema: plannerSchema,
        }),
        prompt: plannerPrompt(input),
    });
    logger.metric("LLM metrics", {
        inputTokens: response.totalUsage.inputTokens,
        outputTokens: response.totalUsage.outputTokens,
        totalTokens: response.totalUsage.totalTokens,
        finishReason: response.finishReason,
    });
    return response.output;
}
