import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';

import { appTheme } from '../../theme';
import { Icon } from './Icon';
import type { IconName } from './Icon';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  errorText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onPressRightIcon?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function TextField({
  label,
  errorText,
  leftIcon,
  rightIcon,
  onPressRightIcon,
  containerStyle,
  inputStyle,
  editable = true,
  ...inputProps
}: TextFieldProps) {
  const hasError = Boolean(errorText);

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          hasError && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
      >
        {leftIcon ? <Icon name={leftIcon} size={appTheme.sizes.iconLg} color={appTheme.colors.textMuted} /> : null}
        <TextInput
          editable={editable}
          placeholderTextColor={appTheme.colors.textMuted}
          style={[styles.input, inputStyle]}
          {...inputProps}
        />
        {rightIcon ? (
          <Pressable
            accessibilityRole="button"
            disabled={!onPressRightIcon}
            hitSlop={8}
            onPress={onPressRightIcon}
            style={styles.rightAction}
          >
            <Icon name={rightIcon} size={appTheme.sizes.iconLg} color={appTheme.colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>
      {hasError ? <Text style={styles.errorText}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    fontWeight: appTheme.typography.fontWeight.medium,
    lineHeight: appTheme.typography.lineHeight.sm,
    marginBottom: appTheme.spacing.xs,
  },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
    minHeight: appTheme.sizes.inputHeight,
    paddingHorizontal: appTheme.spacing.md,
  },
  inputError: {
    borderColor: appTheme.colors.danger,
  },
  inputDisabled: {
    backgroundColor: appTheme.colors.surfaceMuted,
  },
  input: {
    color: appTheme.colors.textPrimary,
    flex: 1,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.lg,
    lineHeight: appTheme.typography.lineHeight.lg,
    minWidth: 0,
    paddingVertical: appTheme.spacing.sm,
  },
  rightAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: appTheme.colors.danger,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
    marginTop: appTheme.spacing.xs,
  },
});
