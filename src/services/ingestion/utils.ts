const IMAGE_SOURCE_PATTERN = /<img[^>]+src=["']([^"']+)["']/i;

const TRACKING_QUERY_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
];

export function toArray<TValue>(value: TValue | TValue[] | null | undefined): TValue[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return [];
  }

  return [value];
}

export function pickFirstNonEmpty(values: (string | null | undefined)[]): string | null {
  for (const value of values) {
    if (!value) {
      continue;
    }

    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return null;
}

export function extractText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim() || null;
  }

  if (Array.isArray(value)) {
    const nestedTexts = value.map((item) => extractText(item));
    return pickFirstNonEmpty(nestedTexts);
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const text = pickFirstNonEmpty([
      extractText(record['#text']),
      extractText(record.__cdata),
      extractText(record._),
      extractText(record.text),
      extractText(record.value),
    ]);

    if (text) {
      return text;
    }
  }

  return null;
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function stripHtml(value: string): string {
  const withoutScripts = value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const withoutTags = withoutScripts.replace(/<[^>]+>/g, ' ');

  return decodeHtmlEntities(normalizeWhitespace(withoutTags));
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

export function truncate(value: string | null, maxLength: number): string | null {
  if (!value) {
    return null;
  }

  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1)}…`;
}

export function normalizeUrl(value: string | null): string | null {
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

export function extractImageFromHtml(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const match = IMAGE_SOURCE_PATTERN.exec(value);
  if (!match || !match[1]) {
    return null;
  }

  return normalizeUrl(match[1]);
}

export function parseDateToIso(value: string | null): string {
  if (!value) {
    return new Date().toISOString();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

export function isMissingColumnError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error && typeof error.code === 'string' ? error.code : '';
  return code === '42703';
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return String(error);
}

export function chunked<TValue>(values: TValue[], size: number): TValue[][] {
  if (size <= 0) {
    return [values];
  }

  const chunks: TValue[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}
