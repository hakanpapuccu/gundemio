import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import type { Article } from '../domain/models/news';
import { ArticleMetadata } from '../components/article/ArticleMetadata';
import {
  Button,
  EmptyState,
  Icon,
  ScreenContainer,
  SectionHeader,
  SkeletonBlock,
} from '../components/ui';
import { DEMO_USER_ID } from '../constants/session';
import {
  useArticleByIdQuery,
  useArticlesQuery,
  useSourceByIdQuery,
} from '../hooks/queries';
import { formatTimeAgoTr } from '../utils/date';
import { useBookmarks } from '../hooks/useBookmarks';

const WORDS_PER_MINUTE = 220;

function buildReadingTimeLabel(article: Article | null | undefined) {
  if (!article) {
    return undefined;
  }

  const text = [article.content, article.summary, article.title]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .trim();

  if (!text) {
    return undefined;
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return `${minutes} dk okuma suresi`;
}

function splitContentParagraphs(content: string | null | undefined) {
  if (!content) {
    return [];
  }

  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

type ArticleImageProps = {
  imageUrl?: string | null;
  height: number;
  borderRadius?: number;
};

function ArticleImage({ imageUrl, height, borderRadius = 0 }: ArticleImageProps) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [imageUrl]);

  if (imageUrl && !hasImageError) {
    return (
      <Image
        onError={() => setHasImageError(true)}
        source={{ uri: imageUrl }}
        style={[styles.imageBase, { height, borderRadius }]}
      />
    );
  }

  return (
    <View style={[styles.imageBase, styles.imageFallback, { height, borderRadius }]}>
      <Icon color={appTheme.colors.textMuted} name="image" size={appTheme.sizes.iconXl} />
    </View>
  );
}

type QuickActionButtonProps = {
  label: string;
  icon: 'bookmark' | 'bookmark-border' | 'share';
  active?: boolean;
  onPress: () => void;
};

function QuickActionButton({
  label,
  icon,
  active = false,
  onPress,
}: QuickActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAction,
        pressed && styles.quickActionPressed,
      ]}
    >
      <View
        style={[
          styles.quickActionIconWrap,
          active && styles.quickActionIconWrapActive,
        ]}
      >
        <Icon
          color={active ? appTheme.colors.primary : appTheme.colors.textSecondary}
          name={icon}
          size={appTheme.sizes.iconMd}
        />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

type RelatedArticleItemProps = {
  article: Article;
  bookmarked: boolean;
  onPress: () => void;
  onPressBookmark: () => void;
};

function RelatedArticleItem({
  article,
  bookmarked,
  onPress,
  onPressBookmark,
}: RelatedArticleItemProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.relatedCard}>
      <ArticleImage
        borderRadius={appTheme.radii.sm}
        height={appTheme.sizes.articleThumb}
        imageUrl={article.imageUrl}
      />
      <View style={styles.relatedContent}>
        {article.categoryName ? (
          <Text numberOfLines={1} style={styles.relatedCategory}>
            {article.categoryName}
          </Text>
        ) : null}
        <Text numberOfLines={2} style={styles.relatedTitle}>
          {article.title}
        </Text>
        <View style={styles.relatedMetaRow}>
          <Text numberOfLines={1} style={styles.relatedMeta}>
            {formatTimeAgoTr(article.publishedAt)}
          </Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onPressBookmark();
            }}
          >
            <Icon
              color={bookmarked ? appTheme.colors.primary : appTheme.colors.textMuted}
              name={bookmarked ? 'bookmark' : 'bookmark-border'}
              size={appTheme.sizes.iconMd}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function DetailLoadingState() {
  return (
    <>
      <SkeletonBlock borderRadius={0} height={260} />
      <View style={styles.contentContainer}>
        <SkeletonBlock borderRadius={appTheme.radii.sm} height={24} width={90} />
        <SkeletonBlock height={40} width="92%" />
        <SkeletonBlock height={40} width="82%" />
        <View style={styles.metadataSkeletonRow}>
          <SkeletonBlock borderRadius={appTheme.radii.full} height={44} width={44} />
          <View style={styles.metadataSkeletonText}>
            <SkeletonBlock height={16} width={120} />
            <SkeletonBlock height={14} width={170} />
          </View>
          <SkeletonBlock height={14} width={72} />
        </View>
        <View style={styles.quickActionsRow}>
          <SkeletonBlock borderRadius={appTheme.radii.md} height={64} width={64} />
          <SkeletonBlock borderRadius={appTheme.radii.md} height={64} width={64} />
        </View>
        <SkeletonBlock height={22} width="100%" />
        <SkeletonBlock height={22} width="100%" />
        <SkeletonBlock height={22} width="84%" />
        <SkeletonBlock
          borderRadius={appTheme.radii.md}
          height={appTheme.sizes.buttonHeightLg}
          width="100%"
        />
      </View>
      <View style={styles.relatedSection}>
        <View style={styles.relatedSectionHeader}>
          <SkeletonBlock height={24} width={160} />
        </View>
        <View style={styles.relatedList}>
          <SkeletonBlock borderRadius={appTheme.radii.md} height={120} />
          <SkeletonBlock borderRadius={appTheme.radii.md} height={120} />
        </View>
      </View>
    </>
  );
}

export function ArticleDetailScreen({
  navigation,
  route,
}: RootStackScreenProps<'ArticleDetail'>) {
  const { isBookmarked, toggleBookmark } = useBookmarks(DEMO_USER_ID);
  const articleQuery = useArticleByIdQuery({
    articleId: route.params.articleId,
    userId: DEMO_USER_ID,
  });
  const article = articleQuery.data;
  const articleBookmarked = article ? isBookmarked(article.id, article.isFavorite) : false;

  const sourceQuery = useSourceByIdQuery({
    sourceId: article?.sourceId ?? '',
    enabled: Boolean(article?.sourceId),
  });

  const relatedArticlesQuery = useArticlesQuery(
    {
      page: 1,
      limit: 5,
      userId: DEMO_USER_ID,
      filters: article ? { sourceIds: [article.sourceId] } : undefined,
    },
    {
      enabled: Boolean(article?.sourceId),
    }
  );

  const relatedArticles = useMemo(
    () =>
      (relatedArticlesQuery.data?.items ?? [])
        .filter((item) => item.id !== article?.id)
        .slice(0, 3),
    [article?.id, relatedArticlesQuery.data?.items]
  );

  const contentParagraphs = useMemo(
    () => splitContentParagraphs(article?.content),
    [article?.content]
  );
  const hasFullContent = contentParagraphs.length > 0;
  const readingTimeLabel = useMemo(
    () => buildReadingTimeLabel(article),
    [article]
  );

  const handleToggleFavorite = useCallback(
    (articleId: string, nextValue?: boolean) => {
      toggleBookmark(articleId, nextValue);
    },
    [toggleBookmark]
  );

  const handleShare = useCallback(async () => {
    if (!article) {
      return;
    }

    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n${article.link}`,
        url: article.link,
      });
    } catch {
      // User cancelled the native share sheet.
    }
  }, [article]);

  const handleOpenOriginalSource = useCallback(async () => {
    if (!article) {
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(article.link);
      if (canOpen) {
        await Linking.openURL(article.link);
        return;
      }
    } catch {
      // Fallback to source profile below.
    }

    navigation.navigate('SourceDetail', {
      sourceId: article.sourceId,
      sourceName: article.sourceName,
    });
  }, [article, navigation]);

  return (
    <ScreenContainer
      contentContainerStyle={styles.scrollContent}
      scrollable
      style={styles.container}
      withHorizontalPadding={false}
    >
      {articleQuery.isLoading ? (
        <DetailLoadingState />
      ) : !article ? (
        <View style={styles.contentContainer}>
          <EmptyState
            actionLabel="Ana Sayfaya Don"
            description="Bu haber bulunamadi veya kaldirilmis olabilir."
            onPressAction={() => navigation.navigate('MainTabs', { screen: 'Home' })}
            title="Haber Bulunamadi"
          />
        </View>
      ) : (
        <>
          <ArticleImage height={280} imageUrl={article.imageUrl} />

          <View style={styles.contentContainer}>
            <ArticleMetadata
              category={article.categoryName}
              publishedAt={article.publishedAt}
              readingTimeLabel={readingTimeLabel}
              sourceLogoUrl={sourceQuery.data?.logoUrl}
              sourceName={article.sourceName}
            />

            <Text style={styles.title}>{article.title}</Text>

            <View style={styles.quickActionsRow}>
              <QuickActionButton
                active={articleBookmarked}
                icon={articleBookmarked ? 'bookmark' : 'bookmark-border'}
                label="Kaydet"
                onPress={() => handleToggleFavorite(article.id, !articleBookmarked)}
              />
              <QuickActionButton
                icon="share"
                label="Paylas"
                onPress={() => {
                  void handleShare();
                }}
              />
            </View>

            {article.summary ? (
              <Text style={styles.summary}>{article.summary}</Text>
            ) : null}

            <View style={styles.contentBlock}>
              {hasFullContent ? (
                contentParagraphs.map((paragraph, index) => (
                  <Text
                    key={`${article.id}-paragraph-${index + 1}`}
                    style={[
                      styles.paragraph,
                      index === 0 && !article.summary && styles.leadParagraph,
                    ]}
                  >
                    {paragraph}
                  </Text>
                ))
              ) : (
                <View style={styles.partialContentCard}>
                  <Text style={styles.partialContentTitle}>
                    Detayli icerik henuz mevcut degil
                  </Text>
                  <Text style={styles.partialContentDescription}>
                    Bu haberin tam metni kaynaktan cekilemedi. Orijinal baglantiya
                    giderek haberi tam haliyle okuyabilirsin.
                  </Text>
                </View>
              )}
            </View>

            <Button
              fullWidth
              label="Orijinal Kaynaga Git"
              onPress={() => {
                void handleOpenOriginalSource();
              }}
              rightIcon="open-in-new"
              size="lg"
            />
          </View>

          <View style={styles.relatedSection}>
            <View style={styles.relatedSectionHeader}>
              <SectionHeader title="Ilgili Haberler" />
            </View>
            <View style={styles.relatedList}>
              {relatedArticlesQuery.isLoading ? (
                <>
                  <SkeletonBlock borderRadius={appTheme.radii.md} height={120} />
                  <SkeletonBlock borderRadius={appTheme.radii.md} height={120} />
                </>
              ) : relatedArticles.length === 0 ? (
                <View style={styles.contentContainer}>
                  <EmptyState
                    description="Bu kaynakta gosterilecek baska haber bulunamadi."
                    icon="folder-open"
                    title="Ilgili Haber Yok"
                  />
                </View>
              ) : (
                relatedArticles.map((relatedArticle) => (
                  <RelatedArticleItem
                    key={relatedArticle.id}
                    article={relatedArticle}
                    bookmarked={isBookmarked(relatedArticle.id, relatedArticle.isFavorite)}
                    onPress={() =>
                      navigation.push('ArticleDetail', {
                        articleId: relatedArticle.id,
                        title: relatedArticle.title,
                      })
                    }
                    onPressBookmark={() =>
                      handleToggleFavorite(
                        relatedArticle.id,
                        !isBookmarked(relatedArticle.id, relatedArticle.isFavorite)
                      )
                    }
                  />
                ))
              )}
            </View>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.background,
  },
  scrollContent: {
    gap: 0,
  },
  imageBase: {
    backgroundColor: appTheme.colors.surfaceMuted,
    width: '100%',
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    gap: appTheme.spacing.lg,
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.lg,
  },
  metadataSkeletonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: appTheme.spacing.md,
  },
  metadataSkeletonText: {
    flex: 1,
    gap: appTheme.spacing.xs,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.display,
    fontWeight: appTheme.typography.fontWeight.extraBold,
    letterSpacing: appTheme.typography.letterSpacing.tight,
    lineHeight: appTheme.typography.lineHeight.display,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
  },
  quickAction: {
    alignItems: 'center',
    flexShrink: 0,
    gap: appTheme.spacing.xs,
    justifyContent: 'center',
    minWidth: 72,
    paddingVertical: appTheme.spacing.xs,
  },
  quickActionPressed: {
    opacity: 0.7,
  },
  quickActionIconWrap: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.surfaceMuted,
    borderRadius: appTheme.radii.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  quickActionIconWrapActive: {
    backgroundColor: appTheme.colors.primarySoft,
  },
  quickActionLabel: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xs,
    fontWeight: appTheme.typography.fontWeight.bold,
    letterSpacing: appTheme.typography.letterSpacing.wider,
    lineHeight: appTheme.typography.lineHeight.xs,
    textTransform: 'uppercase',
  },
  summary: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.lg,
    fontWeight: appTheme.typography.fontWeight.semiBold,
    lineHeight: appTheme.typography.lineHeight.lg,
  },
  contentBlock: {
    gap: appTheme.spacing.md,
  },
  leadParagraph: {
    color: appTheme.colors.textPrimary,
    fontWeight: appTheme.typography.fontWeight.semiBold,
  },
  paragraph: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.lg,
    lineHeight: appTheme.typography.lineHeight.lg,
  },
  partialContentCard: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.md,
    borderWidth: 1,
    gap: appTheme.spacing.sm,
    padding: appTheme.spacing.md,
  },
  partialContentTitle: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.md,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  partialContentDescription: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  relatedSection: {
    backgroundColor: appTheme.colors.surfaceMuted,
    borderTopColor: appTheme.colors.borderSoft,
    borderTopWidth: 1,
    marginTop: appTheme.spacing.xxl,
    paddingTop: appTheme.spacing.xl,
  },
  relatedSectionHeader: {
    paddingHorizontal: appTheme.spacing.lg,
  },
  relatedList: {
    gap: appTheme.spacing.sm,
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.md,
    paddingBottom: appTheme.spacing.xxxl,
  },
  relatedCard: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: appTheme.spacing.md,
    overflow: 'hidden',
    padding: appTheme.spacing.md,
  },
  relatedContent: {
    flex: 1,
    gap: appTheme.spacing.xs,
    justifyContent: 'center',
    minWidth: 0,
  },
  relatedCategory: {
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xs,
    fontWeight: appTheme.typography.fontWeight.extraBold,
    letterSpacing: appTheme.typography.letterSpacing.wider,
    lineHeight: appTheme.typography.lineHeight.xs,
    textTransform: 'uppercase',
  },
  relatedTitle: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.md,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  relatedMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: appTheme.spacing.xs,
  },
  relatedMeta: {
    color: appTheme.colors.textMuted,
    flex: 1,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
    marginRight: appTheme.spacing.sm,
  },
});
