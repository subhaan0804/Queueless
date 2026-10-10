import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, type } from '../theme';
import * as haptics from '../lib/haptics';

// Fill, border and label colour for each variant.
const LOOK = {
  primary: (pressed) => ({ bg: pressed ? colors.bluePressed : colors.blue, border: null, text: colors.white }),
  outline: (pressed) => ({ bg: pressed ? colors.fog : 'transparent', border: colors.ink, text: colors.ink }),
  danger: (pressed) => ({ bg: pressed ? '#F3E0DE' : 'transparent', border: colors.red, text: colors.red }),
  text: (pressed) => ({ bg: pressed ? colors.fog : 'transparent', border: null, text: colors.ink }),
};

export default function BigButton({
  label,
  onPress,
  variant = 'primary',
  height = 56,
  disabled = false,
  busy = false,
  color,
  haptic = haptics.tap,
  style,
}) {
  const inactive = disabled || busy;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPressIn={haptic}
      onPress={onPress}
      style={({ pressed }) => {
        const look = LOOK[variant](pressed);
        return [
          styles.base,
          { minHeight: height, backgroundColor: look.bg },
          look.border && { borderWidth: 1, borderColor: look.border },
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ];
      }}
    >
      {({ pressed }) => (
        // While busy the label is dimmed instead of showing a spinner.
        <Text
          numberOfLines={2}
          style={[type.button, styles.label, { color: color || LOOK[variant](pressed).text }, busy && styles.dim]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { textAlign: 'center' },
  pressed: { transform: [{ translateY: 1 }, { scale: 0.985 }] },
  disabled: { opacity: 0.4 },
  dim: { opacity: 0.6 },
});
