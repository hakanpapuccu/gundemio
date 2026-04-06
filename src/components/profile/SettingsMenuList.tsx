import { Pressable, StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../../theme';
import { Icon } from '../ui';
import type { IconName } from '../ui/Icon';

export type SettingsMenuItem = {
  key: string;
  label: string;
  icon: IconName;
  trailing?: 'chevron' | 'switch';
  switchValue?: boolean;
  onPress: () => void;
};

type SettingsMenuListProps = {
  items: SettingsMenuItem[];
};

export function SettingsMenuList({ items }: SettingsMenuListProps) {
  return (
    <View style={styles.menuList}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="button"
          onPress={item.onPress}
          style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
        >
          <View style={styles.menuLeft}>
            <View style={styles.menuIcon}>
              <Icon color={appTheme.colors.primary} name={item.icon} size={appTheme.sizes.iconLg} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </View>

          {item.trailing === 'switch' ? (
            <View style={[styles.switchTrack, item.switchValue && styles.switchTrackActive]}>
              <View style={[styles.switchThumb, item.switchValue && styles.switchThumbActive]} />
            </View>
          ) : (
            <Icon
              color={appTheme.colors.textMuted}
              name="chevron-right"
              size={appTheme.sizes.iconLg}
            />
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menuList: {
    backgroundColor: appTheme.colors.surface,
  },
  menuItem: {
    alignItems: 'center',
    borderBottomColor: appTheme.colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: appTheme.spacing.md,
  },
  menuItemPressed: {
    backgroundColor: appTheme.colors.surfaceMuted,
  },
  menuLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: appTheme.spacing.md,
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.primarySoft,
    borderRadius: appTheme.radii.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  menuLabel: {
    color: appTheme.colors.textPrimary,
    flex: 1,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.lg,
    fontWeight: appTheme.typography.fontWeight.medium,
    lineHeight: appTheme.typography.lineHeight.lg,
  },
  switchTrack: {
    backgroundColor: '#E2E8F0',
    borderRadius: appTheme.radii.full,
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 2,
    width: 44,
  },
  switchTrackActive: {
    backgroundColor: '#F9D6BF',
  },
  switchThumb: {
    backgroundColor: appTheme.colors.white,
    borderRadius: appTheme.radii.full,
    height: 18,
    width: 18,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: appTheme.colors.primary,
  },
});
