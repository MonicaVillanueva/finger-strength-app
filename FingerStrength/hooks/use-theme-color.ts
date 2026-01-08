/**
 * hooks/use-theme-color.ts
 * Brief: Maps semantic color names to concrete colors from `Colors` based on the current color scheme.
 * Exports: `useThemeColor` hook.
 *
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Maps a semantic color name to a concrete color based on the current color scheme.
 * @param props - Optional light and dark color overrides.
 * @param colorName - The semantic color name to map to a concrete color.
 * @returns The concrete color based on the current color scheme.
 * @example
 * const primaryColor = useThemeColor({}, 'primary');
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
