import { Pressable, StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../../theme';
import { Icon } from './Icon';
import type { IconName } from './Icon';

type TopAppBarAction = {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
};

type TopAppBarProps = {
  title: string;
  subtitle?: string;
  leftIcon?: IconName;
  onPressLeft?: () => void;
  rightActions?: TopAppBarAction[];
};

export function TopAppBar({
  title,
  subtitle,
  leftIcon,
  onPressLeft,
  rightActions,
}: TopAppBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sideSlot}>
        {leftIcon ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onPressLeft} style={styles.iconButton}>
            <Icon name={leftIcon} size={appTheme.sizes.iconLg} color={appTheme.colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.centerSlot}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.sideSlot, styles.rightActions]}>
        {rightActions?.map((action, index) => (
          <Pressable
            key={`${action.icon}-${index}`}
            accessibilityLabel={action.accessibilityLabel}
            accessibilityRole="button"
            hitSlop={8}
            onPress={action.onPress}
            style={styles.iconButton}
          >
            <Icon name={action.icon} size={appTheme.sizes.iconLg} color={appTheme.colors.textPrimary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    borderBottomColor: appTheme.colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 56,
    paddingHorizontal: appTheme.spacing.xs,
    paddingVertical: appTheme.spacing.sm,
  },
  sideSlot: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 44,
  },
  centerSlot: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: appTheme.spacing.sm,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xxl,
    fontWeight: appTheme.typography.fontWeight.bold,
    letterSpacing: appTheme.typography.letterSpacing.tight,
    lineHeight: appTheme.typography.lineHeight.xxl,
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  rightActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: appTheme.radii.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
