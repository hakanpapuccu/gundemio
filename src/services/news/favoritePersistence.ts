import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Favorite } from '../../domain/models/news';
import type { ToggleFavoriteInput } from './types';

const FAVORITES_STORAGE_KEY_PREFIX = 'gundemio:favorites:';
const memoryFavoritesStore = new Map<string, Set<string>>();

type FavoritePersistence = {
  listFavoriteArticleIds: (userId: string, articleIds?: string[]) => Promise<string[]>;
  toggleFavorite: (input: ToggleFavoriteInput) => Promise<Favorite>;
};

function createStorageKey(userId: string) {
  return `${FAVORITES_STORAGE_KEY_PREFIX}${userId}`;
}

function getMemoryFavoriteSet(userId: string) {
  const existing = memoryFavoritesStore.get(userId);
  if (existing) {
    return existing;
  }

  const next = new Set<string>();
  memoryFavoritesStore.set(userId, next);
  return next;
}

function parseFavoriteIds(rawValue: string | null) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === 'string' && value.length > 0);
  } catch {
    return [];
  }
}

async function readFavoriteIds(userId: string) {
  const rawValue = await AsyncStorage.getItem(createStorageKey(userId));
  return parseFavoriteIds(rawValue);
}

async function writeFavoriteIds(userId: string, articleIds: string[]) {
  await AsyncStorage.setItem(createStorageKey(userId), JSON.stringify(articleIds));
}

function createFavoriteRecord(input: ToggleFavoriteInput): Favorite {
  return {
    id: `${input.userId}-${input.articleId}`,
    userId: input.userId,
    articleId: input.articleId,
    createdAt: new Date().toISOString(),
  };
}

function filterByArticleIds(values: string[], articleIds?: string[]) {
  if (!articleIds || articleIds.length === 0) {
    return values;
  }

  const articleIdSet = new Set(articleIds);
  return values.filter((value) => articleIdSet.has(value));
}

async function listLocalFavoriteArticleIds(userId: string, articleIds?: string[]) {
  try {
    const ids = await readFavoriteIds(userId);
    return filterByArticleIds(ids, articleIds);
  } catch {
    const memoryValues = [...getMemoryFavoriteSet(userId)];
    return filterByArticleIds(memoryValues, articleIds);
  }
}

async function toggleLocalFavorite(input: ToggleFavoriteInput): Promise<Favorite> {
  try {
    const current = await readFavoriteIds(input.userId);
    const next = new Set(current);

    if (input.isFavorite) {
      next.add(input.articleId);
    } else {
      next.delete(input.articleId);
    }

    await writeFavoriteIds(input.userId, [...next]);
    return createFavoriteRecord(input);
  } catch {
    const memorySet = getMemoryFavoriteSet(input.userId);

    if (input.isFavorite) {
      memorySet.add(input.articleId);
    } else {
      memorySet.delete(input.articleId);
    }

    return createFavoriteRecord(input);
  }
}

export const localFavoritePersistence: FavoritePersistence = {
  listFavoriteArticleIds: listLocalFavoriteArticleIds,
  toggleFavorite: toggleLocalFavorite,
};

