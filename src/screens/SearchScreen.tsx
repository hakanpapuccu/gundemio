import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, ArticleCardSkeleton, Chip, EmptyState, Icon, ScreenContainer, SearchBar, SectionHeader, TopAppBar } from '../components/ui';
import { useArticlesQuery, useCategoriesQuery } from '../hooks/queries';
import { formatTimeAgoTr } from '../utils/date';
import { useDiscoveryStore } from '../store/useDiscoveryStore';
import type { IconName } from '../components/ui';
import { useBookmarks } from '../hooks/useBookmarks';
import { useSession } from '../hooks/useSession';

const trendingTopics = ['#Dolar', '#Bitcoin', '#TransferHaberleri', '#EYT', '#HavaDurumu', '#ŞampiyonlarLigi'];
const ALL_RESULT_CATEGORY_ID = 'all';

type CategoryVisual = { icon: IconName; backgroundColor: string; iconColor: string };

const categoryVisualFallbacks: CategoryVisual[] = [
  { icon: 'newspaper', backgroundColor: '#FFF1E8', iconColor: appTheme.colors.primary },
  { icon: 'trending-up', backgroundColor: '#E8F2FF', iconColor: '#1D4ED8' },
  { icon: 'sports-soccer', backgroundColor: '#E8F9EC', iconColor: '#15803D' },
  { icon: 'biotech', backgroundColor: '#F2E8FF', iconColor: '#7C3AED' },
  { icon: 'movie', backgroundColor: '#FDEBEC', iconColor: '#B91C1C' },
  { icon: 'health-and-safety', backgroundColor: '#E7FCF8', iconColor: '#0F766E' },
  { icon: 'restaurant-menu', backgroundColor: '#FFF7E6', iconColor: '#A16207' },
  { icon: 'more-horiz', backgroundColor: '#F3F4F6', iconColor: '#4B5563' },
];

const categoryVisualBySlug: Record<string, CategoryVisual> = {
  general: categoryVisualFallbacks[0]!,
  gundem: categoryVisualFallbacks[0]!,
  business: categoryVisualFallbacks[1]!,
  ekonomi: categoryVisualFallbacks[1]!,
  finance: categoryVisualFallbacks[1]!,
  sports: categoryVisualFallbacks[2]!,
  spor: categoryVisualFallbacks[2]!,
  technology: categoryVisualFallbacks[3]!,
  teknoloji: categoryVisualFallbacks[3]!,
  culture: categoryVisualFallbacks[4]!,
  kultur: categoryVisualFallbacks[4]!,
  entertainment: categoryVisualFallbacks[4]!,
  health: categoryVisualFallbacks[5]!,
  saglik: categoryVisualFallbacks[5]!,
  lifestyle: categoryVisualFallbacks[6]!,
  yasam: categoryVisualFallbacks[6]!,
};

export function SearchScreen({ navigation }: MainTabScreenProps<'Search'>) {
  const [query, setQuery] = useState('');
  const [selectedResultCategoryId, setSelectedResultCategoryId] = useState<string>(ALL_RESULT_CATEGORY_ID);
  const normalizedQuery = query.trim();
  const { activeUserId } = useSession();
  const categoriesQuery = useCategoriesQuery();
  const { isBookmarked, toggleBookmark } = useBookmarks(activeUserId);
  const recentSearches = useDiscoveryStore((state) => state.recentSearches);
  const addRecentSearch = useDiscoveryStore((state) => state.addRecentSearch);
  const removeRecentSearch = useDiscoveryStore((state) => state.removeRecentSearch);
  const clearRecentSearches = useDiscoveryStore((state) => state.clearRecentSearches);

  useEffect(() => {
    setSelectedResultCategoryId(ALL_RESULT_CATEGORY_ID);
  }, [normalizedQuery]);

  const categoryFilterIds =
    selectedResultCategoryId === ALL_RESULT_CATEGORY_ID ? undefined : [selectedResultCategoryId];
  const searchQuery = useArticlesQuery(
    {
      page: 1,
      limit: 10,
      userId: activeUserId,
      filters: {
        search: normalizedQuery,
        categoryIds: categoryFilterIds,
      },
    },
    {
      enabled: normalizedQuery.length > 0,
    }
  );

  const categoryItems = useMemo(
    () => [{ id: ALL_RESULT_CATEGORY_ID, name: 'Tümü' }, ...(categoriesQuery.data ?? [])],
    [categoriesQuery.data]
  );
  const isSearchError = normalizedQuery.length > 0 && searchQuery.isError;

  const handleRetrySearch = useCallback(async () => {
    await Promise.all([categoriesQuery.refetch(), searchQuery.refetch()]);
  }, [categoriesQuery, searchQuery]);

  const runSearch = (value: string) => {
    const normalized = value.trim();
    if (normalized.length === 0) {
      return;
    }

    addRecentSearch(normalized);
    setQuery(normalized);
  };

  return (
    <ScreenContainer scrollable>
      <TopAppBar title="Keşfet" />
      <SearchBar
        inputProps={{
          onSubmitEditing: () => runSearch(normalizedQuery),
          returnKeyType: 'search',
        }}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
        value={query}
      />

      {normalizedQuery.length === 0 ? (
        <>
          {recentSearches.length > 0 ? (
            <View style={styles.section}>
              <SectionHeader
                actionLabel="Temizle"
                onPressAction={clearRecentSearches}
                title="Son Aramalar"
              />
              <View style={styles.recentSearchesContainer}>
                {recentSearches.map((item) => (
                  <View key={item} style={styles.recentSearchRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => runSearch(item)}
                      style={styles.recentSearchMain}
                    >
                      <Icon color={appTheme.colors.textMuted} name="history" size={appTheme.sizes.iconMd} />
                      <Text numberOfLines={1} style={styles.recentSearchText}>
                        {item}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      hitSlop={6}
                      onPress={() => removeRecentSearch(item)}
                      style={styles.recentSearchAction}
                    >
                      <Icon color={appTheme.colors.textMuted} name="close" size={appTheme.sizes.iconSm} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <SectionHeader title="Trend Başlıklar" />
            <View style={styles.tagsWrap}>
              {trendingTopics.map((topic) => (
                <Chip key={topic} label={topic} onPress={() => runSearch(topic)} />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            {categoriesQuery.isError ? (
              <EmptyState
                actionLabel="Tekrar Dene"
                description="Kategoriler yüklenirken bir sorun oluştu."
                icon="warning"
                onPressAction={() => {
                  void categoriesQuery.refetch();
                }}
                title="Kategoriler yüklenemedi"
              />
            ) : (
              <>
                <SectionHeader
                  actionLabel="Kategoriler"
                  onPressAction={() => navigation.navigate('Categories')}
                  title="Önerilen Kategoriler"
                />
                <View style={styles.categoryGrid}>
                  {(categoriesQuery.data ?? []).slice(0, 8).map((category, index) => {
                    const key = (category.slug || category.name).toLocaleLowerCase('tr');
                    const visual =
                      categoryVisualBySlug[key] ??
                      categoryVisualFallbacks[index % categoryVisualFallbacks.length] ??
                      categoryVisualFallbacks[0]!;

                    return (
                      <Pressable
                        key={category.id}
                        accessibilityRole="button"
                        onPress={() =>
                          navigation.navigate('Categories', {
                            categoryId: category.id,
                          })
                        }
                        style={styles.categoryQuickItem}
                      >
                        <View style={[styles.categoryQuickIconWrap, { backgroundColor: visual.backgroundColor }]}>
                          <Icon color={visual.iconColor} name={visual.icon} size={appTheme.sizes.iconXl} />
                        </View>
                        <Text numberOfLines={1} style={styles.categoryQuickLabel}>
                          {category.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </View>

          <EmptyState
            description="Henüz bir arama yapmadın. Haber, konu veya kaynak adı yazarak keşfetmeye başlayabilirsin."
            icon="search"
            title="Merak ettiğini keşfet"
          />
        </>
      ) : (
        <View style={styles.section}>
          <ScrollView
            contentContainerStyle={styles.resultFilterRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categoryItems.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                onPress={() => setSelectedResultCategoryId(category.id)}
                selected={category.id === selectedResultCategoryId}
              />
            ))}
          </ScrollView>

          {isSearchError ? (
            <EmptyState
              actionLabel="Tekrar Dene"
              description="Arama sonuçları alınırken bir sorun oluştu."
              icon="warning"
              onPressAction={() => {
                void handleRetrySearch();
              }}
              title="Arama tamamlanamadı"
            />
          ) : searchQuery.isLoading ? (
            <>
              <SectionHeader title={`"${normalizedQuery}" için sonuçlar`} />
              <ArticleCardSkeleton />
              <ArticleCardSkeleton />
            </>
          ) : (searchQuery.data?.items ?? []).length === 0 ? (
            <EmptyState
              description="Bu aramayla eşleşen haber bulunamadı. Farklı bir anahtar kelime deneyebilirsin."
              icon="search"
              title="Sonuç bulunamadı"
            />
          ) : (
            <>
              <SectionHeader title={`"${normalizedQuery}" için sonuçlar`} />
              {(searchQuery.data?.items ?? []).map((article) => (
                <ArticleCard
                  key={article.id}
                  bookmarked={isBookmarked(article.id, article.isFavorite)}
                  imageUrl={article.imageUrl}
                  onPress={() =>
                    navigation.navigate('ArticleDetail', {
                      articleId: article.id,
                      title: article.title,
                    })
                  }
                  onPressBookmark={() => toggleBookmark(article.id, !isBookmarked(article.id, article.isFavorite))}
                  publishedLabel={formatTimeAgoTr(article.publishedAt)}
                  source={article.sourceName}
                  summary={article.summary ?? undefined}
                  title={article.title}
                />
              ))}
            </>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: appTheme.spacing.md,
  },
  recentSearchesContainer: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recentSearchRow: {
    alignItems: 'center',
    borderBottomColor: appTheme.colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  recentSearchMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
    minHeight: 48,
    paddingHorizontal: appTheme.spacing.md,
  },
  recentSearchText: {
    color: appTheme.colors.textSecondary,
    flex: 1,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    fontWeight: appTheme.typography.fontWeight.medium,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  recentSearchAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: appTheme.spacing.md,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.md,
    justifyContent: 'space-between',
  },
  categoryQuickItem: {
    alignItems: 'center',
    gap: appTheme.spacing.sm,
    width: '22%',
  },
  categoryQuickIconWrap: {
    alignItems: 'center',
    borderRadius: appTheme.radii.full,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  categoryQuickLabel: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    fontWeight: appTheme.typography.fontWeight.medium,
    lineHeight: appTheme.typography.lineHeight.sm,
    textAlign: 'center',
  },
  resultFilterRow: {
    gap: appTheme.spacing.sm,
  },
});
