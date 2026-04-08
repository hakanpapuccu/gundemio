import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { Icon } from '../components/ui';

const SPLASH_DURATION_MS = 1500;

export function SplashIntroScreen({ navigation }: RootStackScreenProps<'SplashIntro'>) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigation.replace('Onboarding');
    }, SPLASH_DURATION_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [navigation]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.logoWrap}>
        <Icon color={appTheme.colors.primary} name="newspaper" size={44} />
        <View style={styles.badgeWrap}>
          <Icon color={appTheme.colors.white} name="link" size={14} />
        </View>
      </View>

      <View style={styles.brandBlock}>
        <Text style={styles.brandTitle}>Gündemio</Text>
        <Text style={styles.brandSubtitle}>HABERİN DİJİTAL MERKEZİ</Text>
      </View>

      <View style={styles.bottomBlock}>
        <Text style={styles.loadingText}>Gündem güncelleniyor...</Text>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.background,
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: appTheme.spacing.xxl,
    paddingTop: 120,
    paddingBottom: appTheme.spacing.xxxl,
  },
  logoWrap: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.lg,
    borderWidth: 1,
    height: 96,
    justifyContent: 'center',
    marginTop: appTheme.spacing.xxxl,
    width: 96,
  },
  badgeWrap: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.primary,
    borderColor: appTheme.colors.background,
    borderRadius: appTheme.radii.sm,
    borderWidth: 2,
    bottom: -6,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    width: 24,
  },
  brandBlock: {
    alignItems: 'center',
    gap: appTheme.spacing.xs,
    marginTop: appTheme.spacing.xxl,
  },
  brandTitle: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: 48,
    fontWeight: appTheme.typography.fontWeight.bold,
    letterSpacing: appTheme.typography.letterSpacing.tight,
    lineHeight: 52,
  },
  brandSubtitle: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.xs,
    fontWeight: appTheme.typography.fontWeight.bold,
    letterSpacing: 2.4,
    lineHeight: appTheme.typography.lineHeight.xs,
  },
  bottomBlock: {
    gap: appTheme.spacing.sm,
    width: '100%',
  },
  loadingText: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  progressTrack: {
    backgroundColor: appTheme.colors.border,
    borderRadius: appTheme.radii.full,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: appTheme.colors.primary,
    borderRadius: appTheme.radii.full,
    height: 6,
    width: '56%',
  },
});
