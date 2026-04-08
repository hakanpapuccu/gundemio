import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { appTheme } from '../../theme';
import { Icon } from './Icon';
import { RemoteImage } from './RemoteImage';

type ArticleCardVariant = 'featured' | 'compact';

type ArticleCardProps = {
  title: string;
  summary?: string;
  source: string;
  publishedLabel: string;
  category?: string;
  imageUrl?: string | null;
  bookmarked?: boolean;
  variant?: ArticleCardVariant;
  onPress?: () => void;
  onPressBookmark?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ArticleCard({
  title,
  summary,
  source,
  publishedLabel,
  category,
  imageUrl,
  bookmarked = false,
  variant = 'compact',
  onPress,
  onPressBookmark,
  style,
}: ArticleCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.base, style]}>
      {variant === 'featured' ? (
        <>
          <RemoteImage
            fallbackIconSize={appTheme.sizes.iconXl}
            style={styles.featuredImage}
            uri={imageUrl}
          />
          <View style={styles.featuredContent}>
            {category ? (
              <View style={styles.categoryBadge}>
                <Text numberOfLines={1} style={styles.categoryText}>
                  {category}
                </Text>
              </View>
            ) : null}
            <Text numberOfLines={2} style={styles.featuredTitle}>
              {title}
            </Text>
            <Text numberOfLines={1} style={styles.metaText}>
              {source} • {publishedLabel}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.compactRow}>
          <View style={styles.compactContent}>
            <Text numberOfLines={2} style={styles.compactTitle}>
              {title}
            </Text>
            {summary ? (
              <Text ellipsizeMode="tail" numberOfLines={2} style={styles.summaryText}>
                {summary}
              </Text>
            ) : null}
            <View style={styles.metaRow}>
              <Text numberOfLines={1} style={styles.metaCompactText}>
                {source} • {publishedLabel}
              </Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={(event) => {
                  event.stopPropagation();
                  onPressBookmark?.();
                }}
                style={styles.bookmarkButton}
              >
                <Icon
                  color={bookmarked ? appTheme.colors.primary : appTheme.colors.textMuted}
                  name={bookmarked ? 'bookmark' : 'bookmark-border'}
                  size={appTheme.sizes.iconLg}
                />
              </Pressable>
            </View>
          </View>
          <RemoteImage style={styles.compactImage} uri={imageUrl} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.md,
    borderWidth: 1,
    overflow: 'hidden',
    ...appTheme.shadows.card,
  },
  featuredImage: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  featuredContent: {
    gap: appTheme.spacing.sm,
    padding: appTheme.spacing.lg,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: appTheme.colors.primarySoft,
    borderRadius: appTheme.radii.sm,
    paddingHorizontal: appTheme.spacing.sm,
    paddingVertical: appTheme.spacing.xs,
  },
  categoryText: {
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xs,
    fontWeight: appTheme.typography.fontWeight.bold,
    letterSpacing: appTheme.typography.letterSpacing.wider,
    lineHeight: appTheme.typography.lineHeight.xs,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xxl,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.xxl,
  },
  compactRow: {
    flexDirection: 'row',
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.md,
  },
  compactContent: {
    flex: 1,
    gap: appTheme.spacing.xs,
    minWidth: 0,
  },
  compactTitle: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.lg,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.lg,
  },
  summaryText: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: appTheme.spacing.xs,
  },
  metaText: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  metaCompactText: {
    color: appTheme.colors.textMuted,
    flex: 1,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    fontWeight: appTheme.typography.fontWeight.medium,
    lineHeight: appTheme.typography.lineHeight.sm,
    marginRight: appTheme.spacing.sm,
  },
  bookmarkButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactImage: {
    borderRadius: appTheme.radii.sm,
    height: appTheme.sizes.articleThumb,
    width: appTheme.sizes.articleThumb,
  },
});
