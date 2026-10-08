import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, font, radius, space, type } from '../theme';

export default function Field({ label, error, style, ...input }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={style}>
      <Text style={[type.body, styles.label]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.pencil}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, focused && styles.focused, !!error && styles.invalid]}
        {...input}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[type.caption, styles.error]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.ink, marginBottom: space.sm },
  input: {
    minHeight: 56,
    paddingHorizontal: space.lg,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: font.regular,
    fontSize: 16,
  },
  focused: { borderColor: colors.blue },
  invalid: { borderColor: colors.red },
  error: { color: colors.red, marginTop: space.sm },
});
