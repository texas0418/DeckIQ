-- Rate-limit ledger for the generate-cards edge function.
-- Only the service role (used inside the edge function) touches this table;
-- RLS is enabled with no policies so anon/authenticated clients have no access.
create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  device_id text not null,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_device_created_idx
  on public.ai_usage (device_id, created_at desc);

create index if not exists ai_usage_ip_created_idx
  on public.ai_usage (ip, created_at desc);

alter table public.ai_usage enable row level security;
