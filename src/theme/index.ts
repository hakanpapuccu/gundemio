import type { Theme } from '@react-navigation/native';
import { DefaultTheme } from '@react-navigation/native';

import { colors, radii, spacing, typography } from './tokens';

export const appTheme = {
  colors,
  spacing,
  radii,
  typography,
} as const;

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: appTheme.colors.background,
    card: appTheme.colors.surface,
    border: appTheme.colors.border,
    primary: appTheme.colors.accent,
    text: appTheme.colors.textPrimary,
    notification: appTheme.colors.danger,
  },
};

export type AppTheme = typeof appTheme;
