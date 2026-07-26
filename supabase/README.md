# Supabase backend for DeckIQ

The `generate-cards` edge function proxies the OpenAI Chat Completions API so the
OpenAI key never ships inside the app bundle. It pins the model (`gpt-4o-mini`),
caps output tokens and input sizes, and rate-limits to 30 generations per hour
per device/IP using the `ai_usage` table.

## One-time deployment

Prereq: a Supabase project for DeckIQ (the org's free tier allows 2 active
projects — pause or upgrade if at the limit).

1. Apply the migration in `migrations/` (via MCP, dashboard SQL editor, or
   `supabase db push`).
2. Set the OpenAI key as a function secret (dashboard → Edge Functions →
   Secrets, or):

   ```bash
   supabase secrets set OPENAI_API_KEY=<your-new-openai-key> --project-ref <ref>
   ```

3. Deploy the function:

   ```bash
   supabase functions deploy generate-cards --project-ref <ref>
   ```

4. Configure the app (EAS env or `.env` in `expo/`):

   - `EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY=<legacy anon key>` (must be the JWT-style
     anon key — the function is deployed with JWT verification on)

   The old `EXPO_PUBLIC_AI_API_URL` / `EXPO_PUBLIC_AI_API_KEY` /
   `EXPO_PUBLIC_AI_MODEL` vars are no longer read.

## After the update ships

Rotate (revoke) the OpenAI key that was embedded in the previously shipped app
binaries. Until it is rotated, that key remains extractable and usable by
anyone. Rotating it breaks AI generation on old app versions — ship this
update first, then rotate.
