import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Home: undefined;
  Categories:
    | {
        categoryId?: string;
      }
    | undefined;
  Search: undefined;
  Saved: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ArticleDetail: {
    articleId: string;
    title?: string;
  };
  SourceDetail: {
    sourceId: string;
    sourceName?: string;
  };
  Sources:
    | {
        categoryId?: string;
        categoryName?: string;
      }
    | undefined;
  Preferences: undefined;
  Auth: {
    mode?: 'signin' | 'signup';
  } | undefined;
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

export type MainTabScreenProps<RouteName extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, RouteName>,
  NativeStackScreenProps<RootStackParamList>
>;
