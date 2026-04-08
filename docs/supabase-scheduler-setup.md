# Supabase Periodic RSS Ingestion Setup

This project includes:

- Edge Function: `supabase/functions/rss-ingest/index.ts`
- SQL scheduler script: `supabase/sql/rss_ingestion_scheduler.sql`

## Required prerequisites

- Supabase project admin access
- `SUPABASE_SERVICE_ROLE_KEY`
- Supabase CLI installed and authenticated

## 1) Deploy edge function

```bash
supabase functions deploy rss-ingest --project-ref urypwtaoylepkhascmkp
```

Set function secrets:

```bash
supabase secrets set SUPABASE_URL=https://urypwtaoylepkhascmkp.supabase.co --project-ref urypwtaoylepkhascmkp
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY --project-ref urypwtaoylepkhascmkp
```

## 2) Apply scheduler SQL

Run `supabase/sql/rss_ingestion_scheduler.sql` in Supabase SQL Editor.

The script:

- Adds optional ingestion columns (`sources.rss_url`, `articles.guid`, `articles.content_hash`)
- Adds dedupe indexes
- Creates a `pg_cron` job that calls the edge function every 15 minutes

If you want to pass runtime options (for example max items or dry run), update the `body` in
`supabase/sql/rss_ingestion_scheduler.sql`:

```sql
body := jsonb_build_object(
  'dryRun', false,
  'maxItemsPerSource', 100,
  'fetchTimeoutMs', 15000
)
```

## 3) Verify

Check logs:

- Supabase Dashboard > Edge Functions > `rss-ingest` > Logs
- Supabase Dashboard > Database > `cron.job_run_details`
