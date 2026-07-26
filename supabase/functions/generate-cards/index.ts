import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

// Model and limits are pinned server-side so a leaked anon key can't be used
// as a general-purpose OpenAI proxy or to run up spend on expensive models.
const MODEL = "gpt-4o-mini";
const MAX_OUTPUT_TOKENS = 8000;
const RATE_LIMIT_PER_HOUR = 30;
const MAX_PROMPT_CHARS = 8_000;
const MAX_TEXT_CHARS = 60_000;
const MAX_IMAGE_BASE64_CHARS = 8_000_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-device-id",
};

const SYSTEM_PROMPT = `You are a helpful assistant that generates structured data. Always respond with valid JSON matching this exact structure:
${JSON.stringify(
  { cards: [{ front: "Question or term goes here", back: "Answer or definition goes here" }] },
  null,
  2
)}

Respond ONLY with the JSON object, no markdown, no code fences, no extra text.`;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface Payload {
  kind: "messages" | "text" | "image";
  messages?: { role: "user" | "system" | "assistant"; content: string }[];
  text?: string;
  prompt?: string;
  imageBase64?: string;
  mimeType?: string;
}

type OpenAIMessage = {
  role: "user" | "system" | "assistant";
  content: string | unknown[];
};

function buildMessages(payload: Payload): OpenAIMessage[] | { error: string } {
  if (payload.kind === "messages") {
    const messages = payload.messages ?? [];
    const total = messages.reduce((n, m) => n + (typeof m.content === "string" ? m.content.length : 0), 0);
    if (messages.length === 0 || total > MAX_PROMPT_CHARS) {
      return { error: "Invalid or oversized messages." };
    }
    return messages.map((m) => ({ role: m.role, content: m.content }));
  }

  const prompt = payload.prompt ?? "";
  if (!prompt || prompt.length > MAX_PROMPT_CHARS) {
    return { error: "Invalid or oversized prompt." };
  }

  if (payload.kind === "text") {
    const text = payload.text ?? "";
    if (!text || text.length > MAX_TEXT_CHARS) {
      return { error: `Text must be between 1 and ${MAX_TEXT_CHARS} characters.` };
    }
    return [
      {
        role: "user",
        content: `${prompt}\n\n--- CONTENT START ---\n${text}\n--- CONTENT END ---`,
      },
    ];
  }

  if (payload.kind === "image") {
    const imageBase64 = payload.imageBase64 ?? "";
    const mimeType = payload.mimeType ?? "";
    if (!imageBase64 || imageBase64.length > MAX_IMAGE_BASE64_CHARS) {
      return { error: "Missing or oversized image." };
    }
    if (!/^image\/[a-z0-9.+-]+$/i.test(mimeType)) {
      return { error: "Invalid image mime type." };
    }
    return [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
        ],
      },
    ];
  }

  return { error: "Unknown kind." };
}

async function checkRateLimit(deviceId: string, ip: string): Promise<Response | null> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();

  const { count, error } = await supabase
    .from("ai_usage")
    .select("*", { count: "exact", head: true })
    .or(`device_id.eq.${deviceId},ip.eq.${ip}`)
    .gte("created_at", oneHourAgo);

  if (error) return json(500, { error: "Rate limit check failed." });
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return json(429, { error: "Too many generations this hour. Please try again later." });
  }

  const { error: insertError } = await supabase.from("ai_usage").insert({ device_id: deviceId, ip });
  if (insertError) return json(500, { error: "Rate limit tracking failed." });
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed." });
  if (!OPENAI_API_KEY) return json(500, { error: "OPENAI_API_KEY secret is not configured." });

  const deviceId = (req.headers.get("x-device-id") ?? "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
  if (!deviceId) return json(400, { error: "Missing x-device-id header." });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const messages = buildMessages(payload);
  if ("error" in messages) return json(400, messages);

  const rateLimited = await checkRateLimit(deviceId, ip);
  if (rateLimited) return rateLimited;

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: MAX_OUTPUT_TOKENS,
    }),
  });

  if (!response.ok) {
    const status = response.status === 429 ? 429 : 502;
    return json(status, { error: `AI provider error (${response.status}).` });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return json(502, { error: "No content returned from AI provider." });

  try {
    return json(200, JSON.parse(content));
  } catch {
    return json(502, { error: "AI provider returned malformed JSON." });
  }
});
