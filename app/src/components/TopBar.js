import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, space, type } from '../theme';
import { goHome } from '../lib/nav';

// The small "Home" button every resumed screen carries so a person can switch roles.
export default function TopBar({ navigation, color = colors.ink, right }) {
  return (
    <View style={styles.row}>
      {Platform.OS === 'web' ? (
        <View /> // the web admin is owner-only, so there is no other role to switch to
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Home"
          onPress={() => goHome(navigation)}
          style={styles.home}
        >
          <Feather name="chevron-left" size={24} color={color} />
          <Text style={[type.body, { color }]}>Home</Text>
        </Pressable>
      )}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 48,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  home: { minHeight: 48, flexDirection: 'row', alignItems: 'center' },
});
