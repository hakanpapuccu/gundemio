import type {
  Article,
  Category,
  Favorite,
  PaginatedResult,
  Source,
  UserPreferences,
} from '../../domain/models/news';
import type { ListArticlesParams, ListSourcesParams, ToggleFavoriteInput, UpsertPreferencesInput } from './types';
import { createPaginatedResult, resolvePagination } from './pagination';

const hourAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const mockCategories: Category[] = [
  {
    id: 'cat-general',
    slug: 'general',
    name: 'Gundem',
    description: 'Genel gundem haberleri',
    sortOrder: 1,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-technology',
    slug: 'technology',
    name: 'Teknoloji',
    description: 'Teknoloji odakli icerik',
    sortOrder: 2,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-business',
    slug: 'business',
    name: 'Ekonomi',
    description: 'Piyasa ve ekonomi gundemi',
    sortOrder: 3,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-sports',
    slug: 'sports',
    name: 'Spor',
    description: 'Spor haberleri',
    sortOrder: 4,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const mockSources: Source[] = [
  {
    id: 'src-tech-news',
    slug: 'tech-news',
    name: 'TechNews',
    description: 'Teknoloji odakli yayin',
    websiteUrl: 'https://example.com/tech',
    logoUrl: null,
    categoryId: 'cat-technology',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'src-ekonomi',
    slug: 'ekonomi-gundemi',
    name: 'Ekonomi Gundemi',
    description: 'Ekonomi ve finans haberleri',
    websiteUrl: 'https://example.com/business',
    logoUrl: null,
    categoryId: 'cat-business',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'src-spor',
    slug: 'sporarena',
    name: 'SporArena',
    description: 'Spor odakli yayin',
    websiteUrl: 'https://example.com/sports',
    logoUrl: null,
    categoryId: 'cat-sports',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'src-gundem',
    slug: 'gundemio',
    name: 'Gundemio',
    description: 'Genel haber akisi',
    websiteUrl: 'https://example.com/general',
    logoUrl: null,
    categoryId: 'cat-general',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const mockArticlesBase: Omit<Article, 'isFavorite'>[] = [
  {
    id: 'art-1',
    title: 'Yapay zeka yatirimlari hizlandi',
    summary: 'Kuresel girisimler yeni fon turlarinda rekor kirdi.',
    content: null,
    imageUrl: null,
    link: 'https://example.com/articles/1',
    publishedAt: hourAgo(1),
    sourceId: 'src-tech-news',
    sourceName: 'TechNews',
    categoryId: 'cat-technology',
    categoryName: 'Teknoloji',
    createdAt: hourAgo(1),
  },
  {
    id: 'art-2',
    title: 'Borsa Istanbul gunu yukselisle tamamladi',
    summary: 'Bankacilik endeksi onculugunde pozitif kapanis geldi.',
    content: null,
    imageUrl: null,
    link: 'https://example.com/articles/2',
    publishedAt: hourAgo(2),
    sourceId: 'src-ekonomi',
    sourceName: 'Ekonomi Gundemi',
    categoryId: 'cat-business',
    categoryName: 'Ekonomi',
    createdAt: hourAgo(2),
  },
  {
    id: 'art-3',
    title: 'Derbi oncesi son antrenman tamamlandi',
    summary: 'Iki takim da maca tam kadro hazirlandi.',
    content: null,
    imageUrl: null,
    link: 'https://example.com/articles/3',
    publishedAt: hourAgo(4),
    sourceId: 'src-spor',
    sourceName: 'SporArena',
    categoryId: 'cat-sports',
    categoryName: 'Spor',
    createdAt: hourAgo(4),
  },
  {
    id: 'art-4',
    title: 'Merkez bankasindan yeni enflasyon mesaji',
    summary: 'Toplanti notlarinda sikilastirma vurgusu one cikti.',
    content: null,
    imageUrl: null,
    link: 'https://example.com/articles/4',
    publishedAt: hourAgo(6),
    sourceId: 'src-gundem',
    sourceName: 'Gundemio',
    categoryId: 'cat-general',
    categoryName: 'Gundem',
    createdAt: hourAgo(6),
  },
];

const mockFavoritesStore = new Map<string, Set<string>>();
const mockPreferencesStore = new Map<string, UserPreferences>();

function normalizeQuery(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function includesText(fields: (string | null | undefined)[], query: string) {
  if (!query) {
    return true;
  }

  return fields.some((field) => field?.toLowerCase().includes(query));
}

function getFavoriteSet(userId: string) {
  const existing = mockFavoritesStore.get(userId);
  if (existing) {
    return existing;
  }

  const next = new Set<string>();
  mockFavoritesStore.set(userId, next);
  return next;
}

export function getMockCategories(): Category[] {
  return [...mockCategories]
    .filter((category) => category.isActive)
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));
}

export function getMockCategoriesByIds(ids: string[]): Record<string, Category> {
  if (ids.length === 0) {
    return {};
  }

  const idSet = new Set(ids);
  return getMockCategories().reduce<Record<string, Category>>((acc, category) => {
    if (idSet.has(category.id)) {
      acc[category.id] = category;
    }
    return acc;
  }, {});
}

export function getMockSources(params: ListSourcesParams = {}): PaginatedResult<Source> {
  const { page, limit } = resolvePagination(params.page, params.limit);
  const categorySet = params.categoryIds && params.categoryIds.length > 0 ? new Set(params.categoryIds) : null;
  const query = normalizeQuery(params.search);

  const filtered = mockSources
    .filter((source) => source.isActive)
    .filter((source) => (categorySet ? (source.categoryId ? categorySet.has(source.categoryId) : false) : true))
    .filter((source) => includesText([source.name, source.description, source.slug], query));

  const from = (page - 1) * limit;
  const items = filtered.slice(from, from + limit);

  return createPaginatedResult({
    items,
    page,
    limit,
    total: filtered.length,
  });
}

export function getMockSourcesByIds(ids: string[]): Record<string, Source> {
  if (ids.length === 0) {
    return {};
  }

  const idSet = new Set(ids);
  return mockSources.reduce<Record<string, Source>>((acc, source) => {
    if (idSet.has(source.id)) {
      acc[source.id] = source;
    }
    return acc;
  }, {});
}

export function getMockSourceByIdentifier(identifier: string): Source | null {
  return mockSources.find((source) => source.id === identifier || source.slug === identifier) ?? null;
}

export function getMockFavoriteArticleIds(userId: string, articleIds?: string[]): string[] {
  const favoriteSet = getFavoriteSet(userId);
  if (!articleIds || articleIds.length === 0) {
    return [...favoriteSet];
  }

  return articleIds.filter((articleId) => favoriteSet.has(articleId));
}

export function getMockArticles(params: ListArticlesParams = {}): PaginatedResult<Article> {
  const { page, limit } = resolvePagination(params.page, params.limit);
  const categorySet =
    params.filters?.categoryIds && params.filters.categoryIds.length > 0 ? new Set(params.filters.categoryIds) : null;
  const sourceSet = params.filters?.sourceIds && params.filters.sourceIds.length > 0 ? new Set(params.filters.sourceIds) : null;
  const query = normalizeQuery(params.filters?.search);
  const favoriteIds = params.userId ? new Set(getMockFavoriteArticleIds(params.userId)) : new Set<string>();

  const filteredBase = mockArticlesBase
    .filter((article) => (categorySet ? (article.categoryId ? categorySet.has(article.categoryId) : false) : true))
    .filter((article) => (sourceSet ? sourceSet.has(article.sourceId) : true))
    .filter((article) => includesText([article.title, article.summary, article.sourceName, article.categoryName], query))
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());

  const from = (page - 1) * limit;
  const items = filteredBase.slice(from, from + limit).map((article) => ({
    ...article,
    isFavorite: favoriteIds.has(article.id),
  }));

  return createPaginatedResult({
    items,
    page,
    limit,
    total: filteredBase.length,
  });
}

export function getMockArticleById(params: { articleId: string; userId?: string }): Article | null {
  const result = getMockArticles({
    page: 1,
    limit: 200,
    userId: params.userId,
  });
  return result.items.find((article) => article.id === params.articleId) ?? null;
}

export function toggleMockFavorite(input: ToggleFavoriteInput): Favorite {
  const favorites = getFavoriteSet(input.userId);

  if (input.isFavorite) {
    favorites.add(input.articleId);
  } else {
    favorites.delete(input.articleId);
  }

  return {
    id: `${input.userId}-${input.articleId}`,
    userId: input.userId,
    articleId: input.articleId,
    createdAt: new Date().toISOString(),
  };
}

export function getMockUserPreferences(userId: string): UserPreferences {
  const current = mockPreferencesStore.get(userId);
  if (current) {
    return current;
  }

  return {
    userId,
    categoryIds: [],
    sourceIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function upsertMockUserPreferences(input: UpsertPreferencesInput): UserPreferences {
  const next: UserPreferences = {
    userId: input.userId,
    categoryIds: [...input.categoryIds],
    sourceIds: [...input.sourceIds],
    updatedAt: new Date().toISOString(),
  };

  mockPreferencesStore.set(input.userId, next);
  return next;
}
