import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../theme';
import { displayUrl } from '../lib/displayUrl';
import BigButton from './BigButton';

// Web admin only: opens the shop's wall screen in a new tab, and shows its link so it can be
// typed into the browser of a TV or a second computer. Renders nothing on a phone.
export default function DisplayLink({ code }) {
  if (Platform.OS !== 'web') return null;
  const url = displayUrl(code);
  return (
    <View style={styles.row}>
      <Text style={[type.caption, styles.link]} selectable>
        Display for a TV: {url}
      </Text>
      <BigButton label="Open display" variant="outline" height={48} onPress={() => window.open(url, '_blank')} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Wraps under the button on a narrow window instead of cutting the link off.
  row: { marginTop: space.sm, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.md },
  link: { flexGrow: 1, flexBasis: 200, color: colors.pencil },
});
