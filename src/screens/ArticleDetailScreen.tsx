import { StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { ArticleCard, ArticleCardSkeleton, Button, EmptyState, ScreenContainer, SectionHeader } from '../components/ui';
import { DEMO_USER_ID } from '../constants/session';
import { useArticleByIdQuery, useArticlesQuery, useToggleFavoriteMutation } from '../hooks/queries';
import { formatTimeAgoTr } from '../utils/date';

export function ArticleDetailScreen({ navigation, route }: RootStackScreenProps<'ArticleDetail'>) {
  const articleQuery = useArticleByIdQuery({
    articleId: route.params.articleId,
    userId: DEMO_USER_ID,
  });
  const toggleFavoriteMutation = useToggleFavoriteMutation();

  const article = articleQuery.data;
  const relatedArticlesQuery = useArticlesQuery(
    {
      page: 1,
      limit: 5,
      userId: DEMO_USER_ID,
      filters: {
        sourceIds: article ? [article.sourceId] : undefined,
      },
    },
    {
      enabled: Boolean(article?.sourceId),
    }
  );

  const relatedArticles = (relatedArticlesQuery.data?.items ?? []).filter((item) => item.id !== article?.id).slice(0, 3);

  const handleToggleFavorite = (articleId: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({
      userId: DEMO_USER_ID,
      articleId,
      isFavorite: !isFavorite,
    });
  };

  return (
    <ScreenContainer scrollable>
      {articleQuery.isLoading ? (
        <>
          <View style={styles.headerMeta}>
            <Text style={styles.meta}>Yukleniyor...</Text>
          </View>
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </>
      ) : !article ? (
        <EmptyState
          actionLabel="Ana Sayfaya Don"
          description="Bu haber bulunamadi veya kaldirilmis olabilir."
          onPressAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          title="Haber Bulunamadi"
        />
      ) : (
        <>
          <View style={styles.headerMeta}>
            {article.categoryName ? <Text style={styles.category}>{article.categoryName}</Text> : null}
            <Text style={styles.meta}>
              {article.sourceName} • {formatTimeAgoTr(article.publishedAt)}
            </Text>
          </View>

          <Text style={styles.title}>{article.title}</Text>

          {article.summary ? <Text style={styles.lead}>{article.summary}</Text> : null}

          <Text style={styles.paragraph}>
            {article.content ??
              'Bu haber icin detay metin henuz saglanmamis. Kaynak baglantisini kullanarak orijinal habere ulasabilirsin.'}
          </Text>

          <Button
            fullWidth
            label="Kaynaga Git"
            onPress={() =>
              navigation.navigate('SourceDetail', {
                sourceId: article.sourceId,
                sourceName: article.sourceName,
              })
            }
            rightIcon="open-in-new"
            size="lg"
          />

          <View style={styles.relatedSection}>
            <SectionHeader title="Ilgili Haberler" />
            {relatedArticlesQuery.isLoading ? (
              <>
                <ArticleCardSkeleton />
                <ArticleCardSkeleton />
              </>
            ) : relatedArticles.length === 0 ? (
              <EmptyState
                description="Bu kaynakta gosterilecek baska haber bulunamadi."
                icon="folder-open"
                title="Ilgili Haber Yok"
              />
            ) : (
              relatedArticles.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.id}
                  bookmarked={relatedArticle.isFavorite}
                  imageUrl={relatedArticle.imageUrl}
                  onPress={() =>
                    navigation.push('ArticleDetail', {
                      articleId: relatedArticle.id,
                      title: relatedArticle.title,
                    })
                  }
                  onPressBookmark={() => handleToggleFavorite(relatedArticle.id, relatedArticle.isFavorite)}
                  publishedLabel={formatTimeAgoTr(relatedArticle.publishedAt)}
                  source={relatedArticle.sourceName}
                  summary={relatedArticle.summary ?? undefined}
                  title={relatedArticle.title}
                />
              ))
            )}
          </View>
        </>
      )}
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
