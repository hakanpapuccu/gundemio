import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { appTheme } from '../../theme';
import { TextField } from './TextField';

type SearchBarProps = {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  placeholder = 'Haber, konu veya kaynak ara',
  onChangeText,
  onClear,
  containerStyle,
}: SearchBarProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextField
        leftIcon="search"
        onChangeText={onChangeText}
        onPressRightIcon={value.length > 0 ? onClear : undefined}
        placeholder={placeholder}
        rightIcon={value.length > 0 ? 'close' : undefined}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    ...appTheme.shadows.card,
  },
});
