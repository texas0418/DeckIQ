import { z } from 'zod';

import { getDeviceId } from './deviceId';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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

async function callGenerateCards<T extends z.ZodType>(
  payload: Record<string, unknown>,
  schema: T
): Promise<z.infer<T>> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'AI backend is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
    );
  }

  const deviceId = await getDeviceId();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
      'x-device-id': deviceId,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = `AI API error (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // keep the generic message
    }
    throw new Error(message);
  }

  const parsed = await response.json();
  return schema.parse(parsed);
}

/**
 * Generates structured AI output from text messages with Zod schema validation.
 */
export async function generateObject<T extends z.ZodType>(
  options: GenerateObjectOptions<T>
): Promise<z.infer<T>> {
  const { messages, schema } = options;
  return callGenerateCards({ kind: 'messages', messages }, schema);
}

/**
 * Generates structured AI output from an image using the vision API.
 */
export async function generateFromImage<T extends z.ZodType>(
  options: GenerateFromImageOptions<T>
): Promise<z.infer<T>> {
  const { imageBase64, mimeType, prompt, schema } = options;
  return callGenerateCards({ kind: 'image', imageBase64, mimeType, prompt }, schema);
}

/**
 * Generates structured AI output from a long text (pasted notes, document text).
 */
export async function generateFromText<T extends z.ZodType>(
  options: GenerateFromTextOptions<T>
): Promise<z.infer<T>> {
  const { text, prompt, schema } = options;
  return callGenerateCards({ kind: 'text', text, prompt }, schema);
}
