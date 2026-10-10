import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '../theme';
import BigButton from './BigButton';

// A single primary action docked at the bottom, above the safe area.
export default function DockButton({ label, onPress, busy }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.dock, { paddingBottom: insets.bottom + space.md }]}>
      <BigButton label={label} busy={busy} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    padding: space.xl,
    paddingTop: space.md,
    backgroundColor: colors.paper,
  },
});
