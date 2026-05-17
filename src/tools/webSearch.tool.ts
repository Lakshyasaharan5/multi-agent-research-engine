import { tavilySearch } from "@tavily/ai-sdk";
import { tool } from "ai";
import { z } from "zod";

const mockSearch = tool({
    description: "Search the web for information.",
    inputSchema: z.object({
        query: z.string(),
    }),
    execute: async ({ query }) => {
        return {
            results: [
                {
                    title: `Mock source for ${query}`,
                    url: "https://example.com/mock-source",
                    content: `Mock research content for: ${query}`,
                },
            ],
        };
    },
});

export const webSearchTool =
    process.env.USE_MOCK_RESEARCH === "true"
        ? mockSearch
        : tavilySearch({
              searchDepth: "basic",
              includeAnswer: true,
              maxResults: 5,
              topic: "general",
          });
