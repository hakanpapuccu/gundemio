import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, ArticleCardSkeleton, EmptyState, Icon, ScreenContainer, TopAppBar } from '../components/ui';
import { useArticlesQuery } from '../hooks/queries';
import { formatTimeAgoTr } from '../utils/date';
import { useBookmarks } from '../hooks/useBookmarks';
import { useSession } from '../hooks/useSession';

type SavedFilter = 'all' | 'favorites';

const SAVED_FILTERS: { key: SavedFilter; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'favorites', label: 'Favoriler' },
];

export function SavedScreen({ navigation }: MainTabScreenProps<'Saved'>) {
  const [activeFilter, setActiveFilter] = useState<SavedFilter>('all');
  const { activeUserId } = useSession();
  const { favoriteArticleIds, hasHydrated, isLoading: isBookmarksLoading, isBookmarked, removeBookmark } = useBookmarks(activeUserId);

  const normalizedFavoriteArticleIds = useMemo(
    () => [...new Set(favoriteArticleIds.filter(Boolean))],
    [favoriteArticleIds]
  );

  const articlesQuery = useArticlesQuery(
    {
      page: 1,
      limit: 50,
      userId: activeUserId,
      filters: {
        articleIds: normalizedFavoriteArticleIds,
      },
    },
    {
      enabled: normalizedFavoriteArticleIds.length > 0,
    }
  );

  const savedArticles = useMemo(
    () =>
      (articlesQuery.data?.items ?? []).map((article) => ({
        ...article,
        isFavorite: isBookmarked(article.id, article.isFavorite),
      })),
    [articlesQuery.data?.items, isBookmarked]
  );

  const displayedArticles = activeFilter === 'all' ? savedArticles : savedArticles;
  const hasSavedArticles = displayedArticles.length > 0;
  const isLoading =
    isBookmarksLoading ||
    (!hasHydrated && normalizedFavoriteArticleIds.length === 0) ||
    (normalizedFavoriteArticleIds.length > 0 && articlesQuery.isLoading);

  return (
    <ScreenContainer scrollable style={styles.container}>
      <TopAppBar title="Kaydedilenler" />

      <View style={styles.segmentContainer}>
        {SAVED_FILTERS.map((filter) => {
          const selected = activeFilter === filter.key;

          return (
            <Pressable
              key={filter.key}
              accessibilityRole="button"
              onPress={() => setActiveFilter(filter.key)}
              style={({ pressed }) => [
                styles.segmentButton,
                selected && styles.segmentButtonSelected,
                pressed && styles.segmentButtonPressed,
              ]}
            >
              <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.list}>
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </View>
      ) : hasSavedArticles ? (
        <View style={styles.list}>
          {displayedArticles.map((article) => (
            <View key={article.id} style={styles.savedItem}>
              <ArticleCard
                bookmarked={article.isFavorite}
                imageUrl={article.imageUrl}
                onPress={() =>
                  navigation.navigate('ArticleDetail', {
                    articleId: article.id,
                    title: article.title,
                  })
                }
                onPressBookmark={() => removeBookmark(article.id)}
                publishedLabel={formatTimeAgoTr(article.publishedAt)}
                source={article.sourceName}
                summary={article.summary ?? undefined}
                title={article.title}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => removeBookmark(article.id)}
                style={({ pressed }) => [styles.removeAction, pressed && styles.removeActionPressed]}
              >
                <Icon color={appTheme.colors.danger} name="bookmark" size={appTheme.sizes.iconSm} />
                <Text style={styles.removeActionLabel}>Kaydı Sil</Text>
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          actionLabel="Haberleri Keşfet"
          description="Daha sonra okumak istediğin haberleri buraya kaydedebilirsin."
          onPressAction={() => navigation.navigate('Home')}
          title="Henüz kaydedilmiş haber yok"
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.background,
  },
  segmentContainer: {
    backgroundColor: appTheme.colors.chipBackground,
    borderRadius: appTheme.radii.lg,
    flexDirection: 'row',
    padding: appTheme.spacing.xs,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: appTheme.radii.md,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: appTheme.spacing.sm,
  },
  segmentButtonSelected: {
    backgroundColor: appTheme.colors.surface,
    ...appTheme.shadows.card,
  },
  segmentButtonPressed: {
    opacity: 0.8,
  },
  segmentLabel: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    fontWeight: appTheme.typography.fontWeight.semiBold,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  segmentLabelSelected: {
    color: appTheme.colors.primary,
  },
  list: {
    gap: appTheme.spacing.md,
  },
  savedItem: {
    gap: appTheme.spacing.sm,
  },
  removeAction: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: appTheme.spacing.xs,
    paddingHorizontal: appTheme.spacing.sm,
    paddingVertical: appTheme.spacing.xs,
  },
  removeActionPressed: {
    opacity: 0.72,
  },
  removeActionLabel: {
    color: appTheme.colors.danger,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    fontWeight: appTheme.typography.fontWeight.semiBold,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
});
