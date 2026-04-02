import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appTheme } from '../../theme';

type ScreenContainerProps = PropsWithChildren<{
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  withHorizontalPadding?: boolean;
}>;

export function ScreenContainer({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  withHorizontalPadding = true,
}: ScreenContainerProps) {
  const contentStyle = [
    styles.content,
    withHorizontalPadding && styles.padded,
    contentContainerStyle,
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, style]}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: appTheme.colors.background,
    flex: 1,
  },
  content: {
    gap: appTheme.spacing.lg,
    paddingBottom: appTheme.spacing.xxxl,
  },
  padded: {
    paddingHorizontal: appTheme.spacing.lg,
  },
});
