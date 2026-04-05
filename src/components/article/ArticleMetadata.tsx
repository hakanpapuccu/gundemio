import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { appTheme } from '../../theme';
import { formatDateTimeTr, formatTimeAgoTr } from '../../utils/date';

type ArticleMetadataProps = {
  category?: string | null;
  sourceName: string;
  sourceLogoUrl?: string | null;
  publishedAt: string;
  readingTimeLabel?: string;
  style?: StyleProp<ViewStyle>;
};

type SourceAvatarProps = {
  sourceName: string;
  sourceLogoUrl?: string | null;
};

function SourceAvatar({ sourceName, sourceLogoUrl }: SourceAvatarProps) {
  const [hasLogoError, setHasLogoError] = useState(false);

  useEffect(() => {
    setHasLogoError(false);
  }, [sourceLogoUrl]);

  const initial = useMemo(() => sourceName.trim().charAt(0).toUpperCase() || 'S', [sourceName]);

  if (sourceLogoUrl && !hasLogoError) {
    return (
      <Image
        onError={() => setHasLogoError(true)}
        source={{ uri: sourceLogoUrl }}
        style={styles.sourceAvatar}
      />
    );
  }

  return (
    <View style={[styles.sourceAvatar, styles.sourceFallback]}>
      <Text style={styles.sourceFallbackText}>{initial}</Text>
    </View>
  );
}

export function ArticleMetadata({
  category,
  sourceName,
  sourceLogoUrl,
  publishedAt,
  readingTimeLabel,
  style,
}: ArticleMetadataProps) {
  const publishedTimeAgo = formatTimeAgoTr(publishedAt);
  const publishedDateTime = formatDateTimeTr(publishedAt, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const sourceDetails = [readingTimeLabel, publishedDateTime].filter(Boolean).join(' • ');

  return (
    <View style={[styles.container, style]}>
      {category ? (
        <View style={styles.categoryBadge}>
          <Text numberOfLines={1} style={styles.categoryText}>
            {category}
          </Text>
        </View>
      ) : null}

      <View style={styles.metaRow}>
        <View style={styles.sourceRow}>
          <SourceAvatar sourceLogoUrl={sourceLogoUrl} sourceName={sourceName} />
          <View style={styles.sourceTextWrap}>
            <Text numberOfLines={1} style={styles.sourceName}>
              {sourceName}
            </Text>
            {sourceDetails ? (
              <Text numberOfLines={1} style={styles.sourceMeta}>
                {sourceDetails}
              </Text>
            ) : null}
          </View>
        </View>

        {publishedTimeAgo ? (
          <Text numberOfLines={1} style={styles.publishedAgo}>
            {publishedTimeAgo}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: appTheme.spacing.md,
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
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: appTheme.spacing.md,
    justifyContent: 'space-between',
  },
  sourceRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: appTheme.spacing.md,
    minWidth: 0,
  },
  sourceAvatar: {
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.full,
    borderWidth: 1,
    height: 44,
    width: 44,
  },
  sourceFallback: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.surfaceMuted,
    justifyContent: 'center',
  },
  sourceFallbackText: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.md,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  sourceTextWrap: {
    flex: 1,
    gap: appTheme.spacing.xxs,
    minWidth: 0,
  },
  sourceName: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.md,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  sourceMeta: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  publishedAgo: {
    color: appTheme.colors.textMuted,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    fontWeight: appTheme.typography.fontWeight.medium,
    lineHeight: appTheme.typography.lineHeight.sm,
    maxWidth: 90,
    textAlign: 'right',
  },
});
