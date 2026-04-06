import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { Button, ScreenContainer, TopAppBar } from '../components/ui';
import { useSession } from '../hooks/useSession';
import {
  SettingsMenuList,
  type SettingsMenuItem,
} from '../components/profile/SettingsMenuList';
import { ProfileSummaryCard } from '../components/profile/ProfileSummaryCard';

function showPlaceholderAlert() {
  Alert.alert(
    'Yakinda aktif olacak',
    'Bu ayar su an tasarima uygun placeholder olarak acik. Backend baglantisi hazir oldugunda etkinlestirilecek.'
  );
}

export function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();
  const {
    isAuthenticated,
    profile,
    errorMessage,
    signOut,
  } = useSession();

  const statusLabel = isAuthenticated ? 'Giris Yapmis Kullanici' : 'Giris Yapilmadi';
  const displayName = profile.displayName || 'Misafir Kullanici';

  const menuItems = useMemo<SettingsMenuItem[]>(
    () => [
      {
        key: 'profile-edit',
        label: 'Profili Duzenle',
        icon: 'edit',
        trailing: 'chevron',
        onPress: () => navigation.navigate('ProfileEdit'),
      },
      {
        key: 'interests',
        label: 'Ilgi Alanlarim',
        icon: 'tag',
        trailing: 'chevron',
        onPress: () => navigation.navigate('Preferences'),
      },
      {
        key: 'sources',
        label: 'Kaynak Tercihlerim',
        icon: 'list-alt',
        trailing: 'chevron',
        onPress: () => navigation.navigate('Sources'),
      },
      {
        key: 'theme',
        label: 'Koyu Tema',
        icon: 'dark-mode',
        trailing: 'switch',
        switchValue: isDarkModeEnabled,
        onPress: () => {
          setIsDarkModeEnabled((current) => !current);
          showPlaceholderAlert();
        },
      },
      {
        key: 'notifications',
        label: 'Bildirimler',
        icon: 'notifications',
        trailing: 'chevron',
        onPress: showPlaceholderAlert,
      },
      {
        key: 'privacy',
        label: 'Gizlilik ve Guvenlik',
        icon: 'shield',
        trailing: 'chevron',
        onPress: showPlaceholderAlert,
      },
      {
        key: 'about',
        label: 'Uygulama Hakkinda',
        icon: 'info',
        trailing: 'chevron',
        onPress: showPlaceholderAlert,
      },
    ],
    [isDarkModeEnabled, navigation]
  );

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.ok && result.message) {
      Alert.alert('Cikis yapilamadi', result.message);
      return;
    }

    if (result.message) {
      Alert.alert('Cikis', result.message);
    }
  };

  return (
    <ScreenContainer
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: tabBarHeight + appTheme.spacing.xxl },
      ]}
      scrollable
      style={styles.container}
      withHorizontalPadding={false}
    >
      <TopAppBar title="Profil ve Ayarlar" />

      <ProfileSummaryCard
        displayName={displayName}
        email={isAuthenticated ? profile.email : null}
        statusLabel={statusLabel}
      />

      <SettingsMenuList items={menuItems} />

      <View style={styles.actionSection}>
        {isAuthenticated ? (
          <Button
            fullWidth
            label="Cikis Yap"
            leftIcon="logout"
            onPress={() => void handleSignOut()}
            size="lg"
            variant="danger"
          />
        ) : (
          <>
            <Button
              fullWidth
              label="Giris Yap"
              onPress={() => navigation.navigate('Auth', { mode: 'signin' })}
              size="lg"
            />
            <Button
              fullWidth
              label="Kayit Ol"
              onPress={() => navigation.navigate('Auth', { mode: 'signup' })}
              size="lg"
              variant="secondary"
            />
          </>
        )}
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.versionSection}>
        <Text style={styles.versionText}>Gundemio v2.4.0 (Build 842)</Text>
        <Text style={styles.versionSubtext}>Proudly made for news junkies</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: appTheme.colors.background,
  },
  contentContainer: {
    paddingBottom: appTheme.spacing.xxxl,
  },
  actionSection: {
    gap: appTheme.spacing.md,
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.lg,
  },
  errorText: {
    color: appTheme.colors.danger,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    lineHeight: appTheme.typography.lineHeight.sm,
    paddingHorizontal: appTheme.spacing.lg,
  },
  versionSection: {
    alignItems: 'center',
    gap: appTheme.spacing.xs,
    opacity: 0.45,
    paddingHorizontal: appTheme.spacing.lg,
    paddingTop: appTheme.spacing.lg,
  },
  versionText: {
    color: appTheme.colors.textSecondary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.xs,
    fontWeight: appTheme.typography.fontWeight.medium,
    letterSpacing: appTheme.typography.letterSpacing.normal,
    lineHeight: appTheme.typography.lineHeight.xs,
  },
  versionSubtext: {
    color: appTheme.colors.textMuted,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: 10,
    letterSpacing: appTheme.typography.letterSpacing.wider,
    lineHeight: 12,
    textTransform: 'uppercase',
  },
});
