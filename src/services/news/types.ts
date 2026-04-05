import type { ArticleFilters, PaginationParams } from '../../domain/models/news';

export const DEFAULT_PAGE_SIZE = 20;

export type ListArticlesParams = PaginationParams & {
  filters?: ArticleFilters;
  userId?: string;
};

export type ListSourcesParams = PaginationParams & {
  categoryIds?: string[];
  sourceIds?: string[];
  search?: string;
  sortBy?: 'name_asc' | 'name_desc';
};

export type ToggleFavoriteInput = {
  userId: string;
  articleId: string;
  isFavorite: boolean;
};

export type UpsertPreferencesInput = {
  userId: string;
  categoryIds: string[];
  sourceIds: string[];
};
