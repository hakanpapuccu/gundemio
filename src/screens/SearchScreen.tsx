import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, ArticleCardSkeleton, Chip, EmptyState, ScreenContainer, SearchBar, SectionHeader, TopAppBar } from '../components/ui';
import { useArticlesQuery, useCategoriesQuery, useToggleFavoriteMutation } from '../hooks/queries';
import { DEMO_USER_ID } from '../constants/session';
import { formatTimeAgoTr } from '../utils/date';

const trendingTopics = ['#Dolar', '#Bitcoin', '#TransferHaberleri', '#EYT', '#HavaDurumu', '#ŞampiyonlarLigi'];

export function SearchScreen({ navigation }: MainTabScreenProps<'Search'>) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim();
  const categoriesQuery = useCategoriesQuery();
  const toggleFavoriteMutation = useToggleFavoriteMutation();
  const searchQuery = useArticlesQuery(
    {
      page: 1,
      limit: 10,
      userId: DEMO_USER_ID,
      filters: {
        search: normalizedQuery,
      },
    },
    {
      enabled: normalizedQuery.length > 0,
    }
  );

  const handleToggleFavorite = (articleId: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({
      userId: DEMO_USER_ID,
      articleId,
      isFavorite: !isFavorite,
    });
  };

  return (
    <ScreenContainer scrollable>
      <TopAppBar title="Keşfet" />
      <SearchBar onChangeText={setQuery} onClear={() => setQuery('')} value={query} />

      <View style={styles.section}>
        <SectionHeader title="Trend Başlıklar" />
        <View style={styles.tagsWrap}>
          {trendingTopics.map((topic) => (
            <Chip key={topic} label={topic} onPress={() => setQuery(topic)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          actionLabel="Kategorilere Git"
          onPressAction={() => navigation.navigate('Categories')}
          title="Önerilen Kategoriler"
        />
        <ScrollView
          contentContainerStyle={styles.tagsWrap}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {(categoriesQuery.data ?? []).map((category) => (
            <Chip key={category.id} label={category.name} onPress={() => navigation.navigate('Categories')} />
          ))}
        </ScrollView>
      </View>

      {normalizedQuery.length === 0 ? (
        <EmptyState
          description="Henüz bir arama yapmadın. Haber, konu veya kaynak adı yazarak keşfetmeye başlayabilirsin."
          icon="search"
          title="Merak ettiğini keşfet"
        />
      ) : searchQuery.isLoading ? (
        <View style={styles.section}>
          <SectionHeader title={`"${normalizedQuery}" için sonuçlar`} />
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </View>
      ) : (searchQuery.data?.items ?? []).length === 0 ? (
        <EmptyState
          description="Bu aramayla eşleşen haber bulunamadı. Farklı bir anahtar kelime deneyebilirsin."
          icon="search"
          title="Sonuç bulunamadı"
        />
      ) : (
        <View style={styles.section}>
          <SectionHeader title={`"${normalizedQuery}" için sonuçlar`} />
          {(searchQuery.data?.items ?? []).map((article) => (
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
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: appTheme.spacing.md,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.sm,
  },
});
