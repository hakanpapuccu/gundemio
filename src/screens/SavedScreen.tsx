import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, Chip, EmptyState, ScreenContainer, SectionHeader, TopAppBar } from '../components/ui';

export function SavedScreen({ navigation }: MainTabScreenProps<'Saved'>) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites'>('all');
  const hasSavedArticles = true;

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

      {hasSavedArticles ? (
        <View style={styles.list}>
          <SectionHeader title={activeFilter === 'all' ? 'Kaydedilen Haberler' : 'Favori Haberler'} />
          <ArticleCard
            bookmarked
            onPress={() =>
              navigation.navigate('ArticleDetail', {
                articleId: 'saved-1',
                title: 'Yapay Zeka Destekli Yeni Nesil Akıllı Şehirler',
              })
            }
            publishedLabel="2 saat önce"
            source="Teknoloji Haber"
            summary="Geleceğin şehir yapısında veri analitiği ve otonom sistemlerin rolü her geçen gün artıyor."
            title="Yapay Zeka Destekli Yeni Nesil Akıllı Şehirler"
          />
          <ArticleCard
            bookmarked
            onPress={() =>
              navigation.navigate('ArticleDetail', {
                articleId: 'saved-2',
                title: 'Küresel Piyasalarda Faiz Kararları Sonrası Hareketlilik',
              })
            }
            publishedLabel="5 saat önce"
            source="Ekonomi Gündemi"
            summary="Merkez bankalarının kararları sonrası borsa ve döviz kurlarında yeni bir dönem başladı."
            title="Küresel Piyasalarda Faiz Kararları Sonrası Hareketlilik"
          />
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
