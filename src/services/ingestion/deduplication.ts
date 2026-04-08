import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../types/supabase';
import type { DuplicateCapabilities, IngestionLogger, NormalizedArticleCandidate } from './types';
import { chunked, isMissingColumnError } from './utils';

function buildDedupeKeys(candidate: NormalizedArticleCandidate): string[] {
  const keys = [`hash:${candidate.contentHash}`];
  if (candidate.guid) {
    keys.push(`guid:${candidate.guid.toLowerCase()}`);
  }
  keys.push(`link:${candidate.link}`);
  return keys;
}

export function dedupeWithinBatch(candidates: NormalizedArticleCandidate[]): {
  items: NormalizedArticleCandidate[];
  duplicateCount: number;
} {
  const seenKeys = new Set<string>();
  const uniqueItems: NormalizedArticleCandidate[] = [];
  let duplicateCount = 0;

  for (const candidate of candidates) {
    const keys = buildDedupeKeys(candidate);
    const alreadySeen = keys.some((key) => seenKeys.has(key));

    if (alreadySeen) {
      duplicateCount += 1;
      continue;
    }

    for (const key of keys) {
      seenKeys.add(key);
    }
    uniqueItems.push(candidate);
  }

  return { items: uniqueItems, duplicateCount };
}

async function checkGuidSupport(client: SupabaseClient<Database>) {
  const { error } = await client.from('articles').select('id,guid').limit(1);
  if (!error) {
    return true;
  }

  if (isMissingColumnError(error)) {
    return false;
  }

  throw error;
}

async function checkContentHashSupport(client: SupabaseClient<Database>) {
  const { error } = await client.from('articles').select('id,content_hash').limit(1);
  if (!error) {
    return true;
  }

  if (isMissingColumnError(error)) {
    return false;
  }

  throw error;
}

export async function detectDuplicateCapabilities(
  client: SupabaseClient<Database>,
  logger: IngestionLogger
): Promise<DuplicateCapabilities> {
  const [supportsGuid, supportsContentHash] = await Promise.all([
    checkGuidSupport(client),
    checkContentHashSupport(client),
  ]);

  if (!supportsGuid) {
    logger.warn('articles.guid column not found. GUID dedupe will be skipped.');
  }

  if (!supportsContentHash) {
    logger.warn('articles.content_hash column not found. Hash dedupe will be skipped.');
  }

  return { supportsGuid, supportsContentHash };
}

async function collectExistingByLink(
  client: SupabaseClient<Database>,
  links: string[]
): Promise<Set<string>> {
  const set = new Set<string>();

  for (const chunk of chunked(links, 200)) {
    if (chunk.length === 0) {
      continue;
    }

    const { data, error } = await client.from('articles').select('link').in('link', chunk);
    if (error) {
      throw error;
    }

    for (const row of data ?? []) {
      if (row.link) {
        set.add(row.link);
      }
    }
  }

  return set;
}

async function collectExistingByGuid(
  client: SupabaseClient<Database>,
  guids: string[]
): Promise<Set<string>> {
  const set = new Set<string>();

  for (const chunk of chunked(guids, 200)) {
    if (chunk.length === 0) {
      continue;
    }

    const { data, error } = await client.from('articles').select('guid').in('guid', chunk);
    if (error) {
      throw error;
    }

    for (const row of data ?? []) {
      if (row.guid) {
        set.add(row.guid.toLowerCase());
      }
    }
  }

  return set;
}

async function collectExistingByHash(
  client: SupabaseClient<Database>,
  hashes: string[]
): Promise<Set<string>> {
  const set = new Set<string>();

  for (const chunk of chunked(hashes, 200)) {
    if (chunk.length === 0) {
      continue;
    }

    const { data, error } = await client
      .from('articles')
      .select('content_hash')
      .in('content_hash', chunk);
    if (error) {
      throw error;
    }

    for (const row of data ?? []) {
      if (row.content_hash) {
        set.add(row.content_hash);
      }
    }
  }

  return set;
}

export async function filterDuplicatesAgainstDatabase(
  client: SupabaseClient<Database>,
  candidates: NormalizedArticleCandidate[],
  capabilities: DuplicateCapabilities
): Promise<{ items: NormalizedArticleCandidate[]; duplicateCount: number }> {
  if (candidates.length === 0) {
    return { items: [], duplicateCount: 0 };
  }

  const uniqueLinks = [...new Set(candidates.map((candidate) => candidate.link))];
  const uniqueGuids = capabilities.supportsGuid
    ? [
        ...new Set(
          candidates
            .map((candidate) => candidate.guid?.toLowerCase() ?? null)
            .filter((guid): guid is string => Boolean(guid))
        ),
      ]
    : [];
  const uniqueHashes = capabilities.supportsContentHash
    ? [...new Set(candidates.map((candidate) => candidate.contentHash))]
    : [];

  const [existingLinks, existingGuids, existingHashes] = await Promise.all([
    collectExistingByLink(client, uniqueLinks),
    capabilities.supportsGuid
      ? collectExistingByGuid(client, uniqueGuids)
      : Promise.resolve(new Set<string>()),
    capabilities.supportsContentHash
      ? collectExistingByHash(client, uniqueHashes)
      : Promise.resolve(new Set<string>()),
  ]);

  const filtered: NormalizedArticleCandidate[] = [];
  let duplicateCount = 0;

  for (const candidate of candidates) {
    const hasLink = existingLinks.has(candidate.link);
    const hasGuid = capabilities.supportsGuid
      ? Boolean(candidate.guid && existingGuids.has(candidate.guid.toLowerCase()))
      : false;
    const hasHash = capabilities.supportsContentHash
      ? existingHashes.has(candidate.contentHash)
      : false;

    if (hasLink || hasGuid || hasHash) {
      duplicateCount += 1;
      continue;
    }

    filtered.push(candidate);
  }

  return { items: filtered, duplicateCount };
}
