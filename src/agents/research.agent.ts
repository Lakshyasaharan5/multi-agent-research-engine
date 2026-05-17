import { generateText, Output, stepCountIs } from "ai";
import openai from "../lib/ai";
import { researchPrompt } from "../prompts/research.prompt";
import { webSearchTool } from "../tools/webSearch.tool";
import { researchSchema, type ResearchResult } from "../schemas/research.schema";
import mockResearchResult from "../dummy/mockResearchResult.json";

export async function runResearchAgent(tasks: string[]): Promise<ResearchResult> {
    if (process.env.USE_MOCK === "true") {
        return mockResearchResult as ResearchResult;
    }
    const response = await generateText({
        model: openai("gpt-5.4-nano"),
        output: Output.object({
            schema: researchSchema,
        }),
        prompt: researchPrompt(tasks),
        tools: {
            webSearch: openai.tools.webSearch(),
        },
        stopWhen: stepCountIs(5),
    });

    return response.output;
}