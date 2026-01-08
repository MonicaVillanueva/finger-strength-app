/**
 * app/_layout.tsx
 * Brief: App shell and navigation root. Sets up global providers and route layout for the app.
 * Exports: default layout component used by the routing system.
 */
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Root layout component for the app.
 * Sets up global theme provider and navigation layout for the app.
 * Includes a stack navigator with two screens: "(tabs)" and "modal".
 * The "(tabs)" screen is the primary tabbed area and the "modal" screen is used for displaying transient content.
 * Theme is set based on the current color scheme.
 * @returns {JSX.Element} Root layout component for the app.
*/
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
