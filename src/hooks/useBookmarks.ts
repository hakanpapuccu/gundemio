import { useCallback, useEffect, useMemo } from 'react';

import { useFavoriteArticleIdsQuery, useToggleFavoriteMutation } from './queries';
import { useBookmarksStore } from '../store/useBookmarksStore';

const EMPTY_FAVORITE_IDS: string[] = [];

type UseBookmarksResult = {
  favoriteArticleIds: string[];
  hasHydrated: boolean;
  isLoading: boolean;
  isBookmarked: (articleId: string, fallback?: boolean) => boolean;
  toggleBookmark: (articleId: string, nextValue?: boolean) => void;
  removeBookmark: (articleId: string) => void;
};

export function useBookmarks(userId: string): UseBookmarksResult {
  const favoriteArticleIds = useBookmarksStore((state) => state.bookmarkIdsByUser[userId] ?? EMPTY_FAVORITE_IDS);
  const hasHydrated = useBookmarksStore((state) => state.hydratedUsers[userId] ?? false);
  const setBookmarks = useBookmarksStore((state) => state.setBookmarks);
  const setBookmarked = useBookmarksStore((state) => state.setBookmarked);

  const favoritesQuery = useFavoriteArticleIdsQuery({
    userId,
    enabled: Boolean(userId),
  });
  const toggleFavoriteMutation = useToggleFavoriteMutation();

  useEffect(() => {
    if (!favoritesQuery.data) {
      return;
    }

    const isSameLength = favoriteArticleIds.length === favoritesQuery.data.length;
    const isSameOrder =
      isSameLength &&
      favoriteArticleIds.every((value, index) => value === favoritesQuery.data[index]);

    if (isSameOrder && hasHydrated) {
      return;
    }

    setBookmarks(userId, favoritesQuery.data);
  }, [favoriteArticleIds, favoritesQuery.data, hasHydrated, setBookmarks, userId]);

  const favoriteIdSet = useMemo(() => new Set(favoriteArticleIds), [favoriteArticleIds]);

  const isBookmarked = useCallback(
    (articleId: string, fallback = false) => {
      if (!hasHydrated) {
        return fallback;
      }

      return favoriteIdSet.has(articleId);
    },
    [favoriteIdSet, hasHydrated]
  );

  const toggleBookmark = useCallback(
    (articleId: string, nextValue?: boolean) => {
      const previousValue = favoriteIdSet.has(articleId);
      const targetValue = typeof nextValue === 'boolean' ? nextValue : !previousValue;
      if (previousValue === targetValue) {
        return;
      }

      setBookmarked(userId, articleId, targetValue);

      toggleFavoriteMutation.mutate(
        {
          userId,
          articleId,
          isFavorite: targetValue,
        },
        {
          onError: () => {
            setBookmarked(userId, articleId, previousValue);
          },
        }
      );
    },
    [favoriteIdSet, setBookmarked, toggleFavoriteMutation, userId]
  );

  const removeBookmark = useCallback(
    (articleId: string) => {
      toggleBookmark(articleId, false);
    },
    [toggleBookmark]
  );

  return {
    favoriteArticleIds,
    hasHydrated,
    isLoading: favoritesQuery.isLoading && !hasHydrated,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
  };
}
