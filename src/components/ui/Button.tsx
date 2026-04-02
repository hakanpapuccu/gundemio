import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native';

import { appTheme } from '../../theme';
import { Icon } from './Icon';
import type { IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

const containerVariantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.primary,
  },
  secondary: {
    backgroundColor: appTheme.colors.white,
    borderColor: appTheme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: appTheme.colors.white,
    borderColor: '#FBCFE8',
  },
};

const textColorByVariant: Record<ButtonVariant, string> = {
  primary: appTheme.colors.white,
  secondary: appTheme.colors.primary,
  ghost: appTheme.colors.textSecondary,
  danger: appTheme.colors.danger,
};

const labelVariantStyles: Record<ButtonVariant, TextStyle> = {
  primary: {
    color: textColorByVariant.primary,
  },
  secondary: {
    color: textColorByVariant.secondary,
  },
  ghost: {
    color: textColorByVariant.ghost,
  },
  danger: {
    color: textColorByVariant.danger,
  },
};

const sizeContainerStyles: Record<ButtonSize, ViewStyle> = {
  sm: {
    minHeight: appTheme.sizes.buttonHeightSm,
    paddingHorizontal: appTheme.spacing.md,
    borderRadius: appTheme.radii.full,
  },
  md: {
    minHeight: appTheme.sizes.buttonHeightMd,
    paddingHorizontal: appTheme.spacing.lg,
    borderRadius: appTheme.radii.lg,
  },
  lg: {
    minHeight: appTheme.sizes.buttonHeightLg,
    paddingHorizontal: appTheme.spacing.xl,
    borderRadius: appTheme.radii.md,
  },
};

const sizeLabelStyles: Record<ButtonSize, TextStyle> = {
  sm: {
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  md: {
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  lg: {
    fontSize: appTheme.typography.fontSize.lg,
    lineHeight: appTheme.typography.lineHeight.lg,
  },
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...pressableProps
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  const iconColor = textColorByVariant[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        containerVariantStyles[variant],
        sizeContainerStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {leftIcon ? <Icon name={leftIcon} size={appTheme.sizes.iconSm} color={iconColor} /> : null}
          <Text
            numberOfLines={1}
            style={[styles.label, labelVariantStyles[variant], sizeLabelStyles[size], textStyle]}
          >
            {label}
          </Text>
          {rightIcon ? <Icon name={rightIcon} size={appTheme.sizes.iconSm} color={iconColor} /> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
    justifyContent: 'center',
  },
  label: {
    fontFamily: appTheme.typography.fontFamily.display,
    fontWeight: appTheme.typography.fontWeight.bold,
    letterSpacing: appTheme.typography.letterSpacing.normal,
    textAlign: 'center',
    flexShrink: 1,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
