import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space, type } from '../theme';
import BigButton from './BigButton';
import Field from './Field';

// Docked at the bottom of the scan screen. First it takes a typed code, then,
// once a queue is found, the optional name.
export default function JoinSheet({ queueName, value, onChange, error, busy, onSubmit }) {
  const insets = useSafeAreaInsets();
  const naming = queueName !== null;
  return (
    <View style={[styles.sheet, { paddingBottom: insets.bottom + space.xl }]}>
      {naming && (
        <Text accessibilityRole="header" style={[type.section, styles.title]}>
          {queueName}
        </Text>
      )}
      <Field
        label={naming ? 'Your first name (optional)' : 'Or type the 6-character code'}
        value={value}
        onChangeText={onChange}
        error={error}
        autoCapitalize={naming ? 'words' : 'characters'}
        autoCorrect={false}
        maxLength={naming ? 30 : 6}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      <BigButton
        label={naming ? 'Get my number' : 'Join'}
        busy={busy}
        onPress={onSubmit}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    padding: space.xl,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
  },
  title: { color: colors.ink, marginBottom: space.lg },
  button: { marginTop: space.lg },
});
