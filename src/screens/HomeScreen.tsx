import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import type { Article } from '../domain/models/news';
import { ArticleCard, ArticleCardSkeleton, Chip, EmptyState, ScreenContainer, SkeletonBlock, TopAppBar } from '../components/ui';
import { useArticlesQuery, useCategoriesQuery } from '../hooks/queries';
import { formatTimeAgoTr } from '../utils/date';
import { useBookmarks } from '../hooks/useBookmarks';
import { useSession } from '../hooks/useSession';

const ALL_CATEGORY_ID = 'all';
const HOME_ARTICLE_LIMIT = 20;

export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL_CATEGORY_ID);
  const { activeUserId } = useSession();

  const categoriesQuery = useCategoriesQuery();
  const { isBookmarked, toggleBookmark } = useBookmarks(activeUserId);

  const categoryFilterIds = selectedCategoryId === ALL_CATEGORY_ID ? undefined : [selectedCategoryId];

  const articlesQuery = useArticlesQuery({
    page: 1,
    limit: HOME_ARTICLE_LIMIT,
    userId: activeUserId,
    filters: {
      categoryIds: categoryFilterIds,
    },
  });

  const categoryItems = useMemo(
    () => [
      { id: ALL_CATEGORY_ID, name: 'Tümü' },
      ...(categoriesQuery.data ?? []).map((category) => ({ id: category.id, name: category.name })),
    ],
    [categoriesQuery.data]
  );

  const articles = articlesQuery.data?.items ?? [];
  const featuredArticle = articles[0];
  const feedArticles = featuredArticle ? articles.slice(1) : [];
  const isInitialLoading = categoriesQuery.isLoading || articlesQuery.isLoading;
  const isRefreshing = !isInitialLoading && (categoriesQuery.isRefetching || articlesQuery.isRefetching);
  const isError = categoriesQuery.isError || articlesQuery.isError;

  const handleRefresh = useCallback(async () => {
    await Promise.all([categoriesQuery.refetch(), articlesQuery.refetch()]);
  }, [articlesQuery, categoriesQuery]);

  const renderArticleItem = useCallback(
    ({ item }: ListRenderItemInfo<Article>) => {
      const bookmarked = isBookmarked(item.id, item.isFavorite);

      return (
        <ArticleCard
          bookmarked={bookmarked}
          imageUrl={item.imageUrl}
          onPress={() =>
            navigation.navigate('ArticleDetail', {
              articleId: item.id,
              title: item.title,
            })
          }
          onPressBookmark={() => toggleBookmark(item.id, !bookmarked)}
          publishedLabel={formatTimeAgoTr(item.publishedAt)}
          source={item.sourceName}
          style={styles.feedCard}
          summary={item.summary ?? undefined}
          title={item.title}
          variant="compact"
        />
      );
    },
    [isBookmarked, navigation, toggleBookmark]
  );

  const renderCategoryChips = () => {
    if (categoriesQuery.isLoading) {
      return (
        <View style={styles.chipSkeletonRow}>
          <SkeletonBlock borderRadius={appTheme.radii.full} height={appTheme.sizes.chipHeight} width={72} />
          <SkeletonBlock borderRadius={appTheme.radii.full} height={appTheme.sizes.chipHeight} width={96} />
          <SkeletonBlock borderRadius={appTheme.radii.full} height={appTheme.sizes.chipHeight} width={88} />
          <SkeletonBlock borderRadius={appTheme.radii.full} height={appTheme.sizes.chipHeight} width={80} />
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.chipsContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {categoryItems.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            onPress={() => setSelectedCategoryId(category.id)}
            selected={category.id === selectedCategoryId}
          />
        ))}
      </ScrollView>
    );
  };

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      {renderCategoryChips()}
      <View style={styles.featuredContainer}>
        {isInitialLoading ? (
          <>
            <View style={styles.featuredSkeletonCard}>
              <SkeletonBlock borderRadius={0} height={180} style={styles.featuredSkeletonMedia} />
              <View style={styles.featuredSkeletonContent}>
                <SkeletonBlock borderRadius={appTheme.radii.sm} height={20} width={80} />
                <SkeletonBlock height={26} width="90%" />
                <SkeletonBlock height={26} width="75%" />
                <SkeletonBlock height={16} width="45%" />
              </View>
            </View>
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </>
        ) : featuredArticle ? (
          <ArticleCard
            bookmarked={isBookmarked(featuredArticle.id, featuredArticle.isFavorite)}
            category={featuredArticle.categoryName ?? undefined}
            imageUrl={featuredArticle.imageUrl}
            onPress={() =>
              navigation.navigate('ArticleDetail', {
                articleId: featuredArticle.id,
                title: featuredArticle.title,
              })
            }
            onPressBookmark={() =>
              toggleBookmark(
                featuredArticle.id,
                !isBookmarked(featuredArticle.id, featuredArticle.isFavorite)
              )
            }
            publishedLabel={formatTimeAgoTr(featuredArticle.publishedAt)}
            source={featuredArticle.sourceName}
            style={styles.featuredCard}
            summary={featuredArticle.summary ?? undefined}
            title={featuredArticle.title}
            variant="featured"
          />
        ) : null}
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (isInitialLoading || featuredArticle) {
      return null;
    }

    return (
      <EmptyState
        description="Seçtiğin kategori için şu an içerik bulunmuyor. Farklı bir kategori deneyebilirsin."
        icon="newspaper"
        title="Henüz haber yok"
      />
    );
  };

  return (
    <ScreenContainer style={styles.container} withHorizontalPadding={false}>
      <TopAppBar
        rightActions={[
          {
            accessibilityLabel: 'Ara',
            icon: 'search',
            onPress: () => navigation.navigate('Search'),
          },
          {
            accessibilityLabel: 'Profil',
            icon: 'person',
            onPress: () => navigation.navigate('Profile'),
          },
        ]}
        title="Gündemio"
      />

      {isError ? (
        <View style={styles.errorWrap}>
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Haber akışı alınırken bir sorun oluştu. Yenileyip tekrar deneyebilirsin."
            icon="warning"
            onPressAction={() => {
              void handleRefresh();
            }}
            title="Akışa ulaşılamadı"
          />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={feedArticles}
          initialNumToRender={5}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={renderListHeader}
          maxToRenderPerBatch={6}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              colors={[appTheme.colors.primary]}
              onRefresh={() => {
                void handleRefresh();
              }}
              refreshing={isRefreshing}
              tintColor={appTheme.colors.primary}
            />
          }
          renderItem={renderArticleItem}
          showsVerticalScrollIndicator={false}
          windowSize={7}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.background,
  },
  chipSkeletonRow: {
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
    paddingHorizontal: appTheme.spacing.lg,
  },
  chipsContainer: {
    gap: appTheme.spacing.sm,
    paddingHorizontal: appTheme.spacing.lg,
  },
  listHeader: {
    gap: appTheme.spacing.md,
    paddingTop: appTheme.spacing.sm,
  },
  featuredContainer: {
    gap: appTheme.spacing.md,
    paddingHorizontal: appTheme.spacing.lg,
  },
  featuredCard: {
    borderColor: appTheme.colors.borderSoft,
  },
  featuredSkeletonCard: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  featuredSkeletonMedia: {
    width: '100%',
  },
  featuredSkeletonContent: {
    gap: appTheme.spacing.sm,
    padding: appTheme.spacing.lg,
  },
  listContent: {
    backgroundColor: appTheme.colors.surface,
    gap: appTheme.spacing.xs,
    paddingBottom: appTheme.spacing.xxxl,
  },
  feedCard: {
    borderBottomColor: appTheme.colors.borderSoft,
    borderBottomWidth: 1,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: appTheme.colors.surface,
    elevation: 0,
    marginHorizontal: appTheme.spacing.lg,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  errorWrap: {
    backgroundColor: appTheme.colors.surface,
    flex: 1,
  },
});
