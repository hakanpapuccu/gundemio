/* eslint-disable import/no-unresolved */
import { createClient } from 'npm:@supabase/supabase-js@2.49.8';
import { XMLParser } from 'npm:fast-xml-parser@5.5.10';

type SourceRow = {
  id: string;
  name: string;
  category_id: string | null;
  website_url: string | null;
  rss_url?: string | null;
};

type ParsedFeedItem = {
  title: string | null;
  guid: string | null;
  link: string | null;
  summary: string | null;
  content: string | null;
  publishedAt: string | null;
  imageUrl: string | null;
};

type NormalizedArticle = {
  sourceId: string;
  sourceName: string;
  categoryId: string | null;
  title: string;
  summary: string | null;
  content: string | null;
  imageUrl: string | null;
  link: string;
  guid: string | null;
  contentHash: string;
  publishedAt: string;
};

type IngestionOptions = {
  sourceIds?: string[];
  fetchTimeoutMs?: number;
  maxItemsPerSource?: number;
  dryRun?: boolean;
};

type DuplicateCapabilities = {
  supportsGuid: boolean;
  supportsContentHash: boolean;
};

type SourceReport = {
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

type IngestionSummary = {
  startedAt: string;
  finishedAt: string;
  dryRun: boolean;
  sourceCount: number;
  fetchedItems: number;
  normalizedItems: number;
  inBatchDuplicates: number;
  dbDuplicates: number;
  inserted: number;
  skipped: number;
  failedSources: number;
  sources: SourceReport[];
};

type ErrorLike = {
  code?: string;
  message?: string;
};

type XmlNode = Record<string, unknown>;

const DEFAULT_FETCH_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_ITEMS_PER_SOURCE = 100;
const SUMMARY_MAX_LENGTH = 320;
const CONTENT_MAX_LENGTH = 12_000;
const IMAGE_SOURCE_PATTERN = /<img[^>]+src=["']([^"']+)["']/i;

const TRACKING_QUERY_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
  parseTagValue: false,
  cdataPropName: '__cdata',
});

function asRecord(value: unknown): XmlNode | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as XmlNode;
}

function toArray<TValue>(value: TValue | TValue[] | null | undefined): TValue[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [value];
}

function pickFirstNonEmpty(values: (string | null | undefined)[]): string | null {
  for (const value of values) {
    if (!value) {
      continue;
    }

    const normalized = value.trim();
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function extractText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim() || null;
  }

  if (Array.isArray(value)) {
    return pickFirstNonEmpty(value.map((item) => extractText(item)));
  }

  const record = asRecord(value);
  if (!record) {
    return null;
  }

  return pickFirstNonEmpty([
    extractText(record['#text']),
    extractText(record.__cdata),
    extractText(record._),
    extractText(record.text),
    extractText(record.value),
  ]);
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function stripHtml(value: string): string {
  const withoutScripts = value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const withoutTags = withoutScripts.replace(/<[^>]+>/g, ' ');
  return decodeHtmlEntities(normalizeWhitespace(withoutTags));
}

function truncate(value: string | null, maxLength: number): string | null {
  if (!value) {
    return null;
  }

  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

function normalizeUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    url.hash = '';
    for (const key of TRACKING_QUERY_PARAMS) {
      url.searchParams.delete(key);
    }

    if (url.pathname.endsWith('/') && url.pathname !== '/') {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  } catch {
    return null;
  }
}

function extractImageFromHtml(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const match = IMAGE_SOURCE_PATTERN.exec(value);
  if (!match?.[1]) {
    return null;
  }

  return normalizeUrl(match[1]);
}

function parseDateToIso(value: string | null): string {
  if (!value) {
    return new Date().toISOString();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

function isMissingColumn(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return 'code' in error && (error as ErrorLike).code === '42703';
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return 'code' in error && (error as ErrorLike).code === '23505';
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as ErrorLike).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  return String(error);
}

function chunked<TValue>(values: TValue[], size: number): TValue[][] {
  if (size <= 0) {
    return [values];
  }

  const chunks: TValue[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'y'].includes(value.toLowerCase());
  }

  return fallback;
}

function parseInteger(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.floor(value);
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function parseSourceIds(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const ids = value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean);
    return ids.length > 0 ? ids : undefined;
  }

  if (typeof value === 'string') {
    const ids = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return ids.length > 0 ? ids : undefined;
  }

  return undefined;
}

function parseOptions(input: unknown): IngestionOptions {
  const payload = asRecord(input) ?? {};

  const envTimeout = Deno.env.get('RSS_INGEST_TIMEOUT_MS');
  const envMaxItems = Deno.env.get('RSS_INGEST_MAX_ITEMS_PER_SOURCE');
  const envDryRun = Deno.env.get('RSS_INGEST_DRY_RUN');
  const envSourceIds = Deno.env.get('RSS_INGEST_SOURCE_IDS');

  const fetchTimeoutMs = Math.max(
    1000,
    parseInteger(payload.fetchTimeoutMs ?? envTimeout, DEFAULT_FETCH_TIMEOUT_MS)
  );
  const maxItemsPerSource = Math.max(
    0,
    parseInteger(payload.maxItemsPerSource ?? envMaxItems, DEFAULT_MAX_ITEMS_PER_SOURCE)
  );
  const dryRun = parseBoolean(payload.dryRun ?? envDryRun, false);
  const sourceIds = parseSourceIds(payload.sourceIds ?? envSourceIds);

  return {
    sourceIds,
    fetchTimeoutMs,
    maxItemsPerSource,
    dryRun,
  };
}

function extractMediaUrl(node: XmlNode): string | null {
  const enclosure = asRecord(node.enclosure);
  const enclosureUrl =
    enclosure && typeof enclosure['@_url'] === 'string' ? normalizeUrl(enclosure['@_url']) : null;

  const mediaContent = toArray(node['media:content'])
    .map((item) => asRecord(item))
    .find((item): item is XmlNode => Boolean(item));
  const mediaContentUrl =
    mediaContent && typeof mediaContent['@_url'] === 'string'
      ? normalizeUrl(mediaContent['@_url'])
      : null;

  const mediaThumbnail = toArray(node['media:thumbnail'])
    .map((item) => asRecord(item))
    .find((item): item is XmlNode => Boolean(item));
  const mediaThumbnailUrl =
    mediaThumbnail && typeof mediaThumbnail['@_url'] === 'string'
      ? normalizeUrl(mediaThumbnail['@_url'])
      : null;

  return pickFirstNonEmpty([mediaContentUrl, mediaThumbnailUrl, enclosureUrl]);
}

function parseRssItem(item: XmlNode): ParsedFeedItem {
  return {
    title: extractText(item.title),
    guid: extractText(item.guid),
    link: extractText(item.link),
    summary: extractText(item.description),
    content: pickFirstNonEmpty([extractText(item['content:encoded']), extractText(item.description)]),
    publishedAt: pickFirstNonEmpty([
      extractText(item.pubDate),
      extractText(item.published),
      extractText(item.updated),
      extractText(item.dcDate),
      extractText(item['dc:date']),
    ]),
    imageUrl: extractMediaUrl(item),
  };
}

function resolveAtomLink(entry: XmlNode): string | null {
  if (!entry.link) {
    return null;
  }

  if (typeof entry.link === 'string') {
    return entry.link;
  }

  const links = toArray(entry.link);
  for (const linkItem of links) {
    const linkRecord = asRecord(linkItem);
    if (!linkRecord) {
      continue;
    }

    const rel = typeof linkRecord['@_rel'] === 'string' ? linkRecord['@_rel'] : '';
    const href = typeof linkRecord['@_href'] === 'string' ? linkRecord['@_href'] : '';

    if (href && (!rel || rel === 'alternate')) {
      return href;
    }
  }

  return null;
}

function parseAtomEntry(entry: XmlNode): ParsedFeedItem {
  return {
    title: extractText(entry.title),
    guid: pickFirstNonEmpty([extractText(entry.id), extractText(entry.guid)]),
    link: resolveAtomLink(entry),
    summary: extractText(entry.summary),
    content: pickFirstNonEmpty([extractText(entry.content), extractText(entry.summary)]),
    publishedAt: pickFirstNonEmpty([
      extractText(entry.published),
      extractText(entry.updated),
      extractText(entry.pubDate),
    ]),
    imageUrl: extractMediaUrl(entry),
  };
}

function parseFeedItems(xml: string): ParsedFeedItem[] {
  const parsed = parser.parse(xml) as XmlNode;

  const rss = asRecord(parsed.rss);
  if (rss) {
    const channel = asRecord(rss.channel);
    if (channel) {
      return toArray(channel.item)
        .map((item) => asRecord(item))
        .filter((item): item is XmlNode => Boolean(item))
        .map(parseRssItem);
    }
  }

  const rdf = asRecord(parsed['rdf:RDF']);
  if (rdf) {
    return toArray(rdf.item)
      .map((item) => asRecord(item))
      .filter((item): item is XmlNode => Boolean(item))
      .map(parseRssItem);
  }

  const feed = asRecord(parsed.feed);
  if (feed) {
    return toArray(feed.entry)
      .map((entry) => asRecord(entry))
      .filter((entry): entry is XmlNode => Boolean(entry))
      .map(parseAtomEntry);
  }

  return [];
}

async function createContentHash(input: string): Promise<string> {
  const payload = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', payload);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function normalizeTitle(rawTitle: string | null, fallbackSummary: string | null, link: string): string {
  const title = rawTitle ? stripHtml(rawTitle) : null;
  if (title) {
    return title;
  }

  if (fallbackSummary) {
    return truncate(fallbackSummary, 90) ?? 'Untitled';
  }

  try {
    const parsed = new URL(link);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'Untitled';
  }
}

async function normalizeItem(source: SourceRow, item: ParsedFeedItem): Promise<NormalizedArticle | null> {
  const guid = item.guid?.trim() || null;
  const link = normalizeUrl(item.link) ?? normalizeUrl(guid);
  if (!link) {
    return null;
  }

  const normalizedSummary = item.summary ? stripHtml(item.summary) : null;
  const normalizedContent = item.content ? stripHtml(item.content) : null;
  const summary = truncate(normalizedSummary, SUMMARY_MAX_LENGTH);
  const content = truncate(normalizedContent, CONTENT_MAX_LENGTH);
  const title = normalizeTitle(item.title, normalizedSummary, link);
  const imageUrl = pickFirstNonEmpty([
    normalizeUrl(item.imageUrl),
    extractImageFromHtml(item.content),
    extractImageFromHtml(item.summary),
  ]);

  const publishedAt = parseDateToIso(item.publishedAt);
  const contentHash = await createContentHash(
    [source.id, guid ?? '', link, title, summary ?? '', content ?? '', publishedAt].join('|')
  );

  return {
    sourceId: source.id,
    sourceName: source.name,
    categoryId: source.category_id,
    title,
    summary,
    content,
    imageUrl,
    link,
    guid,
    contentHash,
    publishedAt,
  };
}

function buildDedupeKeys(candidate: NormalizedArticle): string[] {
  const keys = [`hash:${candidate.contentHash}`, `link:${candidate.link}`];

  if (candidate.guid) {
    keys.push(`guid:${candidate.guid.toLowerCase()}`);
  }

  return keys;
}

function dedupeWithinBatch(candidates: NormalizedArticle[]): {
  items: NormalizedArticle[];
  duplicateCount: number;
} {
  const seenKeys = new Set<string>();
  const uniqueItems: NormalizedArticle[] = [];
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

function createSourceReport(source: { id: string; name: string; feedUrl: string }): SourceReport {
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
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Accept:
        'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      'User-Agent': 'gundemio-edge-rss-ingest/2.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Feed request failed with status ${response.status}`);
  }

  return await response.text();
}

async function readActiveSources(client: ReturnType<typeof createClient>, sourceIds?: string[]) {
  let queryWithRss = client
    .from('sources')
    .select('id,name,category_id,website_url,rss_url')
    .eq('is_active', true);

  if (sourceIds && sourceIds.length > 0) {
    queryWithRss = queryWithRss.in('id', sourceIds);
  }

  const withRss = await queryWithRss;
  if (!withRss.error) {
    return (withRss.data ?? []) as SourceRow[];
  }

  if (!isMissingColumn(withRss.error)) {
    throw new Error(withRss.error.message);
  }

  let fallbackQuery = client
    .from('sources')
    .select('id,name,category_id,website_url')
    .eq('is_active', true);

  if (sourceIds && sourceIds.length > 0) {
    fallbackQuery = fallbackQuery.in('id', sourceIds);
  }

  const fallback = await fallbackQuery;
  if (fallback.error) {
    throw new Error(fallback.error.message);
  }

  return (fallback.data ?? []) as SourceRow[];
}

async function detectDuplicateCapabilities(
  client: ReturnType<typeof createClient>
): Promise<DuplicateCapabilities> {
  const [guidCheck, hashCheck] = await Promise.all([
    client.from('articles').select('id,guid').limit(1),
    client.from('articles').select('id,content_hash').limit(1),
  ]);

  if (guidCheck.error && !isMissingColumn(guidCheck.error)) {
    throw new Error(guidCheck.error.message);
  }

  if (hashCheck.error && !isMissingColumn(hashCheck.error)) {
    throw new Error(hashCheck.error.message);
  }

  return {
    supportsGuid: !guidCheck.error,
    supportsContentHash: !hashCheck.error,
  };
}

async function collectExistingByLink(client: ReturnType<typeof createClient>, links: string[]) {
  const existing = new Set<string>();

  if (links.length === 0) {
    return existing;
  }

  for (const chunk of chunked(links, 200)) {
    const { data, error } = await client.from('articles').select('link').in('link', chunk);
    if (error) {
      throw new Error(error.message);
    }

    for (const row of data ?? []) {
      if (row.link) {
        existing.add(row.link);
      }
    }
  }

  return existing;
}

async function collectExistingByGuid(client: ReturnType<typeof createClient>, guids: string[]) {
  const existing = new Set<string>();

  if (guids.length === 0) {
    return existing;
  }

  for (const chunk of chunked(guids, 200)) {
    const { data, error } = await client.from('articles').select('guid').in('guid', chunk);
    if (error) {
      throw new Error(error.message);
    }

    for (const row of data ?? []) {
      if (row.guid) {
        existing.add(row.guid.toLowerCase());
      }
    }
  }

  return existing;
}

async function collectExistingByHash(client: ReturnType<typeof createClient>, hashes: string[]) {
  const existing = new Set<string>();

  if (hashes.length === 0) {
    return existing;
  }

  for (const chunk of chunked(hashes, 200)) {
    const { data, error } = await client
      .from('articles')
      .select('content_hash')
      .in('content_hash', chunk);
    if (error) {
      throw new Error(error.message);
    }

    for (const row of data ?? []) {
      if (row.content_hash) {
        existing.add(row.content_hash);
      }
    }
  }

  return existing;
}

async function filterDuplicatesAgainstDatabase(
  client: ReturnType<typeof createClient>,
  candidates: NormalizedArticle[],
  capabilities: DuplicateCapabilities
): Promise<{ items: NormalizedArticle[]; duplicateCount: number }> {
  if (candidates.length === 0) {
    return { items: [], duplicateCount: 0 };
  }

  const uniqueLinks = [...new Set(candidates.map((item) => item.link))];
  const uniqueGuids = capabilities.supportsGuid
    ? [
        ...new Set(
          candidates
            .map((item) => item.guid?.toLowerCase() ?? null)
            .filter((guid): guid is string => Boolean(guid))
        ),
      ]
    : [];
  const uniqueHashes = capabilities.supportsContentHash
    ? [...new Set(candidates.map((item) => item.contentHash))]
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

  const filtered: NormalizedArticle[] = [];
  let duplicateCount = 0;

  for (const item of candidates) {
    const hasLink = existingLinks.has(item.link);
    const hasGuid = capabilities.supportsGuid
      ? Boolean(item.guid && existingGuids.has(item.guid.toLowerCase()))
      : false;
    const hasHash = capabilities.supportsContentHash ? existingHashes.has(item.contentHash) : false;

    if (hasLink || hasGuid || hasHash) {
      duplicateCount += 1;
      continue;
    }

    filtered.push(item);
  }

  return { items: filtered, duplicateCount };
}

function buildInsertPayload(item: NormalizedArticle, capabilities: DuplicateCapabilities) {
  const payload: Record<string, unknown> = {
    title: item.title,
    summary: item.summary,
    content: item.content,
    image_url: item.imageUrl,
    link: item.link,
    published_at: item.publishedAt,
    source_id: item.sourceId,
    category_id: item.categoryId,
  };

  if (capabilities.supportsGuid) {
    payload.guid = item.guid;
  }

  if (capabilities.supportsContentHash) {
    payload.content_hash = item.contentHash;
  }

  return payload;
}

async function insertCandidates(
  client: ReturnType<typeof createClient>,
  candidates: NormalizedArticle[],
  capabilities: DuplicateCapabilities,
  reportMap: Map<string, SourceReport>
) {
  let inserted = 0;

  for (const chunk of chunked(candidates, 50)) {
    const payload = chunk.map((item) => buildInsertPayload(item, capabilities));
    const { error } = await client.from('articles').insert(payload);

    if (!error) {
      inserted += chunk.length;
      for (const item of chunk) {
        const report = reportMap.get(item.sourceId);
        if (report) {
          report.inserted += 1;
        }
      }
      continue;
    }

    for (const item of chunk) {
      const singlePayload = buildInsertPayload(item, capabilities);
      const { error: singleError } = await client.from('articles').insert(singlePayload);
      const report = reportMap.get(item.sourceId);

      if (!singleError) {
        inserted += 1;
        if (report) {
          report.inserted += 1;
        }
        continue;
      }

      if (isUniqueViolation(singleError)) {
        if (report) {
          report.dbDuplicates += 1;
          report.skipped += 1;
        }
        continue;
      }

      if (report) {
        report.skipped += 1;
        report.errors.push(`Insert failed (${item.link}): ${singleError.message}`);
      }
    }
  }

  return inserted;
}

async function runIngestion(options: IngestionOptions): Promise<IngestionSummary> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRole) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const startedAt = new Date().toISOString();
  const dryRun = options.dryRun ?? false;
  const fetchTimeoutMs = options.fetchTimeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const maxItemsPerSource = options.maxItemsPerSource ?? DEFAULT_MAX_ITEMS_PER_SOURCE;

  const client = createClient(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const sources = await readActiveSources(client, options.sourceIds);
  const reports = new Map<string, SourceReport>();

  const normalizedCandidates: NormalizedArticle[] = [];
  let fetchedItems = 0;
  let normalizedItems = 0;
  let inBatchDuplicates = 0;
  let failedSources = 0;

  for (const source of sources) {
    const feedUrl = normalizeUrl(source.rss_url ?? source.website_url);
    if (!feedUrl) {
      const sourceReport = createSourceReport({
        id: source.id,
        name: source.name,
        feedUrl: source.rss_url ?? source.website_url ?? '',
      });
      sourceReport.errors.push('Missing valid feed URL');
      reports.set(source.id, sourceReport);
      failedSources += 1;
      continue;
    }

    const sourceReport = createSourceReport({
      id: source.id,
      name: source.name,
      feedUrl,
    });
    reports.set(source.id, sourceReport);

    try {
      const xml = await fetchFeedXml(feedUrl, fetchTimeoutMs);
      const parsedItems = parseFeedItems(xml);
      fetchedItems += parsedItems.length;
      sourceReport.fetchedItems = parsedItems.length;

      const limitedItems =
        maxItemsPerSource > 0 ? parsedItems.slice(0, maxItemsPerSource) : parsedItems;
      const normalizedForSource: NormalizedArticle[] = [];

      for (const item of limitedItems) {
        const normalized = await normalizeItem(source, item);
        if (!normalized) {
          sourceReport.skipped += 1;
          continue;
        }

        normalizedForSource.push(normalized);
      }

      sourceReport.normalizedItems = normalizedForSource.length;
      normalizedItems += normalizedForSource.length;

      const deduped = dedupeWithinBatch(normalizedForSource);
      sourceReport.inBatchDuplicates = deduped.duplicateCount;
      sourceReport.skipped += deduped.duplicateCount;
      inBatchDuplicates += deduped.duplicateCount;

      normalizedCandidates.push(...deduped.items);
    } catch (error) {
      failedSources += 1;
      sourceReport.errors.push(errorMessage(error));
    }
  }

  const capabilities = await detectDuplicateCapabilities(client);
  const dbDeduped = await filterDuplicatesAgainstDatabase(client, normalizedCandidates, capabilities);

  const keptKeys = new Set(
    dbDeduped.items.map((item) => `${item.link}|${item.guid ?? ''}|${item.contentHash}`)
  );

  for (const item of normalizedCandidates) {
    const key = `${item.link}|${item.guid ?? ''}|${item.contentHash}`;
    if (keptKeys.has(key)) {
      continue;
    }

    const report = reports.get(item.sourceId);
    if (!report) {
      continue;
    }

    report.dbDuplicates += 1;
    report.skipped += 1;
  }

  let inserted = 0;
  if (!dryRun) {
    inserted = await insertCandidates(client, dbDeduped.items, capabilities, reports);
  }

  const sourceReports = [...reports.values()];
  const totalSkipped = sourceReports.reduce((total, report) => total + report.skipped, 0);
  const totalDbDuplicates = sourceReports.reduce((total, report) => total + report.dbDuplicates, 0);

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    dryRun,
    sourceCount: sources.length,
    fetchedItems,
    normalizedItems,
    inBatchDuplicates,
    dbDuplicates: totalDbDuplicates,
    inserted,
    skipped: totalSkipped,
    failedSources,
    sources: sourceReports,
  };
}

async function parseRequestOptions(request: Request): Promise<IngestionOptions> {
  if (request.method !== 'POST') {
    return parseOptions(null);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return parseOptions(null);
  }

  try {
    const body = await request.json();
    return parseOptions(body);
  } catch {
    return parseOptions(null);
  }
}

Deno.serve(async (request) => {
  try {
    const options = await parseRequestOptions(request);
    const summary = await runIngestion(options);

    return new Response(JSON.stringify(summary, null, 2), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify(
        {
          error: errorMessage(error),
        },
        null,
        2
      ),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
