import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { Button, Icon } from '../components/ui';
import { markOnboardingCompleted } from '../services/app/onboardingService';

type OnboardingStep = {
  title: string;
  description: string;
  icon: 'newspaper' | 'tune' | 'bookmarks';
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Tüm haber kaynakları tek yerde',
    description: 'Yüzlerce güvenilir kaynaktan gelen haberleri tek bir akışta toplayın.',
    icon: 'newspaper',
  },
  {
    title: 'İlgi alanına göre filtrele',
    description: 'Sadece sizin için önemli olan konuları takip edin.',
    icon: 'tune',
  },
  {
    title: 'Kaydet, sonra oku',
    description: 'İlginizi çeken haberleri favorilere ekleyin ve daha sonra kolayca bulun.',
    icon: 'bookmarks',
  },
];

export function OnboardingScreen({ navigation }: RootStackScreenProps<'Onboarding'>) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = ONBOARDING_STEPS[stepIndex]!;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === ONBOARDING_STEPS.length - 1;

  const primaryLabel = useMemo(() => (isLastStep ? 'Başla' : 'Sonraki'), [isLastStep]);

  const completeOnboarding = async () => {
    await markOnboardingCompleted();
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        {!isFirstStep ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setStepIndex((current) => Math.max(0, current - 1))}
            style={styles.navButton}
          >
            <Icon color={appTheme.colors.textPrimary} name="arrow-back" size={appTheme.sizes.iconLg} />
          </Pressable>
        ) : (
          <View style={styles.navButtonPlaceholder} />
        )}

        <Pressable accessibilityRole="button" hitSlop={8} onPress={() => void completeOnboarding()}>
          <Text style={styles.skipText}>Atla</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationWrap}>
          <View style={styles.illustrationCircle}>
            <Icon color={appTheme.colors.primary} name={step.icon} size={72} />
          </View>
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {ONBOARDING_STEPS.map((item, index) => {
            const active = index === stepIndex;
            return (
              <View
                key={item.title}
                style={[styles.dot, active && styles.dotActive, active && styles.dotLong]}
              />
            );
          })}
        </View>

        <Button
          fullWidth
          label={primaryLabel}
          onPress={() => {
            if (isLastStep) {
              void completeOnboarding();
              return;
            }
            setStepIndex((current) => Math.min(ONBOARDING_STEPS.length - 1, current + 1));
          }}
          rightIcon={!isLastStep ? 'arrow-forward' : undefined}
          size="lg"
        />

        {isLastStep ? (
          <Button
            fullWidth
            label="Misafir olarak devam et"
            onPress={() => {
              void completeOnboarding();
            }}
            size="lg"
            variant="ghost"
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.background,
    flex: 1,
    paddingHorizontal: appTheme.spacing.xl,
    paddingTop: appTheme.spacing.lg,
    paddingBottom: appTheme.spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  navButton: {
    alignItems: 'center',
    borderRadius: appTheme.radii.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  navButtonPlaceholder: {
    width: 36,
  },
  skipText: {
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    fontWeight: appTheme.typography.fontWeight.semiBold,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  illustrationWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: appTheme.spacing.xxxl,
  },
  illustrationCircle: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.primarySoft,
    borderRadius: 999,
    height: 220,
    justifyContent: 'center',
    width: 220,
  },
  textBlock: {
    alignItems: 'center',
    gap: appTheme.spacing.md,
    paddingHorizontal: appTheme.spacing.md,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: 32,
    fontWeight: appTheme.typography.fontWeight.bold,
    letterSpacing: appTheme.typography.letterSpacing.tight,
    lineHeight: 38,
    textAlign: 'center',
  },
  description: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.lg,
    textAlign: 'center',
  },
  footer: {
    gap: appTheme.spacing.md,
  },
  dotsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: appTheme.colors.border,
    borderRadius: appTheme.radii.full,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: appTheme.colors.primary,
  },
  dotLong: {
    width: 24,
  },
});
