import { Animated, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import OfflineBanner from './OfflineBanner';

// Every screen's frame: background (a colour or an Animated colour), status bar
// icons that stay readable on it, the top safe area, and a centred column.
export default function Screen({ bg = colors.paper, bar = 'dark-content', offline = false, children }) {
  const insets = useSafeAreaInsets();
  return (
    <Animated.View style={[styles.root, { backgroundColor: bg, paddingTop: insets.top }]}>
      <StatusBar barStyle={bar} />
      <View style={styles.column}>{children}</View>
      <OfflineBanner visible={offline} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // On a phone the column is the whole screen; on a wide browser it stays phone-shaped and centred.
  column: { flex: 1, width: '100%', maxWidth: 680, alignSelf: 'center' },
});
