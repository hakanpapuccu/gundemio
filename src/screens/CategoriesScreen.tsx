import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, Chip, ScreenContainer, SectionHeader, TopAppBar } from '../components/ui';

const categoryOptions = ['Tümü', 'Gündem', 'Teknoloji', 'Ekonomi', 'Spor', 'Dünya'] as const;

export function CategoriesScreen({ navigation }: MainTabScreenProps<'Categories'>) {
  const [selectedCategory, setSelectedCategory] = useState<(typeof categoryOptions)[number]>('Teknoloji');

  return (
    <ScreenContainer scrollable>
      <TopAppBar title="Kategoriler" />

      <ScrollView
        contentContainerStyle={styles.chipsContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {categoryOptions.map((category) => (
          <Chip
            key={category}
            label={category}
            onPress={() => setSelectedCategory(category)}
            selected={category === selectedCategory}
          />
        ))}
      </ScrollView>

      <View style={styles.section}>
        <SectionHeader
          actionLabel="Kaynaklar"
          onPressAction={() =>
            navigation.navigate('SourceDetail', {
              sourceId: selectedCategory.toLowerCase(),
              sourceName: `${selectedCategory} Kaynakları`,
            })
          }
          title={`${selectedCategory} Haberleri`}
        />
        <ArticleCard
          onPress={() =>
            navigation.navigate('ArticleDetail', {
              articleId: 'category-1',
              title: 'Yeni Nesil İşlemciler Tanıtıldı',
            })
          }
          publishedLabel="2 saat önce"
          source="Chip Online"
          summary="Performans odaklı yeni işlemci ailesi, mobil cihazlarda pil verimliliğini artırmayı hedefliyor."
          title="Yeni Nesil İşlemciler Tanıtıldı: Performans Sınırları Zorlanıyor"
        />
        <ArticleCard
          onPress={() =>
            navigation.navigate('ArticleDetail', {
              articleId: 'category-2',
              title: 'Yapay Zeka Alanında Devrimsel Gelişme',
            })
          }
          publishedLabel="5 saat önce"
          source="Teknoloji Haber"
          summary="Kendi kodunu optimize eden sistemlerin yazılım geliştirme süreçlerini nasıl değiştireceği tartışılıyor."
          title="Yapay Zeka Alanında Devrimsel Gelişme"
        />
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
