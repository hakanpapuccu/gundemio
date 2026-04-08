import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, ArticleCardSkeleton, Button, EmptyState, ScreenContainer, SectionHeader, SourceCard, SourceCardSkeleton } from '../components/ui';
import { useArticlesQuery, useSourceByIdQuery, useUpsertPreferencesMutation, useUserPreferencesQuery } from '../hooks/queries';
import { formatTimeAgoTr } from '../utils/date';
import { useBookmarks } from '../hooks/useBookmarks';
import { useSession } from '../hooks/useSession';

export function SourceDetailScreen({ navigation, route }: RootStackScreenProps<'SourceDetail'>) {
  const { activeUserId } = useSession();
  const sourceQuery = useSourceByIdQuery({ sourceId: route.params.sourceId });
  const source = sourceQuery.data;
  const sourceName = source?.name ?? route.params.sourceName ?? 'Kaynak Detayı';

  const userPreferencesQuery = useUserPreferencesQuery({ userId: activeUserId });
  const upsertPreferencesMutation = useUpsertPreferencesMutation();
  const { isBookmarked, toggleBookmark } = useBookmarks(activeUserId);

  const articlesQuery = useArticlesQuery(
    {
      page: 1,
      limit: 10,
      userId: activeUserId,
      filters: source ? { sourceIds: [source.id] } : undefined,
    },
    {
      enabled: Boolean(source?.id),
    }
  );

  const selectedSourceIds = userPreferencesQuery.data?.sourceIds ?? [];
  const isFollowing = source ? selectedSourceIds.includes(source.id) : false;
  const hasArticlesError = Boolean(source) && articlesQuery.isError;

  const handleRetry = useCallback(async () => {
    await Promise.all([sourceQuery.refetch(), userPreferencesQuery.refetch(), articlesQuery.refetch()]);
  }, [articlesQuery, sourceQuery, userPreferencesQuery]);

  const handleToggleFollow = () => {
    if (!source) {
      return;
    }

    const nextSourceIds = isFollowing
      ? selectedSourceIds.filter((id) => id !== source.id)
      : [...selectedSourceIds, source.id];

    upsertPreferencesMutation.mutate({
      userId: activeUserId,
      categoryIds: userPreferencesQuery.data?.categoryIds ?? [],
      sourceIds: nextSourceIds,
    });
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.hero}>
        <Text style={styles.title}>{sourceName}</Text>
        <Text style={styles.subtitle}>
          Kaynak profili, takip aksiyonları ve yayın istatistikleri bu alanda gösterilir.
        </Text>
      </View>

      {sourceQuery.isLoading ? (
        <SourceCardSkeleton />
      ) : sourceQuery.isError ? (
        <EmptyState
          actionLabel="Tekrar Dene"
          description="Kaynak detayları alınırken bir sorun oluştu."
          icon="warning"
          onPressAction={() => {
            void handleRetry();
          }}
          title="Kaynağa erişilemedi"
        />
      ) : source ? (
        <SourceCard
          description={source.description ?? 'Haber kaynağı'}
          imageUrl={source.logoUrl}
          isFollowing={isFollowing}
          name={source.name}
          onToggleFollow={handleToggleFollow}
        />
      ) : (
        <EmptyState
          description="Bu kaynak bulunamadı veya artık aktif değil."
          icon="folder-open"
          title="Kaynak Bulunamadı"
        />
      )}

      <Button
        fullWidth
        label="Tercihleri Düzenle"
        onPress={() => navigation.navigate('Preferences')}
        size="lg"
        variant="secondary"
      />

      <View style={styles.section}>
        <SectionHeader title={`${sourceName} Son Haberler`} />
        {hasArticlesError ? (
          <EmptyState
            actionLabel="Tekrar Dene"
            description="Kaynağın haberleri yüklenirken bir sorun oluştu."
            icon="warning"
            onPressAction={() => {
              void handleRetry();
            }}
            title="Haberler yüklenemedi"
          />
        ) : articlesQuery.isLoading ? (
          <>
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </>
        ) : (articlesQuery.data?.items ?? []).length === 0 ? (
          <EmptyState
            description="Bu kaynağa ait yayınlanmış haber bulunamadı."
            icon="folder-open"
            title="Haber Bulunamadı"
          />
        ) : (
          (articlesQuery.data?.items ?? []).map((article) => (
            <ArticleCard
              key={article.id}
              bookmarked={isBookmarked(article.id, article.isFavorite)}
              imageUrl={article.imageUrl}
              onPress={() =>
                navigation.navigate('ArticleDetail', {
                  articleId: article.id,
                  title: article.title,
                })
              }
              onPressBookmark={() => toggleBookmark(article.id, !isBookmarked(article.id, article.isFavorite))}
              publishedLabel={formatTimeAgoTr(article.publishedAt)}
              source={article.sourceName}
              summary={article.summary ?? undefined}
              title={article.title}
            />
          ))
        )}
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
