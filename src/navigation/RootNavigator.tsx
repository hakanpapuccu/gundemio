import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { MainTabParamList, RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ArticleDetailScreen } from '../screens/ArticleDetailScreen';
import { appTheme, navigationTheme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: appTheme.colors.surface,
        },
        headerShadowVisible: false,
        headerTintColor: appTheme.colors.textPrimary,
        tabBarStyle: {
          backgroundColor: appTheme.colors.surface,
          borderTopColor: appTheme.colors.border,
        },
        tabBarActiveTintColor: appTheme.colors.accent,
        tabBarInactiveTintColor: appTheme.colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Ana Sayfa', headerTitle: 'Gündemio' }}
      />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Arama' }} />
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
          headerTintColor: appTheme.colors.textPrimary,
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="ArticleDetail"
          component={ArticleDetailScreen}
          options={{ title: 'Haber Detayı' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
