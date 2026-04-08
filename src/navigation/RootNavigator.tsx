import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { MainTabParamList, RootStackParamList } from './types';
import { getBottomTabScreenOptions } from './tabBarStyles';
import { HomeScreen } from '../screens/HomeScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ArticleDetailScreen } from '../screens/ArticleDetailScreen';
import { SourceDetailScreen } from '../screens/SourceDetailScreen';
import { SourcesScreen } from '../screens/SourcesScreen';
import { PreferencesScreen } from '../screens/PreferencesScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { ProfileEditScreen } from '../screens/ProfileEditScreen';
import { SplashIntroScreen } from '../screens/SplashIntroScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { hasCompletedOnboarding } from '../services/app/onboardingService';
import { appTheme, navigationTheme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
type LaunchState = 'checking' | 'firstLaunch' | 'ready';

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => getBottomTabScreenOptions(route.name)}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Anasayfa' }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ title: 'Kategoriler' }}
      />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Keşfet' }} />
      <Tab.Screen name="Saved" component={SavedScreen} options={{ title: 'Kaydedilenler' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const [launchState, setLaunchState] = useState<LaunchState>('checking');

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const completed = await hasCompletedOnboarding();
      if (!isMounted) {
        return;
      }

      setLaunchState(completed ? 'ready' : 'firstLaunch');
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <NavigationContainer theme={navigationTheme}>
      {launchState === 'checking' ? (
        <View style={styles.bootstrapScreen}>
          <ActivityIndicator color={appTheme.colors.primary} size="small" />
        </View>
      ) : (
      <Stack.Navigator
        initialRouteName={launchState === 'firstLaunch' ? 'SplashIntro' : 'MainTabs'}
        screenOptions={{
          headerStyle: {
            backgroundColor: appTheme.colors.surface,
          },
          headerShadowVisible: false,
          headerTintColor: appTheme.colors.textPrimary,
          headerTitleStyle: {
            color: appTheme.colors.textPrimary,
            fontFamily: appTheme.typography.fontFamily.display,
            fontSize: appTheme.typography.fontSize.lg,
            fontWeight: appTheme.typography.fontWeight.bold,
          },
        }}
      >
        <Stack.Screen
          name="SplashIntro"
          component={SplashIntroScreen}
          options={{ animation: 'none', headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade', headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="ArticleDetail"
          component={ArticleDetailScreen}
          options={({ route }) => ({
            title: route.params.title ?? 'Haber Detayı',
          })}
        />
        <Stack.Screen
          name="SourceDetail"
          component={SourceDetailScreen}
          options={({ route }) => ({
            title: route.params.sourceName ?? 'Kaynak Detayı',
          })}
        />
        <Stack.Screen
          name="Sources"
          component={SourcesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Preferences"
          component={PreferencesScreen}
          options={{ title: 'Tercihler' }}
        />
        <Stack.Screen
          name="ProfileEdit"
          component={ProfileEditScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            presentation: 'modal',
            title: 'Giriş / Kayıt',
          }}
        />
      </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bootstrapScreen: {
    alignItems: 'center',
    backgroundColor: appTheme.colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
