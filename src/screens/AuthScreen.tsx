import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { Button, ScreenContainer, TextField } from '../components/ui';

type AuthMode = 'signin' | 'signup';

export function AuthScreen({ navigation, route }: RootStackScreenProps<'Auth'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>(route.params?.mode ?? 'signin');

  const title = useMemo(() => (mode === 'signin' ? 'Hesabınla devam et' : 'Yeni hesap oluştur'), [mode]);

  return (
    <ScreenContainer contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.brand}>Gündemio</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Favorilerini senkronize et ve tercihlerini tüm cihazlarında koru.
          </Text>
        </View>

        <View style={styles.form}>
          <TextField
            keyboardType="email-address"
            label="E-posta"
            leftIcon="mail-outline"
            onChangeText={setEmail}
            placeholder="e-posta@ornek.com"
            value={email}
          />
          <TextField
            label="Şifre"
            leftIcon="lock-outline"
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            value={password}
          />
        </View>

        <View style={styles.actions}>
          <Button fullWidth label={mode === 'signin' ? 'Giriş Yap' : 'Kayıt Ol'} size="lg" />
          <Button
            fullWidth
            label={mode === 'signin' ? 'Kayıt ekranına geç' : 'Giriş ekranına geç'}
            onPress={() => setMode((current) => (current === 'signin' ? 'signup' : 'signin'))}
            size="lg"
            variant="secondary"
          />
          <Button
            fullWidth
            label="Misafir olarak devam et"
            onPress={() => navigation.replace('MainTabs')}
            size="md"
            variant="ghost"
          />
        </View>
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
  card: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.lg,
    borderWidth: 1,
    gap: appTheme.spacing.xl,
    padding: appTheme.spacing.xxl,
  },
  header: {
    gap: appTheme.spacing.sm,
  },
  brand: {
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xxl,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.xxl,
    textAlign: 'center',
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
  actions: {
    gap: appTheme.spacing.sm,
  },
});
