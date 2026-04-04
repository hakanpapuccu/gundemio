import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, ArticleCardSkeleton, Chip, EmptyState, ScreenContainer, SectionHeader, TopAppBar } from '../components/ui';
import { useArticlesQuery, useCategoriesQuery, useToggleFavoriteMutation } from '../hooks/queries';
import { DEMO_USER_ID } from '../constants/session';
import { formatTimeAgoTr } from '../utils/date';

export function CategoriesScreen({ navigation }: MainTabScreenProps<'Categories'>) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const categoriesQuery = useCategoriesQuery();
  const toggleFavoriteMutation = useToggleFavoriteMutation();
  const categoryFilterIds = selectedCategoryId === 'all' ? undefined : [selectedCategoryId];

  const articlesQuery = useArticlesQuery({
    page: 1,
    limit: 10,
    userId: DEMO_USER_ID,
    filters: {
      categoryIds: categoryFilterIds,
    },
  });

  const categoryItems = useMemo(
    () => [{ id: 'all', name: 'Tümü' }, ...(categoriesQuery.data ?? []).map((category) => ({ id: category.id, name: category.name }))],
    [categoriesQuery.data]
  );

  const selectedCategory = categoryItems.find((category) => category.id === selectedCategoryId);

  const handleToggleFavorite = (articleId: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({
      userId: DEMO_USER_ID,
      articleId,
      isFavorite: !isFavorite,
    });
  };

  return (
    <ScreenContainer scrollable>
      <TopAppBar title="Kategoriler" />

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

      <View style={styles.section}>
        <SectionHeader
          actionLabel="Kaynaklar"
          onPressAction={() =>
            navigation.navigate('SourceDetail', {
              sourceId: selectedCategory?.id ?? 'all',
              sourceName: `${selectedCategory?.name ?? 'Tümü'} Kaynakları`,
            })
          }
          title={`${selectedCategory?.name ?? 'Tümü'} Haberleri`}
        />
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
              bookmarked={article.isFavorite}
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
  section: {
    gap: appTheme.spacing.md,
  },
});
