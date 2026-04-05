import { StyleSheet, View } from 'react-native';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

import { appTheme } from '../../theme';
import { TextField } from './TextField';

type SearchBarProps = {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputProps?: TextInputProps;
};

export function SearchBar({
  value,
  placeholder = 'Haber, konu veya kaynak ara',
  onChangeText,
  onClear,
  containerStyle,
  inputProps,
}: SearchBarProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextField
        {...inputProps}
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
