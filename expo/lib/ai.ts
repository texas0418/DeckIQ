import { z } from 'zod';

const AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL || 'https://api.openai.com/v1/chat/completions';
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY || '';
const AI_MODEL = process.env.EXPO_PUBLIC_AI_MODEL || 'gpt-4o-mini';

interface GenerateObjectOptions<T extends z.ZodType> {
  messages: { role: 'user' | 'system' | 'assistant'; content: string }[];
  schema: T;
}

interface GenerateFromImageOptions<T extends z.ZodType> {
  imageBase64: string;
  mimeType: string;
  prompt: string;
  schema: T;
}

interface GenerateFromTextOptions<T extends z.ZodType> {
  text: string;
  prompt: string;
  schema: T;
}

/**
 * Generates structured AI output from text messages with Zod schema validation.
 */
export async function generateObject<T extends z.ZodType>(
  options: GenerateObjectOptions<T>
): Promise<z.infer<T>> {
  const { messages, schema } = options;

  if (!AI_API_KEY) {
    throw new Error('AI API key is not configured. Set EXPO_PUBLIC_AI_API_KEY in your .env file.');
  }

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

  const parsed = JSON.parse(content);
  return schema.parse(parsed);
}

/**
 * Generates structured AI output from an image using the vision API.
 */
export async function generateFromImage<T extends z.ZodType>(
  options: GenerateFromImageOptions<T>
): Promise<z.infer<T>> {
  const { imageBase64, mimeType, prompt, schema } = options;

  if (!AI_API_KEY) {
    throw new Error('AI API key is not configured. Set EXPO_PUBLIC_AI_API_KEY in your .env file.');
  }

  const schemaDescription = zodToPromptDescription(schema);

  const systemMessage = {
    role: 'system' as const,
    content: `You are a helpful assistant that generates structured data. Always respond with valid JSON matching this exact structure:\n${schemaDescription}\n\nRespond ONLY with the JSON object, no markdown, no code fences, no extra text.`,
  };

  const userMessage = {
    role: 'user' as const,
    content: [
      { type: 'text' as const, text: prompt },
      {
        type: 'image_url' as const,
        image_url: {
          url: `data:${mimeType};base64,${imageBase64}`,
        },
      },
    ],
  };

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [systemMessage, userMessage],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4096,
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

  const parsed = JSON.parse(content);
  return schema.parse(parsed);
}

/**
 * Generates structured AI output from a long text (pasted notes, document text).
 */
export async function generateFromText<T extends z.ZodType>(
  options: GenerateFromTextOptions<T>
): Promise<z.infer<T>> {
  const { text, prompt, schema } = options;

  if (!AI_API_KEY) {
    throw new Error('AI API key is not configured. Set EXPO_PUBLIC_AI_API_KEY in your .env file.');
  }

  const schemaDescription = zodToPromptDescription(schema);

  const systemMessage = {
    role: 'system' as const,
    content: `You are a helpful assistant that generates structured data. Always respond with valid JSON matching this exact structure:\n${schemaDescription}\n\nRespond ONLY with the JSON object, no markdown, no code fences, no extra text.`,
  };

  const userMessage = {
    role: 'user' as const,
    content: `${prompt}\n\n--- CONTENT START ---\n${text}\n--- CONTENT END ---`,
  };

  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [systemMessage, userMessage],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4096,
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

  const parsed = JSON.parse(content);
  return schema.parse(parsed);
}

function zodToPromptDescription(schema: z.ZodType): string {
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
