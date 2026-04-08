import type { PostgrestError } from '@supabase/supabase-js';

import type { Database } from '../../types/supabase';

export type IngestionSource = {
  id: string;
  name: string;
  categoryId: string | null;
  feedUrl: string;
};

export type ParsedFeedItem = {
  title: string | null;
  guid: string | null;
  link: string | null;
  summary: string | null;
  content: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
};

export type NormalizedArticleCandidate = {
  sourceId: string;
  sourceName: string;
  title: string;
  summary: string | null;
  content: string | null;
  imageUrl: string | null;
  link: string;
  publishedAt: string;
  categoryId: string | null;
  guid: string | null;
  contentHash: string;
};

export type IngestionLogger = {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
};

export type IngestionOptions = {
  sourceIds?: string[];
  fetchTimeoutMs?: number;
  maxItemsPerSource?: number;
  dryRun?: boolean;
  logger?: IngestionLogger;
};

export type SourceIngestionReport = {
  sourceId: string;
  sourceName: string;
  feedUrl: string;
  fetchedItems: number;
  normalizedItems: number;
  inBatchDuplicates: number;
  dbDuplicates: number;
  inserted: number;
  skipped: number;
  errors: string[];
};

export type IngestionRunSummary = {
  startedAt: string;
  finishedAt: string;
  sourceCount: number;
  fetchedItems: number;
  normalizedItems: number;
  inBatchDuplicates: number;
  dbDuplicates: number;
  inserted: number;
  skipped: number;
  failedSources: number;
  dryRun: boolean;
  sources: SourceIngestionReport[];
};

export type DuplicateCapabilities = {
  supportsGuid: boolean;
  supportsContentHash: boolean;
};

export type ArticleInsert = Database['public']['Tables']['articles']['Insert'];

export function isPostgrestError(value: unknown): value is PostgrestError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string' &&
    'code' in value
  );
}
