import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { RootStackScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { Button, ScreenContainer, TextField, TopAppBar } from '../components/ui';
import { useSession } from '../hooks/useSession';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ProfileEditScreen({ navigation }: RootStackScreenProps<'ProfileEdit'>) {
  const {
    isAuthenticated,
    profile,
    hasSupabaseAuth,
    updateProfile,
    updatePassword,
  } = useSession();

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [email, setEmail] = useState(profile.email ?? '');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [passwordFeedbackMessage, setPasswordFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    setDisplayName(profile.displayName);
    setEmail(profile.email ?? '');
  }, [profile.displayName, profile.email]);

  const hasChanges = useMemo(() => {
    const currentEmail = profile.email ?? '';
    return displayName.trim() !== profile.displayName || email.trim() !== currentEmail;
  }, [displayName, email, profile.displayName, profile.email]);

  const hasPasswordInputs = useMemo(
    () =>
      currentPassword.trim().length > 0 ||
      newPassword.trim().length > 0 ||
      confirmNewPassword.trim().length > 0,
    [confirmNewPassword, currentPassword, newPassword]
  );

  const handleSave = async () => {
    if (!isAuthenticated) {
      Alert.alert('Giris gerekli', 'Profil duzenlemek icin once giris yap.');
      return;
    }

    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      Alert.alert('Gecersiz ad', 'Ad en az 2 karakter olmali.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Gecersiz e-posta', 'Lutfen gecerli bir e-posta adresi gir.');
      return;
    }

    setIsSubmitting(true);
    const result = await updateProfile({
      displayName: trimmedName,
      email: trimmedEmail,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      Alert.alert('Profil guncellenemedi', result.message ?? 'Bilinmeyen hata');
      return;
    }

    setFeedbackMessage(result.message ?? 'Profil bilgileri guncellendi.');
  };

  const handlePasswordUpdate = async () => {
    const normalizedCurrentPassword = currentPassword.trim();
    const normalizedNewPassword = newPassword.trim();
    const normalizedConfirmPassword = confirmNewPassword.trim();

    if (normalizedCurrentPassword.length === 0) {
      Alert.alert('Eksik bilgi', 'Mevcut sifreni gir.');
      return;
    }

    if (normalizedNewPassword.length < 6) {
      Alert.alert('Gecersiz sifre', 'Yeni sifre en az 6 karakter olmali.');
      return;
    }

    if (normalizedNewPassword !== normalizedConfirmPassword) {
      Alert.alert('Eslesme hatasi', 'Yeni sifre ve tekrar ayni olmali.');
      return;
    }

    if (normalizedCurrentPassword === normalizedNewPassword) {
      Alert.alert('Gecersiz sifre', 'Yeni sifre mevcut sifreden farkli olmali.');
      return;
    }

    setIsChangingPassword(true);
    const result = await updatePassword({
      currentPassword: normalizedCurrentPassword,
      newPassword: normalizedNewPassword,
    });
    setIsChangingPassword(false);

    if (!result.ok) {
      Alert.alert('Sifre guncellenemedi', result.message ?? 'Bilinmeyen hata');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordFeedbackMessage(result.message ?? 'Sifre guncellendi.');
  };

  if (!isAuthenticated) {
    return (
      <ScreenContainer>
        <TopAppBar
          leftIcon="arrow-back"
          onPressLeft={() => navigation.goBack()}
          title="Profili Duzenle"
        />
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Misafir modu</Text>
          <Text style={styles.noticeText}>
            Profil bilgilerini duzenlemek icin bir hesapla giris yapmalisin.
          </Text>
          <Button
            fullWidth
            label="Giris Yap"
            onPress={() => navigation.navigate('Auth', { mode: 'signin' })}
            size="lg"
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable>
      <TopAppBar
        leftIcon="arrow-back"
        onPressLeft={() => navigation.goBack()}
        title="Profili Duzenle"
      />

      {!hasSupabaseAuth ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            Supabase baglantisi kapali oldugu icin profil degisiklikleri sunucuya gonderilemez.
          </Text>
        </View>
      ) : null}

      <View style={styles.formCard}>
        <TextField
          label="Ad Soyad"
          onChangeText={setDisplayName}
          placeholder="Ad Soyad"
          value={displayName}
        />
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          label="E-posta"
          onChangeText={setEmail}
          placeholder="e-posta@ornek.com"
          value={email}
        />
      </View>

      {feedbackMessage ? <Text style={styles.feedbackText}>{feedbackMessage}</Text> : null}

      <Button
        disabled={!hasChanges || isSubmitting}
        fullWidth
        label="Kaydet"
        loading={isSubmitting}
        onPress={() => void handleSave()}
        size="lg"
      />

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Sifreyi Guncelle</Text>
        <Text style={styles.sectionDescription}>
          Guvenlik icin once mevcut sifreni, sonra yeni sifreni gir.
        </Text>

        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          label="Mevcut Sifre"
          onChangeText={setCurrentPassword}
          placeholder="********"
          rightIcon={isCurrentPasswordVisible ? 'visibility-off' : 'visibility'}
          onPressRightIcon={() => setIsCurrentPasswordVisible((current) => !current)}
          secureTextEntry={!isCurrentPasswordVisible}
          value={currentPassword}
        />
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          label="Yeni Sifre"
          onChangeText={setNewPassword}
          placeholder="********"
          rightIcon={isNewPasswordVisible ? 'visibility-off' : 'visibility'}
          onPressRightIcon={() => setIsNewPasswordVisible((current) => !current)}
          secureTextEntry={!isNewPasswordVisible}
          value={newPassword}
        />
        <TextField
          autoCapitalize="none"
          autoCorrect={false}
          label="Yeni Sifre (Tekrar)"
          onChangeText={setConfirmNewPassword}
          placeholder="********"
          rightIcon={isConfirmPasswordVisible ? 'visibility-off' : 'visibility'}
          onPressRightIcon={() => setIsConfirmPasswordVisible((current) => !current)}
          secureTextEntry={!isConfirmPasswordVisible}
          value={confirmNewPassword}
        />
      </View>

      {passwordFeedbackMessage ? (
        <Text style={styles.feedbackText}>{passwordFeedbackMessage}</Text>
      ) : null}

      <Button
        disabled={!hasPasswordInputs || isChangingPassword}
        fullWidth
        label="Sifreyi Guncelle"
        loading={isChangingPassword}
        onPress={() => void handlePasswordUpdate()}
        size="lg"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  noticeCard: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.lg,
    borderWidth: 1,
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.xl,
  },
  noticeTitle: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xl,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.xl,
  },
  noticeText: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.md,
    lineHeight: appTheme.typography.lineHeight.md,
  },
  warningCard: {
    backgroundColor: appTheme.colors.primarySoft,
    borderRadius: appTheme.radii.md,
    padding: appTheme.spacing.md,
  },
  warningText: {
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  formCard: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radii.lg,
    borderWidth: 1,
    gap: appTheme.spacing.md,
    padding: appTheme.spacing.xl,
  },
  feedbackText: {
    color: appTheme.colors.success,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
  sectionTitle: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.lg,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.lg,
  },
  sectionDescription: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
  },
});
