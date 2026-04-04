import { StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, ArticleCardSkeleton, Button, EmptyState, ScreenContainer, SectionHeader, SourceCard, SourceCardSkeleton } from '../components/ui';
import { DEMO_USER_ID } from '../constants/session';
import { useArticlesQuery, useSourceByIdQuery, useToggleFavoriteMutation, useUpsertPreferencesMutation, useUserPreferencesQuery } from '../hooks/queries';
import { formatTimeAgoTr } from '../utils/date';

export function SourceDetailScreen({ navigation, route }: RootStackScreenProps<'SourceDetail'>) {
  const sourceQuery = useSourceByIdQuery({ sourceId: route.params.sourceId });
  const source = sourceQuery.data;
  const sourceName = source?.name ?? route.params.sourceName ?? 'Kaynak Detayı';

  const userPreferencesQuery = useUserPreferencesQuery({ userId: DEMO_USER_ID });
  const upsertPreferencesMutation = useUpsertPreferencesMutation();
  const toggleFavoriteMutation = useToggleFavoriteMutation();

  const articlesQuery = useArticlesQuery(
    {
      page: 1,
      limit: 10,
      userId: DEMO_USER_ID,
      filters: source ? { sourceIds: [source.id] } : undefined,
    },
    {
      enabled: Boolean(source?.id),
    }
  );

  const selectedSourceIds = userPreferencesQuery.data?.sourceIds ?? [];
  const isFollowing = source ? selectedSourceIds.includes(source.id) : false;

  const handleToggleFollow = () => {
    if (!source) {
      return;
    }

    const nextSourceIds = isFollowing
      ? selectedSourceIds.filter((id) => id !== source.id)
      : [...selectedSourceIds, source.id];

    upsertPreferencesMutation.mutate({
      userId: DEMO_USER_ID,
      categoryIds: userPreferencesQuery.data?.categoryIds ?? [],
      sourceIds: nextSourceIds,
    });
  };

  const handleToggleFavorite = (articleId: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({
      userId: DEMO_USER_ID,
      articleId,
      isFavorite: !isFavorite,
    });
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.hero}>
        <Text style={styles.title}>{sourceName}</Text>
        <Text style={styles.subtitle}>
          Kaynak profili, takip aksiyonlari ve yayin istatistikleri bu alanda gosterilir.
        </Text>
      </View>

      {sourceQuery.isLoading ? (
        <SourceCardSkeleton />
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
          description="Bu kaynak bulunamadi veya artik aktif degil."
          icon="folder-open"
          title="Kaynak Bulunamadi"
        />
      )}

      <Button
        fullWidth
        label="Tercihleri Duzenle"
        onPress={() => navigation.navigate('Preferences')}
        size="lg"
        variant="secondary"
      />

      <View style={styles.section}>
        <SectionHeader title={`${sourceName} Son Haberler`} />
        {articlesQuery.isLoading ? (
          <>
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </>
        ) : (articlesQuery.data?.items ?? []).length === 0 ? (
          <EmptyState
            description="Bu kaynaga ait yayinlanmis haber bulunamadi."
            icon="folder-open"
            title="Haber Bulunamadi"
          />
        ) : (
          (articlesQuery.data?.items ?? []).map((article) => (
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
