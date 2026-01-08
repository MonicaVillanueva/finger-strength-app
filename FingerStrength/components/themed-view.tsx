/**
 * components/themed-view.tsx
 * Brief: View wrapper that applies theme-aware background color via `useThemeColor`.
 * Exports: `ThemedView` component and `ThemedViewProps` type.
 */
import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

/**
 * A View wrapper that applies theme-aware background color via `useThemeColor`.
 * The component will automatically apply the correct background color based on the current theme.
 * You can also override the default background color by providing a `lightColor` or `darkColor` prop.
 * @param {ThemedViewProps} props The props for the component.
 * @param {ViewProps} props.style The style for the component.
 * @param {string} [props.lightColor] The light theme background color.
 * @param {string} [props.darkColor] The dark theme background color.
 */
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
