import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { appTheme } from '../../theme';
import { Button } from './Button';
import { Icon } from './Icon';

type SourceCardProps = {
  name: string;
  description: string;
  imageUrl?: string | null;
  isFollowing?: boolean;
  onPress?: () => void;
  onToggleFollow?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SourceCard({
  name,
  description,
  imageUrl,
  isFollowing = false,
  onPress,
  onToggleFollow,
  style,
}: SourceCardProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.container, style]}>
      <View style={styles.infoRow}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Icon name="newspaper" size={appTheme.sizes.iconLg} color={appTheme.colors.textMuted} />
          </View>
        )}
        <View style={styles.textContent}>
          <Text numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          <Text numberOfLines={1} style={styles.description}>
            {description}
          </Text>
        </View>
      </View>

      <Button
        label={isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
        onPress={onToggleFollow}
        size="sm"
        variant={isFollowing ? 'secondary' : 'primary'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    borderBottomColor: appTheme.colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: appTheme.spacing.md,
    justifyContent: 'space-between',
    minHeight: 80,
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: appTheme.spacing.md,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: appTheme.spacing.md,
    minWidth: 0,
  },
  avatar: {
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.full,
    borderWidth: 1,
    height: appTheme.sizes.sourceAvatar,
    width: appTheme.sizes.sourceAvatar,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.surfaceMuted,
    justifyContent: 'center',
  },
  textContent: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.lg,
    fontWeight: appTheme.typography.fontWeight.semiBold,
    lineHeight: appTheme.typography.lineHeight.lg,
  },
  description: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
  },
});
