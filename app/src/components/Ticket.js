import { Animated, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

const NOTCH = 24;

// The one card shape in the app: a white ticket with a tear line. The notches
// are circles in the screen's own colour (`bg`), so they read as bites out of the edge.
// `bg` may be an Animated colour (the screen cross-fades), so the notches must be
// Animated.View: a plain View would be handed the Animated node, and React Native
// deep-freezes host props in dev, which breaks the animation that owns that node.
export default function Ticket({ bg, upper, lower }) {
  return (
    <View style={styles.ticket}>
      <View style={styles.part}>{upper}</View>
      <View style={styles.tear}>
        <View style={styles.dash} />
        <Animated.View style={[styles.notch, { left: -NOTCH / 2, backgroundColor: bg }]} />
        <Animated.View style={[styles.notch, { right: -NOTCH / 2, backgroundColor: bg }]} />
      </View>
      <View style={styles.part}>{lower}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: {
    backgroundColor: colors.white,
    borderRadius: radius.ticket,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  part: { paddingHorizontal: 20, paddingVertical: 12 },
  tear: { height: NOTCH, justifyContent: 'center' },
  dash: {
    marginHorizontal: NOTCH / 2,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.pencil,
  },
  notch: { position: 'absolute', width: NOTCH, height: NOTCH, borderRadius: NOTCH / 2 },
});
