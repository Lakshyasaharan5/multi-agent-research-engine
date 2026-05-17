import { generateText, Output } from 'ai';
import openai from '../lib/ai';

import { safetySchema, SafetyResult } from '../schemas/safety.schema';
import { safetyPrompt } from '../prompts/safety.prompt';

export async function runSafetyAgent(userQuery: string): Promise<SafetyResult> {
  const response = await generateText({
    model: openai('gpt-5.4-nano'),
    output: Output.object({
      schema: safetySchema,
    }),
    prompt: safetyPrompt(userQuery),
  });

  return response.output;
}