import { StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../../theme';
import { Button } from './Button';
import { Icon } from './Icon';
import type { IconName } from './Icon';

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: IconName;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function EmptyState({
  title,
  description,
  icon = 'folder-open',
  actionLabel,
  onPressAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon color={appTheme.colors.primary} name={icon} size={80} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel ? <Button label={actionLabel} onPress={onPressAction} size="lg" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: appTheme.spacing.md,
    paddingHorizontal: appTheme.spacing.xl,
    paddingVertical: appTheme.spacing.huge,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.primarySoft,
    borderRadius: appTheme.radii.full,
    height: 160,
    justifyContent: 'center',
    opacity: 0.9,
    width: 160,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xxl,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.xxl,
    textAlign: 'center',
  },
  description: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.lg,
    maxWidth: 280,
    textAlign: 'center',
  },
});
