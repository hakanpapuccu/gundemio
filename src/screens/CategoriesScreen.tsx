import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, ArticleCardSkeleton, Chip, EmptyState, ScreenContainer, TopAppBar } from '../components/ui';
import { useArticlesQuery, useCategoriesQuery, useSourcesQuery } from '../hooks/queries';
import { DEMO_USER_ID } from '../constants/session';
import { formatTimeAgoTr } from '../utils/date';
import { useBookmarks } from '../hooks/useBookmarks';

export function CategoriesScreen({ navigation, route }: MainTabScreenProps<'Categories'>) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<'latest' | 'popular'>('latest');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('all');
  const categoriesQuery = useCategoriesQuery();
  const { isBookmarked, toggleBookmark } = useBookmarks(DEMO_USER_ID);
  const categoryFilterIds = selectedCategoryId === 'all' ? undefined : [selectedCategoryId];

  const sourcesQuery = useSourcesQuery({
    page: 1,
    limit: 20,
    categoryIds: categoryFilterIds,
    sortBy: 'name_asc',
  });

  useEffect(() => {
    setSelectedSourceId('all');
  }, [selectedCategoryId]);

  useEffect(() => {
    if (route.params?.categoryId) {
      setSelectedCategoryId(route.params.categoryId);
    }
  }, [route.params?.categoryId]);

  const articlesQuery = useArticlesQuery({
    page: 1,
    limit: 10,
    userId: DEMO_USER_ID,
    filters: {
      categoryIds: categoryFilterIds,
      sourceIds: selectedSourceId === 'all' ? undefined : [selectedSourceId],
      sortBy: selectedSort,
    },
  });

  const categoryItems = useMemo(
    () => [{ id: 'all', name: 'Tümü' }, ...(categoriesQuery.data ?? []).map((category) => ({ id: category.id, name: category.name }))],
    [categoriesQuery.data]
  );

  const selectedCategory = categoryItems.find((category) => category.id === selectedCategoryId);
  const selectedSource = (sourcesQuery.data?.items ?? []).find((source) => source.id === selectedSourceId);

  return (
    <ScreenContainer scrollable>
      <TopAppBar
        rightActions={[
          {
            accessibilityLabel: 'Ara',
            icon: 'search',
            onPress: () => navigation.navigate('Search'),
          },
        ]}
        title={selectedCategory?.name ?? 'Kategoriler'}
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

      <ScrollView
        contentContainerStyle={styles.filtersRow}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <Chip
          icon="expand-more"
          label="En Yeni"
          onPress={() => setSelectedSort('latest')}
          selected={selectedSort === 'latest'}
        />
        <Chip
          icon="expand-more"
          label="En Popüler"
          onPress={() => setSelectedSort('popular')}
          selected={selectedSort === 'popular'}
        />
        <Chip
          icon="expand-more"
          label={selectedSource ? selectedSource.name : 'Kaynağa Göre'}
          onPress={() => {
            const sourceItems = sourcesQuery.data?.items ?? [];
            if (sourceItems.length === 0) {
              return;
            }

            if (selectedSourceId === 'all') {
              const firstSource = sourceItems[0];
              if (firstSource) {
                setSelectedSourceId(firstSource.id);
              }
              return;
            }

            const currentIndex = sourceItems.findIndex((source) => source.id === selectedSourceId);
            if (currentIndex === -1 || currentIndex === sourceItems.length - 1) {
              setSelectedSourceId('all');
              return;
            }

            const nextSource = sourceItems[currentIndex + 1];
            if (nextSource) {
              setSelectedSourceId(nextSource.id);
            }
          }}
          selected={selectedSourceId !== 'all'}
        />
      </ScrollView>

      <View style={styles.section}>
        {articlesQuery.isLoading ? (
          <>
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </>
        ) : (articlesQuery.data?.items ?? []).length === 0 ? (
          <EmptyState
            description="Bu kategori için henüz haber bulunmuyor."
            icon="folder-open"
            title="İçerik Bulunamadı"
          />
        ) : (
          (articlesQuery.data?.items ?? []).map((article) => (
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
              onPressBookmark={() =>
                toggleBookmark(article.id, !isBookmarked(article.id, article.isFavorite))
              }
              publishedLabel={formatTimeAgoTr(article.publishedAt)}
              source={article.sourceName}
              summary={article.summary ?? undefined}
              title={article.title}
            />
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipsContainer: {
    gap: appTheme.spacing.sm,
  },
  filtersRow: {
    gap: appTheme.spacing.sm,
  },
  section: {
    gap: appTheme.spacing.md,
  },
});
