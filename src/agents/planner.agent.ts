import { generateText, Output } from "ai";
import { plannerPrompt } from "../prompts/planner.prompt";
import { plannerSchema, PlannerResult } from "../schemas/planner.schema";
import openai from "../lib/ai";

export async function runPlannerAgent(cleanedQuery: string): Promise<PlannerResult> {
  const response = await generateText({
    model: openai("gpt-5.4-nano"),
    output: Output.object({
      schema: plannerSchema,
    }),
    prompt: plannerPrompt(cleanedQuery),
  });

  return response.output;
}