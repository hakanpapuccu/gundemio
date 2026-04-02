import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, Chip, EmptyState, ScreenContainer, SearchBar, SectionHeader, TopAppBar } from '../components/ui';

const trendingTopics = ['#Dolar', '#Bitcoin', '#TransferHaberleri', '#EYT', '#HavaDurumu', '#ŞampiyonlarLigi'];
const suggestedCategories = ['Gündem', 'Ekonomi', 'Spor', 'Teknoloji', 'Kültür', 'Sağlık'];

export function SearchScreen({ navigation }: MainTabScreenProps<'Search'>) {
  const [query, setQuery] = useState('');

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
          {suggestedCategories.map((category) => (
            <Chip key={category} label={category} onPress={() => navigation.navigate('Categories')} />
          ))}
        </ScrollView>
      </View>

      {query.length === 0 ? (
        <EmptyState
          description="Henüz bir arama yapmadın. Haber, konu veya kaynak adı yazarak keşfetmeye başlayabilirsin."
          icon="search"
          title="Merak ettiğini keşfet"
        />
      ) : (
        <View style={styles.section}>
          <SectionHeader title={`"${query}" için sonuçlar`} />
          <ArticleCard
            onPress={() =>
              navigation.navigate('ArticleDetail', {
                articleId: 'search-result-1',
                title: 'Arama Sonucu: Örnek Haber',
              })
            }
            publishedLabel="10 dk önce"
            source="Gündemio"
            summary="Arama altyapısı ve filtreler sonraki görevde gerçek veri akışıyla bağlanacak."
            title="Arama Sonucu: Örnek Haber"
          />
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
