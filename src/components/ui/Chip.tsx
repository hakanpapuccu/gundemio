import { Pressable, StyleSheet, Text } from 'react-native';
import type { PressableProps } from 'react-native';

import { appTheme } from '../../theme';
import { Icon } from './Icon';
import type { IconName } from './Icon';

type ChipProps = Omit<PressableProps, 'style'> & {
  label: string;
  selected?: boolean;
  icon?: IconName;
};

export function Chip({ label, selected = false, icon, disabled, ...pressableProps }: ChipProps) {
  const isDisabled = Boolean(disabled);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.default,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      {...pressableProps}
    >
      {icon ? (
        <Icon
          color={selected ? appTheme.colors.white : appTheme.colors.chipText}
          name={icon}
          size={appTheme.sizes.iconSm}
        />
      ) : null}
      <Text numberOfLines={1} style={[styles.label, selected ? styles.selectedLabel : styles.defaultLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: appTheme.radii.full,
    flexDirection: 'row',
    gap: appTheme.spacing.xs,
    height: appTheme.sizes.chipHeight,
    justifyContent: 'center',
    paddingHorizontal: appTheme.spacing.lg,
  },
  default: {
    backgroundColor: appTheme.colors.chipBackground,
  },
  selected: {
    backgroundColor: appTheme.colors.primary,
  },
  label: {
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
    fontWeight: appTheme.typography.fontWeight.medium,
    maxWidth: 160,
  },
  defaultLabel: {
    color: appTheme.colors.chipText,
  },
  selectedLabel: {
    color: appTheme.colors.white,
    fontWeight: appTheme.typography.fontWeight.semiBold,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.5,
  },
});
