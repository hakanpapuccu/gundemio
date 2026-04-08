import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { ImageResizeMode, ImageStyle, StyleProp, ViewStyle } from 'react-native';

import { appTheme } from '../../theme';
import { Icon } from './Icon';
import type { IconName } from './Icon';

type RemoteImageProps = {
  uri?: string | null;
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  fallbackIcon?: IconName;
  fallbackIconSize?: number;
  fallbackIconColor?: string;
};

export function RemoteImage({
  uri,
  style,
  resizeMode = 'cover',
  fallbackIcon = 'image',
  fallbackIconSize = appTheme.sizes.iconLg,
  fallbackIconColor = appTheme.colors.textMuted,
}: RemoteImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [uri]);

  if (uri && !hasError) {
    return (
      <Image
        onError={() => setHasError(true)}
        resizeMode={resizeMode}
        source={{ uri }}
        style={[styles.base, style]}
      />
    );
  }

  return (
    <View style={[styles.base, styles.fallback, style as StyleProp<ViewStyle>]}>
      <Icon color={fallbackIconColor} name={fallbackIcon} size={fallbackIconSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: appTheme.colors.surfaceMuted,
    overflow: 'hidden',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
