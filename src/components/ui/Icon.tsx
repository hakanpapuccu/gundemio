import type { ComponentProps } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

import { appTheme } from '../../theme';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
};

export function Icon({ name, size = appTheme.sizes.iconLg, color = appTheme.colors.textSecondary }: IconProps) {
  return <MaterialIcons name={name} size={size} color={color} />;
}
