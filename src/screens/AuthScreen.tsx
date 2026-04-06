import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { Button, Icon, ScreenContainer, TextField } from '../components/ui';
import { useSession } from '../hooks/useSession';

type AuthMode = 'signin' | 'signup';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthScreen({ navigation, route }: RootStackScreenProps<'Auth'>) {
  const [mode, setMode] = useState<AuthMode>(route.params?.mode ?? 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const {
    isAuthenticated,
    hasSupabaseAuth,
    errorMessage,
    signIn,
    signUp,
    continueAsGuest,
    resetPassword,
  } = useSession();

  useEffect(() => {
    const nextMode = route.params?.mode ?? 'signin';
    setMode(nextMode);
  }, [route.params?.mode]);

  useEffect(() => {
    if (isAuthenticated) {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return;
      }

      navigation.replace('MainTabs');
    }
  }, [isAuthenticated, navigation]);

  const title = useMemo(
    () => (mode === 'signin' ? 'Hesabinla devam et' : 'Yeni hesap olustur'),
    [mode]
  );

  const subtitle = useMemo(
    () =>
      mode === 'signin'
        ? 'Favorilerini senkronize et ve tercihlerini kaydet.'
        : 'Hesap olusturarak tercihlerine tum cihazlardan ulas.',
    [mode]
  );

  const formError = useMemo(() => {
    if (!hasSupabaseAuth) {
      return 'Supabase baglantisi yok. Misafir modu ile devam edebilirsin.';
    }

    return errorMessage;
  }, [errorMessage, hasSupabaseAuth]);

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    setFeedbackMessage(null);

    if (!validateEmail(normalizedEmail)) {
      Alert.alert('Gecersiz e-posta', 'Lutfen gecerli bir e-posta adresi gir.');
      return;
    }

    if (normalizedPassword.length < 6) {
      Alert.alert('Gecersiz sifre', 'Sifre en az 6 karakter olmali.');
      return;
    }

    setIsSubmitting(true);
    const result =
      mode === 'signin'
        ? await signIn({ email: normalizedEmail, password: normalizedPassword })
        : await signUp({ email: normalizedEmail, password: normalizedPassword });
    setIsSubmitting(false);

    if (!result.ok) {
      return;
    }

    if (result.requiresEmailConfirmation && result.message) {
      setFeedbackMessage(result.message);
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.replace('MainTabs');
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!validateEmail(normalizedEmail)) {
      Alert.alert('E-posta gerekli', 'Sifre sifirlama icin once gecerli bir e-posta gir.');
      return;
    }

    const result = await resetPassword(normalizedEmail);
    if (result.ok && result.message) {
      setFeedbackMessage(result.message);
      return;
    }

    if (!result.ok && result.message) {
      Alert.alert('Islem tamamlanamadi', result.message);
    }
  };

  const handleContinueAsGuest = () => {
    continueAsGuest();

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.replace('MainTabs');
  };

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.brandHeader}>
        <Text style={styles.brandTitle}>Gundemio</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.form}>
          <TextField
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            label="E-posta"
            onChangeText={setEmail}
            placeholder="e-posta@ornek.com"
            value={email}
          />
          <View style={styles.passwordHeader}>
            <Text style={styles.fieldLabel}>Sifre</Text>
            <Pressable accessibilityRole="button" onPress={() => void handleForgotPassword()}>
              <Text style={styles.forgotPassword}>Sifremi unuttum</Text>
            </Pressable>
          </View>
          <TextField
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setPassword}
            placeholder="********"
            rightIcon={isPasswordVisible ? 'visibility-off' : 'visibility'}
            onPressRightIcon={() => setIsPasswordVisible((current) => !current)}
            secureTextEntry={!isPasswordVisible}
            value={password}
          />
        </View>

        {feedbackMessage ? <Text style={styles.feedbackText}>{feedbackMessage}</Text> : null}
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <View style={styles.actions}>
          <Button
            fullWidth
            label={mode === 'signin' ? 'Giris Yap' : 'Kayit Ol'}
            loading={isSubmitting}
            onPress={() => void handleSubmit()}
            size="lg"
          />
          <Button
            fullWidth
            label={mode === 'signin' ? 'Kayit Ol' : 'Giris Yap'}
            onPress={() => {
              setFeedbackMessage(null);
              setMode((current) => (current === 'signin' ? 'signup' : 'signin'));
            }}
            size="lg"
            variant="secondary"
          />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerLabel}>veya</Text>
          <View style={styles.divider} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleContinueAsGuest}
          style={({ pressed }) => [styles.guestButton, pressed && styles.guestButtonPressed]}
        >
          <Icon color={appTheme.colors.textMuted} name="person-outline" size={appTheme.sizes.iconMd} />
          <Text style={styles.guestButtonLabel}>Misafir olarak devam et</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Gizlilik Politikasi</Text>
        <Text style={styles.footerDot}>|</Text>
        <Text style={styles.footerText}>Kullanim Kosullari</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: appTheme.spacing.lg,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: appTheme.spacing.xxxl,
  },
  brandTitle: {
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.display,
    fontWeight: appTheme.typography.fontWeight.bold,
    letterSpacing: appTheme.typography.letterSpacing.tight,
    lineHeight: appTheme.typography.lineHeight.display,
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.xl,
    borderWidth: 1,
    gap: appTheme.spacing.lg,
    padding: appTheme.spacing.xxl,
    ...appTheme.shadows.card,
  },
  header: {
    gap: appTheme.spacing.sm,
  },
  title: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xxl,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.xxl,
    textAlign: 'center',
  },
  subtitle: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
    textAlign: 'center',
  },
  form: {
    gap: appTheme.spacing.md,
  },
  passwordHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -appTheme.spacing.sm,
  },
  fieldLabel: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    fontWeight: appTheme.typography.fontWeight.medium,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  forgotPassword: {
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    fontWeight: appTheme.typography.fontWeight.semiBold,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  feedbackText: {
    color: appTheme.colors.success,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  errorText: {
    color: appTheme.colors.danger,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  actions: {
    gap: appTheme.spacing.sm,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: appTheme.spacing.md,
  },
  divider: {
    backgroundColor: appTheme.colors.border,
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    color: appTheme.colors.textMuted,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  guestButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: appTheme.spacing.xs,
    justifyContent: 'center',
    minHeight: 40,
  },
  guestButtonPressed: {
    opacity: 0.72,
  },
  guestButtonLabel: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    fontWeight: appTheme.typography.fontWeight.medium,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: appTheme.spacing.sm,
    justifyContent: 'center',
    marginTop: appTheme.spacing.xxl,
  },
  footerText: {
    color: appTheme.colors.textMuted,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  footerDot: {
    color: appTheme.colors.textMuted,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
});
