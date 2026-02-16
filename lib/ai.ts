import { z } from 'zod';

/**
 * AI generation utility for DeckIQ.
 *
 * Configure your AI provider API key below or via environment variables.
 * Supports OpenAI-compatible endpoints (OpenAI, Anthropic via proxy, etc.)
 *
 * For production, move the API key to a backend proxy to avoid exposing it
 * in the client bundle.
 */

const AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL || 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY || '';
const AI_MODEL = process.env.EXPO_PUBLIC_AI_MODEL || 'gpt-4o-mini';

interface GenerateObjectOptions<T extends z.ZodType> {
  messages: { role: 'user' | 'system' | 'assistant'; content: string }[];
  schema: T;
}

/**
 * Generates a structured object from an AI model using JSON mode.
 * Generates structured AI output with Zod schema validation.
 */
export async function generateObject<T extends z.ZodType>(
  options: GenerateObjectOptions<T>
): Promise<z.infer<T>> {
  const { messages, schema } = options;

  if (!AI_API_KEY) {
    throw new Error(
      'AI API key is not configured. Set EXPO_PUBLIC_AI_API_KEY in your .env file.'
    );
  }

  // Build a JSON schema description from the Zod schema for the system prompt
  const schemaDescription = zodToPromptDescription(schema);

  const systemMessage = {
    role: 'system' as const,
    content: `You are a helpful assistant that generates structured data. Always respond with valid JSON matching this exact structure:\n${schemaDescription}\n\nRespond ONLY with the JSON object, no markdown, no code fences, no extra text.`,
  };

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [systemMessage, ...messages],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`AI API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from AI API.');
  }

  // Parse and validate against the Zod schema
  const parsed = JSON.parse(content);
  return schema.parse(parsed);
}

/**
 * Converts a Zod schema to a human-readable JSON structure description
 * for the AI system prompt.
 */
function zodToPromptDescription(schema: z.ZodType): string {
  // For the flashcard use case, provide a concrete example
  try {
    return JSON.stringify(
      {
        cards: [
          {
            front: 'Question or term goes here',
            back: 'Answer or definition goes here',
          },
        ],
      },
      null,
      2
    );
  } catch {
    return '{ "cards": [{ "front": "string", "back": "string" }] }';
  }
}
