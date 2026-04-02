import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import { appTheme } from '../theme';
import type { MainTabParamList } from './types';

const tabIconMap: Record<keyof MainTabParamList, { active: keyof typeof MaterialIcons.glyphMap; inactive: keyof typeof MaterialIcons.glyphMap }> = {
  Home: {
    active: 'home',
    inactive: 'home',
  },
  Categories: {
    active: 'grid-view',
    inactive: 'grid-view',
  },
  Search: {
    active: 'search',
    inactive: 'search',
  },
  Saved: {
    active: 'bookmark',
    inactive: 'bookmark-border',
  },
  Profile: {
    active: 'person',
    inactive: 'person-outline',
  },
};

export function getBottomTabScreenOptions(routeName: keyof MainTabParamList): BottomTabNavigationOptions {
  return {
    headerShown: false,
    tabBarActiveTintColor: appTheme.colors.primary,
    tabBarInactiveTintColor: appTheme.colors.tabInactive,
    tabBarHideOnKeyboard: true,
    tabBarLabelStyle: {
      fontFamily: appTheme.typography.fontFamily.body,
      fontSize: appTheme.typography.fontSize.xs,
      fontWeight: appTheme.typography.fontWeight.bold,
      letterSpacing: appTheme.typography.letterSpacing.wide,
      textTransform: 'uppercase',
    },
    tabBarItemStyle: {
      paddingVertical: appTheme.spacing.xxs,
    },
    tabBarStyle: {
      backgroundColor: appTheme.colors.surface,
      borderTopColor: appTheme.colors.border,
      height: appTheme.sizes.tabBarHeight,
      paddingBottom: appTheme.spacing.sm,
      paddingTop: appTheme.spacing.xs,
    },
    tabBarIcon: ({ color, focused, size }) => {
      const iconName = focused ? tabIconMap[routeName].active : tabIconMap[routeName].inactive;
      return <MaterialIcons color={color} name={iconName} size={size} />;
    },
  };
}
