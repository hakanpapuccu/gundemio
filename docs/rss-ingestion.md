# RSS Ingestion Pipeline

## What this pipeline does

- Reads active sources from Supabase (`sources.is_active = true`).
- Pulls each feed URL (`sources.rss_url`, fallback: `sources.website_url`).
- Parses RSS/Atom items.
- Normalizes article payload (`title`, `summary`, `content`, `image_url`, `link`, `published_at`).
- Deduplicates by `guid` / `link` / `content_hash`.
- Inserts only new records into `articles`.
- Logs source-level failures and continues with other feeds.

## Run locally

- Seed Turkish RSS sources:
  - `npm run seed:turkish-sources`
- Dry run:
  - `npm run ingest:rss:dry`
- Real insert:
  - `npm run ingest:rss`

The script prints a JSON summary with per-source stats.

## Required env vars

- `SUPABASE_URL` (fallback: `EXPO_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY` (fallback: `EXPO_PUBLIC_SUPABASE_ANON_KEY`, not recommended for production)

Optional:

- `RSS_INGEST_TIMEOUT_MS` (default `12000`)
- `RSS_INGEST_MAX_ITEMS_PER_SOURCE` (default unlimited)
- `RSS_INGEST_DRY_RUN` (`true/false`)
- `RSS_INGEST_SOURCE_IDS` (comma-separated source UUID list)

Important:

- `seed:turkish-sources` and real article insertion require write permission on Supabase.
- Use `SUPABASE_SERVICE_ROLE_KEY` for production ingestion.

## Database assumptions

- `sources` table includes:
  - `id`, `name`, `category_id`, `is_active`, `website_url`
  - optional `rss_url` (recommended)
- `articles` table includes:
  - required: `title`, `summary`, `content`, `image_url`, `link`, `published_at`, `source_id`, `category_id`
  - recommended dedupe columns: `guid`, `content_hash`

If `guid` / `content_hash` columns do not exist, pipeline falls back to link-based dedupe and logs a warning.

## Recommended SQL constraints/indexes

```sql
-- On sources
create index if not exists idx_sources_active on public.sources (is_active);
create index if not exists idx_sources_rss_url on public.sources (rss_url) where rss_url is not null;

-- On articles
create unique index if not exists uq_articles_link on public.articles (link);
create unique index if not exists uq_articles_guid on public.articles (guid) where guid is not null;
create unique index if not exists uq_articles_content_hash on public.articles (content_hash) where content_hash is not null;
create index if not exists idx_articles_published_at on public.articles (published_at desc);
```

## Scheduling options

- Supabase cron + Edge Function webhook trigger.
- External scheduler (GitHub Actions, Render cron, Fly cron, etc.) executing:
  - `npm run ingest:rss`

## Edge function execution options

`supabase/functions/rss-ingest` now accepts optional JSON payload for runtime control:

```json
{
  "dryRun": false,
  "fetchTimeoutMs": 15000,
  "maxItemsPerSource": 100,
  "sourceIds": ["<source-uuid>"]
}
```

Environment fallbacks supported by edge function:

- `RSS_INGEST_TIMEOUT_MS`
- `RSS_INGEST_MAX_ITEMS_PER_SOURCE`
- `RSS_INGEST_DRY_RUN`
- `RSS_INGEST_SOURCE_IDS`
