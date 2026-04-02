import { StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, Button, ScreenContainer, SectionHeader, SourceCard } from '../components/ui';

export function SourceDetailScreen({ navigation, route }: RootStackScreenProps<'SourceDetail'>) {
  const sourceName = route.params.sourceName ?? 'Kaynak Detayı';

  return (
    <ScreenContainer scrollable>
      <View style={styles.hero}>
        <Text style={styles.title}>{sourceName}</Text>
        <Text style={styles.subtitle}>
          Kaynak profili, takip aksiyonları ve yayın istatistikleri gerçek veriyle bu alanda gösterilecek.
        </Text>
      </View>

      <SourceCard description="Gündem • 1.2M Takipçi" isFollowing name={sourceName} />

      <Button
        fullWidth
        label="Tercihleri Düzenle"
        onPress={() => navigation.navigate('Preferences')}
        size="lg"
        variant="secondary"
      />

      <View style={styles.section}>
        <SectionHeader title={`${sourceName} Son Haberler`} />
        <ArticleCard
          onPress={() =>
            navigation.navigate('ArticleDetail', {
              articleId: `${route.params.sourceId}-latest-1`,
              title: `${sourceName}: Öne Çıkan Haber`,
            })
          }
          publishedLabel="35 dk önce"
          source={sourceName}
          summary="Kaynak detayından haber detayına geçiş için örnek kart."
          title={`${sourceName}: Öne Çıkan Haber`}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.lg,
    borderWidth: 1,
    gap: appTheme.spacing.sm,
    padding: appTheme.spacing.lg,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xxl,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.xxl,
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  section: {
    gap: appTheme.spacing.md,
  },
});
