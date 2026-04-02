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
import { PreferencesScreen } from '../screens/PreferencesScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { appTheme, navigationTheme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

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
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
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
          name="Preferences"
          component={PreferencesScreen}
          options={{ title: 'Tercihler' }}
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
    </NavigationContainer>
  );
}
