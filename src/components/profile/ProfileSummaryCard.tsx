import { StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../../theme';
import { Icon } from '../ui';

type ProfileSummaryCardProps = {
  displayName: string;
  statusLabel: string;
  email?: string | null;
};

function createInitial(displayName: string) {
  const trimmed = displayName.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return trimmed.charAt(0).toLocaleUpperCase('tr');
}

export function ProfileSummaryCard({
  displayName,
  statusLabel,
  email,
}: ProfileSummaryCardProps) {
  const initial = createInitial(displayName);

  return (
    <View style={styles.profileCard}>
      <View style={styles.avatar}>
        {initial ? (
          <Text style={styles.avatarInitial}>{initial}</Text>
        ) : (
          <Icon color={appTheme.colors.primary} name="person" size={40} />
        )}
      </View>
      <Text style={styles.name}>{displayName}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeLabel}>{statusLabel}</Text>
      </View>
      {email ? <Text style={styles.email}>{email}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    borderBottomColor: appTheme.colors.borderSoft,
    borderBottomWidth: 1,
    borderTopColor: appTheme.colors.borderSoft,
    borderTopWidth: 1,
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: appTheme.spacing.xxl,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.primarySoft,
    borderColor: '#F9D6BF',
    borderRadius: appTheme.radii.full,
    borderWidth: 2,
    height: 104,
    justifyContent: 'center',
    marginBottom: appTheme.spacing.md,
    width: 104,
  },
  avatarInitial: {
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: 40,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: 44,
  },
  name: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xxl,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.xxl,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: appTheme.colors.primarySoft,
    borderRadius: appTheme.radii.full,
    marginTop: appTheme.spacing.sm,
    paddingHorizontal: appTheme.spacing.md,
    paddingVertical: appTheme.spacing.xs,
  },
  badgeLabel: {
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    fontWeight: appTheme.typography.fontWeight.semiBold,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  email: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
    marginTop: appTheme.spacing.xs,
  },
});
