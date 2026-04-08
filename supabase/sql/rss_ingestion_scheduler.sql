-- Run this in Supabase SQL Editor with an admin role.
-- This script only prepares scheduling. It does not deploy Edge Functions.

-- 1) Optional schema hardening for ingestion
alter table public.sources
  add column if not exists rss_url text;

alter table public.articles
  add column if not exists guid text,
  add column if not exists content_hash text;

create unique index if not exists uq_articles_link on public.articles (link);
create unique index if not exists uq_articles_guid on public.articles (guid) where guid is not null;
create unique index if not exists uq_articles_content_hash on public.articles (content_hash) where content_hash is not null;

-- 2) Enable required extensions for scheduled HTTP trigger
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 3) Save service role key in Vault (replace YOUR_SERVICE_ROLE_KEY)
insert into vault.secrets (name, secret)
values ('rss_ingest_service_role', 'YOUR_SERVICE_ROLE_KEY')
on conflict (name) do update set secret = excluded.secret;

-- 4) Schedule every 15 minutes
-- Replace project ref if needed.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'rss-ingestion-15min') then
    perform cron.unschedule('rss-ingestion-15min');
  end if;
end
$$;

select cron.schedule(
  'rss-ingestion-15min',
  '*/15 * * * *',
  $$
  select
    net.http_post(
      url := 'https://urypwtaoylepkhascmkp.supabase.co/functions/v1/rss-ingest',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'rss_ingest_service_role' limit 1)
      ),
      body := jsonb_build_object(
        'dryRun', false,
        'maxItemsPerSource', 100,
        'fetchTimeoutMs', 15000
      )
    );
  $$
);
