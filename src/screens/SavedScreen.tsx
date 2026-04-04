import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, ArticleCardSkeleton, Chip, EmptyState, ScreenContainer, SectionHeader, TopAppBar } from '../components/ui';
import { useArticlesQuery, useToggleFavoriteMutation } from '../hooks/queries';
import { DEMO_USER_ID } from '../constants/session';
import { formatTimeAgoTr } from '../utils/date';

export function SavedScreen({ navigation }: MainTabScreenProps<'Saved'>) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const articlesQuery = useArticlesQuery({
    page: 1,
    limit: 20,
    userId: DEMO_USER_ID,
  });
  const toggleFavoriteMutation = useToggleFavoriteMutation();

  const savedArticles = (articlesQuery.data?.items ?? []).filter((article) => article.isFavorite);
  const displayedArticles = activeFilter === 'favorites' ? savedArticles : savedArticles;
  const hasSavedArticles = displayedArticles.length > 0;

  const handleToggleFavorite = (articleId: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({
      userId: DEMO_USER_ID,
      articleId,
      isFavorite: !isFavorite,
    });
  };

  return (
    <ScreenContainer scrollable>
      <TopAppBar title="Kaydedilenler" />

      <View style={styles.filters}>
        <Chip label="Tümü" onPress={() => setActiveFilter('all')} selected={activeFilter === 'all'} />
        <Chip
          label="Favoriler"
          onPress={() => setActiveFilter('favorites')}
          selected={activeFilter === 'favorites'}
        />
      </View>

      {articlesQuery.isLoading ? (
        <View style={styles.list}>
          <SectionHeader title="Kaydedilen Haberler" />
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </View>
      ) : hasSavedArticles ? (
        <View style={styles.list}>
          <SectionHeader title={activeFilter === 'all' ? 'Kaydedilen Haberler' : 'Favori Haberler'} />
          {displayedArticles.map((article) => (
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
  filters: {
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
  },
  list: {
    gap: appTheme.spacing.md,
  },
});
