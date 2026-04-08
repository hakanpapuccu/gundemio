import { XMLParser } from 'fast-xml-parser';

import type { ParsedFeedItem } from './types';
import { extractText, normalizeUrl, pickFirstNonEmpty, toArray } from './utils';

type XmlNode = Record<string, unknown>;

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

function parseRssItem(rawItem: XmlNode): ParsedFeedItem {
  return {
    title: extractText(rawItem.title),
    guid: extractText(rawItem.guid),
    link: extractText(rawItem.link),
    summary: extractText(rawItem.description),
    content: pickFirstNonEmpty([
      extractText(rawItem['content:encoded']),
      extractText(rawItem.description),
    ]),
    publishedAt: pickFirstNonEmpty([
      extractText(rawItem.pubDate),
      extractText(rawItem.published),
      extractText(rawItem.updated),
      extractText(rawItem.dcDate),
      extractText(rawItem['dc:date']),
    ]),
    imageUrl: extractMediaUrl(rawItem),
  };
}

function resolveAtomLink(entry: XmlNode): string | null {
  const linkValue = entry.link;
  if (!linkValue) {
    return null;
  }

  if (typeof linkValue === 'string') {
    return linkValue;
  }

  const links = toArray(linkValue);
  for (const linkItem of links) {
    const linkRecord = asRecord(linkItem);
    if (!linkRecord) {
      continue;
    }

    const rel = typeof linkRecord['@_rel'] === 'string' ? linkRecord['@_rel'] : '';
    const href = typeof linkRecord['@_href'] === 'string' ? linkRecord['@_href'] : '';
    if (!href) {
      continue;
    }

    if (!rel || rel === 'alternate') {
      return href;
    }
  }

  return null;
}

function parseAtomEntry(rawEntry: XmlNode): ParsedFeedItem {
  const content = pickFirstNonEmpty([extractText(rawEntry.content), extractText(rawEntry.summary)]);

  return {
    title: extractText(rawEntry.title),
    guid: pickFirstNonEmpty([extractText(rawEntry.id), extractText(rawEntry.guid)]),
    link: resolveAtomLink(rawEntry),
    summary: extractText(rawEntry.summary),
    content,
    publishedAt: pickFirstNonEmpty([
      extractText(rawEntry.published),
      extractText(rawEntry.updated),
      extractText(rawEntry.pubDate),
    ]),
    imageUrl: extractMediaUrl(rawEntry),
  };
}

function parseRssDocument(document: XmlNode): ParsedFeedItem[] {
  const rss = asRecord(document.rss);
  if (!rss) {
    return [];
  }

  const channel = asRecord(rss.channel);
  if (!channel) {
    return [];
  }

  return toArray(channel.item)
    .map((item) => asRecord(item))
    .filter((item): item is XmlNode => Boolean(item))
    .map(parseRssItem);
}

function parseRdfDocument(document: XmlNode): ParsedFeedItem[] {
  const rdf = asRecord(document['rdf:RDF']);
  if (!rdf) {
    return [];
  }

  return toArray(rdf.item)
    .map((item) => asRecord(item))
    .filter((item): item is XmlNode => Boolean(item))
    .map(parseRssItem);
}

function parseAtomDocument(document: XmlNode): ParsedFeedItem[] {
  const feed = asRecord(document.feed);
  if (!feed) {
    return [];
  }

  return toArray(feed.entry)
    .map((entry) => asRecord(entry))
    .filter((entry): entry is XmlNode => Boolean(entry))
    .map(parseAtomEntry);
}

export function parseFeedItems(xml: string): ParsedFeedItem[] {
  const parsed = parser.parse(xml) as XmlNode;

  const rssItems = parseRssDocument(parsed);
  if (rssItems.length > 0) {
    return rssItems;
  }

  const rdfItems = parseRdfDocument(parsed);
  if (rdfItems.length > 0) {
    return rdfItems;
  }

  const atomItems = parseAtomDocument(parsed);
  if (atomItems.length > 0) {
    return atomItems;
  }

  return [];
}
