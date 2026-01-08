/**
 * components/ui/icon-symbol.ios.tsx
 * Brief: iOS-specific icon component using SF Symbols via `expo-symbols`.
 * Exports: `IconSymbol` component that renders native symbol views on iOS.
 */
import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * Renders a native symbol view on iOS using SF Symbols.
 *
 * @param {string} name The name of the symbol to render.
 * @param {number} [size=24] The size of the rendered symbol.
 * @param {string} color The tint color of the rendered symbol.
 * @param {StyleProp<ViewStyle>} [style] Additional styles to apply to the rendered symbol.
 * @param {SymbolWeight} [weight='regular'] The weight of the rendered symbol.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
