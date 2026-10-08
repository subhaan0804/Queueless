import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme';

const NOTCH = 16;

// Three empty ticket outlines instead of an illustration: same shape as the real ticket.
export default function EmptyStubs({ message, bg = colors.paper }) {
  return (
    <View style={styles.wrap}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.stub}>
          <View style={[styles.notch, { left: -NOTCH / 2, backgroundColor: bg }]} />
          <View style={[styles.notch, { right: -NOTCH / 2, backgroundColor: bg }]} />
        </View>
      ))}
      <Text style={[type.body, styles.message]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: space.xl },
  stub: {
    height: 56,
    marginBottom: space.md,
    justifyContent: 'center',
    borderRadius: radius.ticket,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.hairline,
  },
  notch: { position: 'absolute', width: NOTCH, height: NOTCH, borderRadius: NOTCH / 2 },
  message: { color: colors.ink, marginTop: space.sm },
});
