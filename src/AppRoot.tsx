import { StatusBar } from 'expo-status-bar';

import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';

export function AppRoot() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProviders>
  );
}
