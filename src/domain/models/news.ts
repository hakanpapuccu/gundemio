export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean;
  createdAt: string;
};

export type Source = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  categoryId: string | null;
  isActive: boolean;
  createdAt: string;
};

export type Article = {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  imageUrl: string | null;
  link: string;
  publishedAt: string;
  sourceId: string;
  sourceName: string;
  categoryId: string | null;
  categoryName: string | null;
  isFavorite: boolean;
  createdAt: string;
};

export type Favorite = {
  id: string;
  userId: string;
  articleId: string;
  createdAt: string;
};

export type UserPreferences = {
  userId: string;
  categoryIds: string[];
  sourceIds: string[];
  updatedAt: string;
};

export type ArticleFilters = {
  articleIds?: string[];
  categoryIds?: string[];
  sourceIds?: string[];
  search?: string;
  sortBy?: 'latest' | 'popular';
};

export type PaginationParams = {
  page?: number;
  limit?: number;
};

export type PaginatedResult<TItem> = {
  items: TItem[];
  page: number;
  limit: number;
  total: number | null;
  hasMore: boolean;
  nextPage: number | null;
};
