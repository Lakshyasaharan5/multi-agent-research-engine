import { generateText } from 'ai';
import openai from '../lib/ai';

export async function runSafetyAgent(userQuery: string) {
  const response = await generateText({
    model: openai('gpt-5.4-nano'),
    prompt: `
        You are a safety agent.

        Check if this user query is safe to process.

        User query:
        ${userQuery}

        Return only one word:
        safe or unsafe
        `,
  });

  return {
    result: response.text.trim().toLowerCase(),
  };
}