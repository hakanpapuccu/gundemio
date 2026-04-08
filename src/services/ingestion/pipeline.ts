import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../types/supabase';
import {
  dedupeWithinBatch,
  detectDuplicateCapabilities,
  filterDuplicatesAgainstDatabase,
} from './deduplication';
import { parseFeedItems } from './feedParser';
import { normalizeFeedItem } from './normalizer';
import { readActiveSources } from './sourceReader';
import type {
  ArticleInsert,
  DuplicateCapabilities,
  IngestionLogger,
  IngestionOptions,
  IngestionRunSummary,
  NormalizedArticleCandidate,
  SourceIngestionReport,
} from './types';
import { chunked, errorMessage } from './utils';

const DEFAULT_FETCH_TIMEOUT_MS = 12_000;

function createDefaultLogger(): IngestionLogger {
  return {
    info: (message, meta) => {
      console.info(message, meta ?? {});
    },
    warn: (message, meta) => {
      console.warn(message, meta ?? {});
    },
    error: (message, meta) => {
      console.error(message, meta ?? {});
    },
  };
}

function createSourceReport(source: {
  id: string;
  name: string;
  feedUrl: string;
}): SourceIngestionReport {
  return {
    sourceId: source.id,
    sourceName: source.name,
    feedUrl: source.feedUrl,
    fetchedItems: 0,
    normalizedItems: 0,
    inBatchDuplicates: 0,
    dbDuplicates: 0,
    inserted: 0,
    skipped: 0,
    errors: [],
  };
}

async function fetchFeedXml(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept:
          'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'User-Agent': 'gundemio-rss-ingestion/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Feed request failed with status ${response.status}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildInsertPayload(
  candidate: NormalizedArticleCandidate,
  capabilities: DuplicateCapabilities
): ArticleInsert {
  const payload: ArticleInsert = {
    title: candidate.title,
    summary: candidate.summary,
    content: candidate.content,
    image_url: candidate.imageUrl,
    link: candidate.link,
    published_at: candidate.publishedAt,
    source_id: candidate.sourceId,
    category_id: candidate.categoryId,
  };

  if (capabilities.supportsGuid) {
    payload.guid = candidate.guid;
  }

  if (capabilities.supportsContentHash) {
    payload.content_hash = candidate.contentHash;
  }

  return payload;
}

async function insertChunk(
  client: SupabaseClient<Database>,
  chunk: NormalizedArticleCandidate[],
  capabilities: DuplicateCapabilities
): Promise<{
  insertedCandidates: NormalizedArticleCandidate[];
  failedCandidates: NormalizedArticleCandidate[];
}> {
  if (chunk.length === 0) {
    return { insertedCandidates: [], failedCandidates: [] };
  }

  const payloads = chunk.map((item) => buildInsertPayload(item, capabilities));
  const { error } = await client.from('articles').insert(payloads);
  if (!error) {
    return { insertedCandidates: chunk, failedCandidates: [] };
  }

  const insertedCandidates: NormalizedArticleCandidate[] = [];
  const failedCandidates: NormalizedArticleCandidate[] = [];

  for (const candidate of chunk) {
    const singlePayload = buildInsertPayload(candidate, capabilities);
    const { error: singleError } = await client.from('articles').insert(singlePayload);
    if (singleError) {
      failedCandidates.push(candidate);
      continue;
    }

    insertedCandidates.push(candidate);
  }

  return { insertedCandidates, failedCandidates };
}

async function insertCandidates(
  client: SupabaseClient<Database>,
  candidates: NormalizedArticleCandidate[],
  capabilities: DuplicateCapabilities,
  reportMap: Map<string, SourceIngestionReport>
): Promise<{ inserted: number; failed: number }> {
  let inserted = 0;
  let failed = 0;

  for (const chunk of chunked(candidates, 50)) {
    const result = await insertChunk(client, chunk, capabilities);
    inserted += result.insertedCandidates.length;
    failed += result.failedCandidates.length;

    for (const candidate of result.insertedCandidates) {
      const report = reportMap.get(candidate.sourceId);
      if (!report) {
        continue;
      }

      report.inserted += 1;
    }

    for (const candidate of result.failedCandidates) {
      const report = reportMap.get(candidate.sourceId);
      if (!report) {
        continue;
      }

      report.errors.push(`Insert failed for ${candidate.link}`);
      report.skipped += 1;
    }
  }

  return { inserted, failed };
}

export async function runRssIngestion(
  client: SupabaseClient<Database>,
  options: IngestionOptions = {}
): Promise<IngestionRunSummary> {
  const logger = options.logger ?? createDefaultLogger();
  const startedAt = new Date().toISOString();
  const timeoutMs = options.fetchTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const dryRun = options.dryRun ?? false;

  const sources = await readActiveSources(client, options.sourceIds);
  const reports = sources.map((source) => createSourceReport(source));
  const reportMap = new Map<string, SourceIngestionReport>(
    reports.map((report) => [report.sourceId, report])
  );

  const candidates: NormalizedArticleCandidate[] = [];
  let fetchedItems = 0;
  let normalizedItems = 0;
  let inBatchDuplicates = 0;
  let failedSources = 0;

  for (const source of sources) {
    const report = reportMap.get(source.id);
    if (!report) {
      continue;
    }

    try {
      logger.info('Fetching feed', {
        sourceId: source.id,
        sourceName: source.name,
        feedUrl: source.feedUrl,
      });
      const xml = await fetchFeedXml(source.feedUrl, timeoutMs);
      const parsedItems = parseFeedItems(xml);

      report.fetchedItems = parsedItems.length;
      fetchedItems += parsedItems.length;

      const limitedItems =
        options.maxItemsPerSource && options.maxItemsPerSource > 0
          ? parsedItems.slice(0, options.maxItemsPerSource)
          : parsedItems;

      const normalizedBySource: NormalizedArticleCandidate[] = [];
      for (const item of limitedItems) {
        const normalized = await normalizeFeedItem(source, item);
        if (!normalized) {
          report.skipped += 1;
          continue;
        }

        normalizedBySource.push(normalized);
      }

      report.normalizedItems = normalizedBySource.length;
      normalizedItems += normalizedBySource.length;

      const deduped = dedupeWithinBatch(normalizedBySource);
      report.inBatchDuplicates = deduped.duplicateCount;
      report.skipped += deduped.duplicateCount;
      inBatchDuplicates += deduped.duplicateCount;
      candidates.push(...deduped.items);
    } catch (error) {
      failedSources += 1;
      const message = errorMessage(error);
      report.errors.push(message);
      logger.error('Source ingestion failed', {
        sourceId: source.id,
        sourceName: source.name,
        message,
      });
    }
  }

  const capabilities = await detectDuplicateCapabilities(client, logger);
  const dbDeduped = await filterDuplicatesAgainstDatabase(client, candidates, capabilities);
  const keptKeys = new Set(
    dbDeduped.items.map((item) => `${item.link}|${item.guid ?? ''}|${item.contentHash}`)
  );

  for (const duplicate of candidates) {
    const key = `${duplicate.link}|${duplicate.guid ?? ''}|${duplicate.contentHash}`;
    if (keptKeys.has(key)) {
      continue;
    }

    const report = reportMap.get(duplicate.sourceId);
    if (!report) {
      continue;
    }

    report.dbDuplicates += 1;
    report.skipped += 1;
  }

  let inserted = 0;
  if (!dryRun) {
    const insertResult = await insertCandidates(client, dbDeduped.items, capabilities, reportMap);
    inserted = insertResult.inserted;
  }

  const skipped = reports.reduce((total, report) => total + report.skipped, 0);
  const finishedAt = new Date().toISOString();

  return {
    startedAt,
    finishedAt,
    sourceCount: sources.length,
    fetchedItems,
    normalizedItems,
    inBatchDuplicates,
    dbDuplicates: dbDeduped.duplicateCount,
    inserted,
    skipped,
    failedSources,
    dryRun,
    sources: reports,
  };
}
