import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  primary: '#EC5B13',
  primaryPressed: '#D34F0F',
  primarySoft: '#FDECDD',
  background: '#F8F6F6',
  surface: '#FFFFFF',
  surfaceMuted: '#F9FAFB',
  textPrimary: '#221610',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderSoft: '#F1F5F9',
  chipBackground: '#F3F4F6',
  chipText: '#4B5563',
  tabInactive: '#9CA3AF',
  danger: '#E11D48',
  success: '#16A34A',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  fontFamily: {
    display: 'sans-serif',
    body: 'sans-serif',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    display: 32,
  },
  lineHeight: {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 26,
    xxl: 30,
    display: 38,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  } as Record<string, TextStyle['fontWeight']>,
  letterSpacing: {
    tight: -0.2,
    normal: 0,
    wide: 0.2,
    wider: 0.8,
  },
} as const;

export const shadows = {
  none: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  floating: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
} as const satisfies Record<string, ViewStyle>;

export const sizes = {
  iconSm: 18,
  iconMd: 20,
  iconLg: 24,
  iconXl: 28,
  inputHeight: 48,
  chipHeight: 36,
  buttonHeightSm: 36,
  buttonHeightMd: 44,
  buttonHeightLg: 48,
  tabBarHeight: 68,
  articleThumb: 96,
  sourceAvatar: 56,
} as const;
