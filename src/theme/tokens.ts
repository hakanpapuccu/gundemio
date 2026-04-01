export const colors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  border: '#E2E8F0',
  accent: '#2563EB',
  danger: '#DC2626',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
} as const;

export const typography = {
  fontSize: {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  lineHeight: {
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
} as const;
