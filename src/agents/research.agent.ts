import { generateText, stepCountIs } from "ai";
import { tavilySearch } from "@tavily/ai-sdk";
import openai from "../lib/ai";
import { researchPrompt } from "../prompts/research.prompt";

export async function runResearchAgent(tasks: string[]) {
  const response = await generateText({
    model: openai("gpt-5.4-nano"),
    prompt: researchPrompt(tasks),
    tools: {
      tavilySearch: tavilySearch({
        searchDepth: "basic",
        includeAnswer: true,
        maxResults: 5,
        topic: "general",
      }),
    },
    stopWhen: stepCountIs(5),
  });

  return {
    findings: response.text,
  };
}