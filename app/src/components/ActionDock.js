import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '../theme';
import * as haptics from '../lib/haptics';
import BigButton from './BigButton';

// Owner's bottom bar: Skip on the left, the big Next on the right.
export default function ActionDock({ nextLabel, canNext, canSkip, busy, onNext, onSkip }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.dock, { paddingBottom: insets.bottom + space.md }]}>
      <BigButton
        label="Skip"
        variant="danger"
        disabled={!canSkip}
        busy={busy}
        onPress={onSkip}
        style={styles.skip}
      />
      <BigButton
        label={nextLabel}
        height={72}
        disabled={!canNext}
        busy={busy}
        onPress={onNext}
        haptic={haptics.nudge}
        style={styles.next}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingTop: space.md,
    paddingHorizontal: space.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  skip: { flex: 1 },
  next: { flex: 2 },
});
