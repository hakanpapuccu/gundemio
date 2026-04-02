import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';

import { appTheme } from '../../theme';

type SkeletonBlockProps = {
  width?: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBlock({ width = '100%', height, borderRadius = appTheme.radii.sm, style }: SkeletonBlockProps) {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

export function ArticleCardSkeleton() {
  return (
    <View style={styles.articleContainer}>
      <SkeletonBlock borderRadius={appTheme.radii.sm} height={appTheme.sizes.articleThumb} width={appTheme.sizes.articleThumb} />
      <View style={styles.articleTextCol}>
        <SkeletonBlock height={18} width="95%" />
        <SkeletonBlock height={16} width="80%" />
        <SkeletonBlock height={14} width="65%" />
      </View>
    </View>
  );
}

export function SourceCardSkeleton() {
  return (
    <View style={styles.sourceContainer}>
      <SkeletonBlock borderRadius={appTheme.radii.full} height={appTheme.sizes.sourceAvatar} width={appTheme.sizes.sourceAvatar} />
      <View style={styles.sourceTextCol}>
        <SkeletonBlock height={16} width="70%" />
        <SkeletonBlock height={14} width="50%" />
      </View>
      <SkeletonBlock borderRadius={appTheme.radii.full} height={36} width={96} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: appTheme.colors.border,
  },
  articleContainer: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.md,
  },
  articleTextCol: {
    flex: 1,
    gap: appTheme.spacing.sm,
  },
  sourceContainer: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    borderBottomColor: appTheme.colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: appTheme.spacing.md,
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: appTheme.spacing.md,
  },
  sourceTextCol: {
    flex: 1,
    gap: appTheme.spacing.sm,
  },
});
