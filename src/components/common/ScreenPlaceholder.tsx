import { StyleSheet, Text, View } from 'react-native';

import { appTheme } from '../../theme';

type ScreenPlaceholderProps = {
  title: string;
  description: string;
};

export function ScreenPlaceholder({ title, description }: ScreenPlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
    padding: appTheme.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: appTheme.typography.fontSize.xl,
    lineHeight: appTheme.typography.lineHeight.xl,
    fontWeight: appTheme.typography.fontWeight.semiBold,
    color: appTheme.colors.textPrimary,
    marginBottom: appTheme.spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
    color: appTheme.colors.textSecondary,
    textAlign: 'center',
  },
});
