/**
 * components/haptic-tab.tsx
 * Brief: Tab button wrapper that provides light haptic feedback on iOS when pressed.
 * Exports: `HapticTab` used as a custom tab bar button.
 */
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

/**
 * A tab button wrapper that provides light haptic feedback on iOS when pressed.
 * Uses the `PlatformPressable` component from `@react-navigation/elements` and
 * `Haptics.impactAsync` from `expo-haptics` to create a haptic feedback effect.
 * The haptic feedback is only applied on iOS devices.
 * @param {BottomTabBarButtonProps} props - The props to pass to the `PlatformPressable` component.
 * @returns {JSX.Element} - The rendered `PlatformPressable` component with haptic feedback.
 */
export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
