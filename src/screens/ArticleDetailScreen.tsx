import { StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, Button, ScreenContainer, SectionHeader } from '../components/ui';

export function ArticleDetailScreen({ navigation, route }: RootStackScreenProps<'ArticleDetail'>) {
  const articleTitle = route.params.title ?? 'Haber Detayı';

  return (
    <ScreenContainer scrollable>
      <View style={styles.headerMeta}>
        <Text style={styles.category}>Teknoloji</Text>
        <Text style={styles.meta}>TechNews • 2 saat önce</Text>
      </View>

      <Text style={styles.title}>{articleTitle}</Text>

      <Text style={styles.lead}>
        Bu sayfa şu anda navigation ve ekran akışını doğrulamak için placeholder içerik göstermektedir.
        Makale gövdesi, kaynaktan gelen veriler bağlandığında bu alanda gösterilecek.
      </Text>

      <Text style={styles.paragraph}>
        RSS içerikleri Supabase üzerinden okunacak şekilde veri katmanı hazırlandıktan sonra detay metni, kaynak
        adı, paylaşım ve kaydetme aksiyonları bu ekrana entegre edilecek.
      </Text>

      <Button
        fullWidth
        label="Kaynağa Git"
        onPress={() =>
          navigation.navigate('SourceDetail', {
            sourceId: 'tech-news',
            sourceName: 'TechNews',
          })
        }
        rightIcon="open-in-new"
        size="lg"
      />

      <View style={styles.relatedSection}>
        <SectionHeader title="İlgili Haberler" />
        <ArticleCard
          onPress={() =>
            navigation.push('ArticleDetail', {
              articleId: 'related-1',
              title: 'Yeni Nesil Şifreleme Yöntemleri ve AI Tehdidi',
            })
          }
          publishedLabel="4 saat önce"
          source="Siber Güvenlik"
          summary="Detay ekranındaki ilgili haber kartları gerçek veri akışı tamamlandığında dinamikleşecek."
          title="Yeni Nesil Şifreleme Yöntemleri ve AI Tehdidi"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerMeta: {
    gap: appTheme.spacing.xs,
  },
  category: {
    alignSelf: 'flex-start',
    backgroundColor: appTheme.colors.primarySoft,
    borderRadius: appTheme.radii.sm,
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xs,
    fontWeight: appTheme.typography.fontWeight.bold,
    letterSpacing: appTheme.typography.letterSpacing.wider,
    lineHeight: appTheme.typography.lineHeight.xs,
    paddingHorizontal: appTheme.spacing.sm,
    paddingVertical: appTheme.spacing.xs,
    textTransform: 'uppercase',
  },
  meta: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.display,
    fontWeight: appTheme.typography.fontWeight.extraBold,
    letterSpacing: appTheme.typography.letterSpacing.tight,
    lineHeight: appTheme.typography.lineHeight.display,
  },
  lead: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.lg,
    fontWeight: appTheme.typography.fontWeight.semiBold,
    lineHeight: appTheme.typography.lineHeight.lg,
  },
  paragraph: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.lg,
    lineHeight: appTheme.typography.lineHeight.lg,
  },
  relatedSection: {
    gap: appTheme.spacing.md,
  },
});
