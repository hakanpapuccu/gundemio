import fs from 'node:fs';
import path from 'node:path';

import { createClient } from '@supabase/supabase-js';

import { runRssIngestion } from '../src/services/ingestion';
import type { Database } from '../src/types/supabase';

function readFromDotEnv(key: string): string {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    return '';
  }

  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const currentKey = trimmed.slice(0, separatorIndex).trim();
    if (currentKey !== key) {
      continue;
    }

    return trimmed.slice(separatorIndex + 1).trim();
  }

  return '';
}

function readEnv(key: string): string {
  return process.env[key]?.trim() || readFromDotEnv(key);
}

function parseInteger(value: string, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: string): boolean {
  return ['1', 'true', 'yes', 'y'].includes(value.toLowerCase());
}

const supabaseUrl = readEnv('SUPABASE_URL') || readEnv('EXPO_PUBLIC_SUPABASE_URL');
const supabaseServiceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');
const supabaseAnonKey = readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase env values. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or fallback EXPO_PUBLIC_* values) before running.'
  );
  process.exit(1);
}

if (!supabaseServiceRoleKey) {
  console.warn(
    'SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to anon key may fail on insert due to RLS. Use service role key for production ingestion.'
  );
}

const sourceIds = (readEnv('RSS_INGEST_SOURCE_IDS') || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const fetchTimeoutMs = parseInteger(readEnv('RSS_INGEST_TIMEOUT_MS'), 12_000);
const maxItemsPerSource = parseInteger(readEnv('RSS_INGEST_MAX_ITEMS_PER_SOURCE'), 0);
const dryRun = parseBoolean(readEnv('RSS_INGEST_DRY_RUN') || '');

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  const summary = await runRssIngestion(supabase, {
    sourceIds: sourceIds.length > 0 ? sourceIds : undefined,
    fetchTimeoutMs,
    maxItemsPerSource: maxItemsPerSource > 0 ? maxItemsPerSource : undefined,
    dryRun,
  });

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('RSS ingestion failed:', message);
  process.exit(1);
});
