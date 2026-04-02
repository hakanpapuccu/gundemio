import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MainTabScreenProps } from '../navigation/types';
import { appTheme } from '../theme';
import { Button, Icon, ScreenContainer, TopAppBar } from '../components/ui';

type ProfileMenuItem = {
  key: string;
  label: string;
  icon: 'tag' | 'list-alt' | 'notifications' | 'shield' | 'info';
  onPress: () => void;
};

export function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const menuItems: ProfileMenuItem[] = [
    {
      key: 'interests',
      label: 'İlgi Alanlarım',
      icon: 'tag',
      onPress: () => navigation.navigate('Preferences'),
    },
    {
      key: 'sources',
      label: 'Kaynak Tercihlerim',
      icon: 'list-alt',
      onPress: () =>
        navigation.navigate('SourceDetail', {
          sourceId: 'preferred-sources',
          sourceName: 'Kaynak Tercihleri',
        }),
    },
    {
      key: 'notifications',
      label: 'Bildirimler',
      icon: 'notifications',
      onPress: () => navigation.navigate('Preferences'),
    },
    {
      key: 'privacy',
      label: 'Gizlilik ve Güvenlik',
      icon: 'shield',
      onPress: () => navigation.navigate('Preferences'),
    },
    {
      key: 'about',
      label: 'Uygulama Hakkında',
      icon: 'info',
      onPress: () => navigation.navigate('Preferences'),
    },
  ];

  return (
    <ScreenContainer>
      <TopAppBar title="Profil ve Ayarlar" />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Icon color={appTheme.colors.primary} name="person" size={40} />
        </View>
        <Text style={styles.name}>Misafir Kullanıcı</Text>
        <Text style={styles.badge}>Giriş yapılmadı</Text>
      </View>

      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <Pressable
            key={item.key}
            accessibilityRole="button"
            onPress={item.onPress}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIcon}>
                <Icon color={appTheme.colors.primary} name={item.icon} size={appTheme.sizes.iconLg} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Icon color={appTheme.colors.textMuted} name="chevron-right" size={appTheme.sizes.iconLg} />
          </Pressable>
        ))}
      </View>

      <View style={styles.authActions}>
        <Button
          fullWidth
          label="Giriş Yap"
          onPress={() => navigation.navigate('Auth', { mode: 'signin' })}
          size="lg"
        />
        <Button
          fullWidth
          label="Kayıt Ol"
          onPress={() => navigation.navigate('Auth', { mode: 'signup' })}
          size="lg"
          variant="secondary"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.lg,
    borderWidth: 1,
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: appTheme.spacing.xxl,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.primarySoft,
    borderRadius: appTheme.radii.full,
    height: 96,
    justifyContent: 'center',
    marginBottom: appTheme.spacing.md,
    width: 96,
  },
  name: {
    color: appTheme.colors.textPrimary,
    fontFamily: appTheme.typography.fontFamily.display,
    fontSize: appTheme.typography.fontSize.xxl,
    fontWeight: appTheme.typography.fontWeight.bold,
    lineHeight: appTheme.typography.lineHeight.xxl,
  },
  badge: {
    color: appTheme.colors.primary,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.sm,
    fontWeight: appTheme.typography.fontWeight.semiBold,
    lineHeight: appTheme.typography.lineHeight.sm,
    marginTop: appTheme.spacing.xs,
  },
  menuList: {
    backgroundColor: appTheme.colors.surface,
    borderColor: appTheme.colors.borderSoft,
    borderRadius: appTheme.radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    alignItems: 'center',
    borderBottomColor: appTheme.colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: appTheme.spacing.lg,
    paddingVertical: appTheme.spacing.md,
  },
  menuLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: appTheme.spacing.md,
  },
  menuIcon: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.primarySoft,
    borderRadius: appTheme.radii.md,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  menuLabel: {
    color: appTheme.colors.textPrimary,
    flex: 1,
    fontFamily: appTheme.typography.fontFamily.body,
    fontSize: appTheme.typography.fontSize.lg,
    fontWeight: appTheme.typography.fontWeight.medium,
    lineHeight: appTheme.typography.lineHeight.lg,
  },
  authActions: {
    gap: appTheme.spacing.md,
  },
});
