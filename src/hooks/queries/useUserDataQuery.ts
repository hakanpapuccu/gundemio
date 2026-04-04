import { useQuery } from '@tanstack/react-query';

import { getUserPreferences, listFavoriteArticleIds } from '../../services/news';
import { newsQueryKeys } from './newsQueryKeys';

export function useFavoriteArticleIdsQuery(params: {
  userId: string;
  articleIds?: string[];
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: newsQueryKeys.favorites(params.userId, params.articleIds),
    queryFn: () => listFavoriteArticleIds(params.userId, params.articleIds),
    enabled: params.enabled ?? Boolean(params.userId),
  });
}

export function useUserPreferencesQuery(params: { userId: string; enabled?: boolean }) {
  return useQuery({
    queryKey: newsQueryKeys.preferences(params.userId),
    queryFn: () => getUserPreferences(params.userId),
    enabled: params.enabled ?? Boolean(params.userId),
  });
}
