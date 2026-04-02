import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../theme';
import {
  ArticleCard,
  ArticleCardSkeleton,
  Button,
  Chip,
  EmptyState,
  ScreenContainer,
  SearchBar,
  SectionHeader,
  SourceCard,
  SourceCardSkeleton,
  TextField,
  TopAppBar,
} from '../components/ui';

const categories = ['Tümü', 'Gündem', 'Teknoloji', 'Ekonomi', 'Spor', 'Dünya'];

export function DesignSystemShowcaseScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [email, setEmail] = useState('');

  return (
    <ScreenContainer scrollable withHorizontalPadding={false}>
      <TopAppBar
        rightActions={[
          { accessibilityLabel: 'Ara', icon: 'search' },
          { accessibilityLabel: 'Profil', icon: 'person' },
        ]}
        title="Gündemio"
      />

      <View style={styles.sectionContainer}>
        <SearchBar onChangeText={setQuery} onClear={() => setQuery('')} value={query} />
      </View>

      <View>
        <ScrollView
          contentContainerStyle={styles.chipContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onPress={() => setSelectedCategory(category)}
              selected={selectedCategory === category}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionContainer}>
        <SectionHeader actionLabel="Tümünü Gör" title="Buton Varyantları" />
        <View style={styles.rowWrap}>
          <Button label="Birincil" leftIcon="bolt" size="sm" />
          <Button label="İkincil" size="sm" variant="secondary" />
          <Button label="Hayalet" size="sm" variant="ghost" />
          <Button label="Çıkış Yap" size="sm" variant="danger" />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <SectionHeader title="Metin Girişi" />
        <TextField
          label="E-posta"
          leftIcon="mail-outline"
          onChangeText={setEmail}
          placeholder="ornek@gundemio.com"
          value={email}
        />
      </View>

      <View style={styles.sectionContainer}>
        <SectionHeader actionLabel="Yenile" title="Haber Kartları" />
        <ArticleCard
          category="Teknoloji"
          publishedLabel="2 saat önce"
          source="TechNews"
          title="Yapay zekada yeni dönem: İnsan benzeri muhakeme yeteneğine sahip modellerin gerçek dünya etkileri tartışılıyor"
          variant="featured"
        />
        <ArticleCard
          bookmarked
          publishedLabel="35 dk önce"
          source="Ekonomi Gündemi"
          summary="Merkez bankası kararları sonrası döviz, altın ve teknoloji hisselerinde görülen hareketliliğin arka planı detaylı şekilde analiz edildi."
          title="Uzun vadeli yatırım stratejileri: Volatil piyasalarda risk dağıtımı nasıl yapılmalı?"
          variant="compact"
        />
      </View>

      <View style={styles.sectionContainer}>
        <SectionHeader title="Kaynak Kartları" />
        <View style={styles.listContainer}>
          <SourceCard description="Teknoloji • 450K Takipçi" isFollowing name="Webrazzi" />
          <SourceCard description="Gündem • 1.2M Takipçi" name="CNN Türk" />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <SectionHeader title="Yükleme İskeletleri" />
        <View style={styles.listContainer}>
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
          <SourceCardSkeleton />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <SectionHeader title="Boş Durum" />
        <EmptyState
          actionLabel="Haberleri Keşfet"
          description="Henüz kaydedilmiş haber yok. İlgini çeken içerikleri kaydederek daha sonra çevrimdışı okuyabilirsin."
          title="Henüz kaydedilmiş haber yok"
        />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.footnote}>
          Bu ekran geçici bir bileşen vitrini olarak eklendi. Gerçek veri akışları ve iş kuralları sonraki adımda
          entegre edilecek.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    gap: appTheme.spacing.md,
    paddingHorizontal: appTheme.spacing.lg,
  },
  chipContent: {
    gap: appTheme.spacing.sm,
    paddingHorizontal: appTheme.spacing.lg,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: appTheme.spacing.sm,
  },
  listContainer: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  footnote: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.md,
    marginBottom: appTheme.spacing.xl,
  },
});
