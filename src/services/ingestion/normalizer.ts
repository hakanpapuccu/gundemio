import type { IngestionSource, NormalizedArticleCandidate, ParsedFeedItem } from './types';
import {
  extractImageFromHtml,
  normalizeUrl,
  parseDateToIso,
  pickFirstNonEmpty,
  stripHtml,
  truncate,
} from './utils';

const SUMMARY_MAX_LENGTH = 320;
const CONTENT_MAX_LENGTH = 12000;

function fallbackHash(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

async function createContentHash(input: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    return fallbackHash(input);
  }

  const encoded = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoded);

  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function normalizeTitle(
  rawTitle: string | null,
  fallbackSummary: string | null,
  link: string
): string {
  const title = rawTitle ? stripHtml(rawTitle) : null;
  if (title) {
    return title;
  }

  if (fallbackSummary) {
    return truncate(stripHtml(fallbackSummary), 90) ?? 'Untitled';
  }

  try {
    const parsedUrl = new URL(link);
    return parsedUrl.hostname.replace(/^www\./, '');
  } catch {
    return 'Untitled';
  }
}

function normalizeBodyText(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return stripHtml(value);
}

export async function normalizeFeedItem(
  source: IngestionSource,
  item: ParsedFeedItem
): Promise<NormalizedArticleCandidate | null> {
  const guid = item.guid?.trim() || null;
  const link = normalizeUrl(item.link) ?? normalizeUrl(guid);
  if (!link) {
    return null;
  }

  const normalizedSummary = normalizeBodyText(item.summary);
  const normalizedContent = normalizeBodyText(item.content);
  const imageUrl = pickFirstNonEmpty([
    normalizeUrl(item.imageUrl),
    extractImageFromHtml(item.content),
    extractImageFromHtml(item.summary),
  ]);

  const title = normalizeTitle(item.title, normalizedSummary, link);
  const summary = truncate(normalizedSummary, SUMMARY_MAX_LENGTH);
  const content = truncate(normalizedContent, CONTENT_MAX_LENGTH);
  const publishedAt = parseDateToIso(item.publishedAt);

  const hashSeed = [
    source.id,
    guid ?? '',
    link,
    title,
    summary ?? '',
    content ?? '',
    publishedAt,
  ].join('|');
  const contentHash = await createContentHash(hashSeed);

  return {
    sourceId: source.id,
    sourceName: source.name,
    title,
    summary,
    content,
    imageUrl,
    link,
    publishedAt,
    categoryId: source.categoryId,
    guid,
    contentHash,
  };
}
