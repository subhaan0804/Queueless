import { StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../theme';

const MAX_DOTS = 8;

// The line made visible: one dot per person ahead, then you. The layout
// animation that shrinks the first dot is started by the caller (animateLayout).
export default function LineDots({ ahead }) {
  const shown = Math.min(ahead, MAX_DOTS);
  const hidden = ahead - shown;
  return (
    <View accessible accessibilityLabel={`${ahead} ahead of you`} style={styles.row}>
      {hidden > 0 && <Text style={[type.caption, styles.more]}>+{hidden}</Text>}
      {/* Keyed from the right, so when the line moves the leftmost dot is the one that leaves. */}
      {Array.from({ length: shown }, (_, i) => (
        <View key={shown - i} style={styles.dot} />
      ))}
      <View style={styles.you} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.white },
  you: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.yellow,
    borderWidth: 3,
    borderColor: colors.white,
  },
  more: { color: colors.white },
});
