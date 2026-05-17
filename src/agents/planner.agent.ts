import { generateText, Output } from "ai";
import { plannerPrompt } from "../prompts/planner.prompt";
import { plannerSchema, PlannerResult } from "../schemas/planner.schema";
import openai from "../lib/ai";
import mockPlannerResult from "../dummy/mockPlannerResult.json";

export async function runPlannerAgent(input: {
    cleanedQuery: string;
    safetyDecision: "allow" | "refuse" | "caution";
    riskFlags: string[];
}): Promise<PlannerResult> {
    if (process.env.USE_MOCK === "true" || process.env.USE_MOCK_PLANNER === "true") {
        return mockPlannerResult as PlannerResult;
    }
    const response = await generateText({
        model: openai("gpt-5.4-nano"),
        output: Output.object({
            schema: plannerSchema,
        }),
        prompt: plannerPrompt(input),
    });

    return response.output;
}
