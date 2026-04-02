import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, Chip, ScreenContainer, SectionHeader, SourceCard, TopAppBar } from '../components/ui';

const categories = ['Tümü', 'Gündem', 'Teknoloji', 'Ekonomi', 'Spor', 'Dünya'] as const;

export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('Tümü');

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
        {categories.map((category) => (
          <Chip
            key={category}
            label={category}
            onPress={() => setSelectedCategory(category)}
            selected={category === selectedCategory}
          />
        ))}
      </ScrollView>

      <View style={styles.sectionContainer}>
        <ArticleCard
          category="Teknoloji"
          onPress={() =>
            navigation.navigate('ArticleDetail', {
              articleId: 'home-featured-1',
              title: 'Yapay Zekada Yeni Dönem',
            })
          }
          publishedLabel="2 saat önce"
          source="TechNews"
          title="Yapay Zekada Yeni Dönem"
          variant="featured"
        />
        <ArticleCard
          onPress={() =>
            navigation.navigate('ArticleDetail', {
              articleId: 'home-article-2',
              title: 'Borsa İstanbul Haftaya Yükselişle Başladı',
            })
          }
          publishedLabel="1 saat önce"
          source="Ekonomi Gündemi"
          summary="Hisse senetleri değer kazandı, yatırımcılar yeni ekonomik verileri bekliyor."
          title="Borsa İstanbul Haftaya Yükselişle Başladı"
        />
        <ArticleCard
          onPress={() =>
            navigation.navigate('ArticleDetail', {
              articleId: 'home-article-3',
              title: 'Derbi Hazırlıkları Tamamlandı',
            })
          }
          publishedLabel="30 dk önce"
          source="SporArena"
          summary="Hafta sonu oynanacak maç öncesi takımlar son antrenmanlarını tamamladı."
          title="Derbi Hazırlıkları Tamamlandı"
        />
      </View>

      <View style={styles.sectionContainer}>
        <SectionHeader
          actionLabel="Tüm Kaynaklar"
          onPressAction={() => navigation.navigate('Categories')}
          title="Takip Edilen Kaynaklar"
        />
        <View style={styles.sourceList}>
          <SourceCard
            description="Gündem • 1.2M Takipçi"
            name="CNN Türk"
            onPress={() =>
              navigation.navigate('SourceDetail', {
                sourceId: 'cnn-turk',
                sourceName: 'CNN Türk',
              })
            }
          />
          <SourceCard
            description="Teknoloji • 450K Takipçi"
            isFollowing
            name="Webrazzi"
            onPress={() =>
              navigation.navigate('SourceDetail', {
                sourceId: 'webrazzi',
                sourceName: 'Webrazzi',
              })
            }
          />
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
