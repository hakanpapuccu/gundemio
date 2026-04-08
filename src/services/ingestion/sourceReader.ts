import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../types/supabase';
import type { IngestionSource } from './types';
import { isMissingColumnError, normalizeUrl } from './utils';

type SourceSelectRow = {
  id: string;
  name: string;
  category_id: string | null;
  website_url: string | null;
  rss_url?: string | null;
};

function mapSourceRows(rows: SourceSelectRow[]): IngestionSource[] {
  return rows
    .map((row) => {
      const feedUrl = normalizeUrl(row.rss_url ?? row.website_url);
      if (!feedUrl) {
        return null;
      }

      return {
        id: row.id,
        name: row.name,
        categoryId: row.category_id,
        feedUrl,
      } satisfies IngestionSource;
    })
    .filter((row): row is IngestionSource => Boolean(row));
}

export async function readActiveSources(
  client: SupabaseClient<Database>,
  sourceIds?: string[]
): Promise<IngestionSource[]> {
  let queryWithRss = client
    .from('sources')
    .select('id,name,category_id,website_url,rss_url')
    .eq('is_active', true);

  if (sourceIds && sourceIds.length > 0) {
    queryWithRss = queryWithRss.in('id', sourceIds);
  }

  const withRssResult = await queryWithRss;
  if (!withRssResult.error) {
    return mapSourceRows((withRssResult.data ?? []) as SourceSelectRow[]);
  }

  if (!isMissingColumnError(withRssResult.error)) {
    throw withRssResult.error;
  }

  let fallbackQuery = client
    .from('sources')
    .select('id,name,category_id,website_url')
    .eq('is_active', true);
  if (sourceIds && sourceIds.length > 0) {
    fallbackQuery = fallbackQuery.in('id', sourceIds);
  }

  const fallbackResult = await fallbackQuery;
  if (fallbackResult.error) {
    throw fallbackResult.error;
  }

  return mapSourceRows((fallbackResult.data ?? []) as SourceSelectRow[]);
}
