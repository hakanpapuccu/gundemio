import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../theme';
import {
  Button,
  Chip,
  EmptyState,
  ScreenContainer,
  SectionHeader,
  SkeletonBlock,
  SourceCard,
  SourceCardSkeleton,
} from '../components/ui';
import {
  useCategoriesQuery,
  useSourcesQuery,
  useUpsertPreferencesMutation,
  useUserPreferencesQuery,
} from '../hooks/queries';
import { useSession } from '../hooks/useSession';

export function PreferencesScreen() {
  const { activeUserId, isAuthenticated } = useSession();
  const categoriesQuery = useCategoriesQuery();
  const sourcesQuery = useSourcesQuery({ page: 1, limit: 20 });
  const userPreferencesQuery = useUserPreferencesQuery({ userId: activeUserId });
  const upsertPreferencesMutation = useUpsertPreferencesMutation();

  const selectedCategoryIds = userPreferencesQuery.data?.categoryIds ?? [];
  const selectedSourceIds = userPreferencesQuery.data?.sourceIds ?? [];
  const isQueryError =
    categoriesQuery.isError || sourcesQuery.isError || userPreferencesQuery.isError;

  const handleRetry = useCallback(async () => {
    await Promise.all([categoriesQuery.refetch(), sourcesQuery.refetch(), userPreferencesQuery.refetch()]);
  }, [categoriesQuery, sourcesQuery, userPreferencesQuery]);

  const commitPreferences = (params: {
    categoryIds: string[];
    sourceIds: string[];
  }) => {
    upsertPreferencesMutation.mutate({
      userId: activeUserId,
      categoryIds: params.categoryIds,
      sourceIds: params.sourceIds,
    });
  };

  const toggleCategory = (categoryId: string) => {
    const nextCategoryIds = selectedCategoryIds.includes(categoryId)
      ? selectedCategoryIds.filter((id) => id !== categoryId)
      : [...selectedCategoryIds, categoryId];

    commitPreferences({
      categoryIds: nextCategoryIds,
      sourceIds: selectedSourceIds,
    });
  };

  const toggleSource = (sourceId: string) => {
    const nextSourceIds = selectedSourceIds.includes(sourceId)
      ? selectedSourceIds.filter((id) => id !== sourceId)
      : [...selectedSourceIds, sourceId];

    commitPreferences({
      categoryIds: selectedCategoryIds,
      sourceIds: nextSourceIds,
    });
  };

  const resetPreferences = () => {
    commitPreferences({
      categoryIds: [],
      sourceIds: [],
    });
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>İlgi alanına göre filtrele</Text>
        <Text style={styles.heroSubtitle}>
          Senin için önemli olan kategorileri ve kaynakları seçerek akışına yön ver.
        </Text>
      </View>

      {!isAuthenticated ? (
        <View style={styles.guestNotice}>
          <Text style={styles.guestNoticeTitle}>Misafir modundasın</Text>
          <Text style={styles.guestNoticeBody}>
            Tercihlerin bu cihazda saklanır. Hesapla giriş yaparsan tercihlerin cihazlar arası senkron olur.
          </Text>
        </View>
      ) : null}

      {isQueryError ? (
        <EmptyState
          actionLabel="Tekrar Dene"
          description="Tercih bilgileri yüklenirken bir sorun oluştu."
          icon="warning"
          onPressAction={() => {
            void handleRetry();
          }}
          title="Tercihler yüklenemedi"
        />
      ) : null}

      {!isQueryError ? (
        <>
          <View style={styles.section}>
            <SectionHeader title="Kategori Tercihleri" />
            <ScrollView
              contentContainerStyle={styles.chipsWrap}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {categoriesQuery.isLoading
                ? (
                    <>
                      <SkeletonBlock borderRadius={appTheme.radii.full} height={appTheme.sizes.chipHeight} width={72} />
                      <SkeletonBlock borderRadius={appTheme.radii.full} height={appTheme.sizes.chipHeight} width={96} />
                      <SkeletonBlock borderRadius={appTheme.radii.full} height={appTheme.sizes.chipHeight} width={88} />
                    </>
                  )
                : (categoriesQuery.data ?? []).map((category) => (
                    <Chip
                      key={category.id}
                      label={category.name}
                      onPress={() => toggleCategory(category.id)}
                      selected={selectedCategoryIds.includes(category.id)}
                    />
                  ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Kaynak Tercihleri" />
            <View style={styles.sourceList}>
              {sourcesQuery.isLoading ? (
                <>
                  <SourceCardSkeleton />
                  <SourceCardSkeleton />
                  <SourceCardSkeleton />
                </>
              ) : (sourcesQuery.data?.items ?? []).length === 0 ? (
                <EmptyState
                  description="Listelenecek aktif kaynak bulunamadı."
                  icon="newspaper"
                  title="Kaynak bulunamadı"
                />
              ) : (
                (sourcesQuery.data?.items ?? []).map((source) => (
                  <SourceCard
                    key={source.id}
                    description={source.description ?? 'Haber kaynağı'}
                    imageUrl={source.logoUrl}
                    isFollowing={selectedSourceIds.includes(source.id)}
                    name={source.name}
                    onToggleFollow={() => toggleSource(source.id)}
                  />
                ))
              )}
            </View>
          </View>
        </>
      ) : null}

      {upsertPreferencesMutation.error ? (
        <Text style={styles.errorText}>
          Tercihler kaydedilemedi. Bağlantıyı kontrol edip tekrar dene.
        </Text>
      ) : null}

      {!isQueryError ? (
        <Button
          fullWidth
          label="Tercihleri Sıfırla"
          loading={upsertPreferencesMutation.isPending}
          onPress={resetPreferences}
          size="lg"
          variant="ghost"
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.xl,
    borderWidth: 1,
    gap: appTheme.spacing.sm,
    padding: appTheme.spacing.xxl,
  },
  heroTitle: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xxl,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.xxl,
  },
  heroSubtitle: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  guestNotice: {
    backgroundColor: appTheme.colors.primarySoft,
    borderRadius: appTheme.radii.md,
    gap: appTheme.spacing.xs,
    padding: appTheme.spacing.md,
  },
  guestNoticeTitle: {
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.md,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  guestNoticeBody: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  section: {
    gap: appTheme.spacing.md,
  },
  chipsWrap: {
    gap: appTheme.spacing.sm,
  },
  sourceList: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  errorText: {
    color: appTheme.colors.danger,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
});
