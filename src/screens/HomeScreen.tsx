import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, ArticleCardSkeleton, Chip, ScreenContainer, SectionHeader, SourceCard, SourceCardSkeleton, TopAppBar } from '../components/ui';
import {
  useArticlesQuery,
  useCategoriesQuery,
  useSourcesQuery,
  useToggleFavoriteMutation,
  useUpsertPreferencesMutation,
  useUserPreferencesQuery,
} from '../hooks/queries';
import { DEMO_USER_ID } from '../constants/session';
import { formatTimeAgoTr } from '../utils/date';

export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const categoriesQuery = useCategoriesQuery();
  const userPreferencesQuery = useUserPreferencesQuery({ userId: DEMO_USER_ID });
  const toggleFavoriteMutation = useToggleFavoriteMutation();
  const upsertPreferencesMutation = useUpsertPreferencesMutation();

  const categoryFilterIds = selectedCategoryId === 'all' ? undefined : [selectedCategoryId];
  const articlesQuery = useArticlesQuery({
    page: 1,
    limit: 3,
    userId: DEMO_USER_ID,
    filters: {
      categoryIds: categoryFilterIds,
    },
  });
  const sourcesQuery = useSourcesQuery({
    page: 1,
    limit: 2,
    categoryIds: categoryFilterIds,
  });

  const categoryItems = useMemo(
    () => [{ id: 'all', name: 'Tümü' }, ...(categoriesQuery.data ?? []).map((category) => ({ id: category.id, name: category.name }))],
    [categoriesQuery.data]
  );

  const followedSourceIds = new Set(userPreferencesQuery.data?.sourceIds ?? []);

  const handleToggleFavorite = (articleId: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({
      userId: DEMO_USER_ID,
      articleId,
      isFavorite: !isFavorite,
    });
  };

  const handleToggleSourceFollow = (sourceId: string) => {
    const current = userPreferencesQuery.data ?? {
      userId: DEMO_USER_ID,
      categoryIds: [],
      sourceIds: [],
      updatedAt: new Date().toISOString(),
    };

    const exists = current.sourceIds.includes(sourceId);
    const sourceIds = exists ? current.sourceIds.filter((id) => id !== sourceId) : [...current.sourceIds, sourceId];

    upsertPreferencesMutation.mutate({
      userId: current.userId,
      categoryIds: current.categoryIds,
      sourceIds,
    });
  };

  return (
    <ScreenContainer scrollable withHorizontalPadding={false}>
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

      <View style={styles.sectionContainer}>
        {articlesQuery.isLoading ? (
          <>
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </>
        ) : (
          (articlesQuery.data?.items ?? []).map((article, index) => (
            <ArticleCard
              key={article.id}
              bookmarked={article.isFavorite}
              category={article.categoryName ?? undefined}
              imageUrl={article.imageUrl}
              onPress={() =>
                navigation.navigate('ArticleDetail', {
                  articleId: article.id,
                  title: article.title,
                })
              }
              onPressBookmark={() => handleToggleFavorite(article.id, article.isFavorite)}
              publishedLabel={formatTimeAgoTr(article.publishedAt)}
              source={article.sourceName}
              summary={article.summary ?? undefined}
              title={article.title}
              variant={index === 0 ? 'featured' : 'compact'}
            />
          ))
        )}
      </View>

      <View style={styles.sectionContainer}>
        <SectionHeader
          actionLabel="Tüm Kaynaklar"
          onPressAction={() => navigation.navigate('Categories')}
          title="Takip Edilen Kaynaklar"
        />
        <View style={styles.sourceList}>
          {sourcesQuery.isLoading ? (
            <>
              <SourceCardSkeleton />
              <SourceCardSkeleton />
            </>
          ) : (
            (sourcesQuery.data?.items ?? []).map((source) => (
              <SourceCard
                key={source.id}
                description={source.description ?? 'Haber kaynağı'}
                imageUrl={source.logoUrl}
                isFollowing={followedSourceIds.has(source.id)}
                name={source.name}
                onPress={() =>
                  navigation.navigate('SourceDetail', {
                    sourceId: source.id,
                    sourceName: source.name,
                  })
                }
                onToggleFollow={() => handleToggleSourceFollow(source.id)}
              />
            ))
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipsContainer: {
    gap: appTheme.spacing.sm,
    paddingHorizontal: appTheme.spacing.lg,
  },
  sectionContainer: {
    gap: appTheme.spacing.md,
    paddingHorizontal: appTheme.spacing.lg,
  },
  sourceList: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
