import { useCallback, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space, type } from '../theme';
import * as haptics from '../lib/haptics';
import { ticketRoute } from '../lib/nav';
import { loadOwner, loadTickets } from '../lib/storage';

// Two full-height panels, each a single tap. Text sits low, near the thumb.
function Panel({ grow, bg, color, caption, title, top = 0, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${caption}. ${title}`}
      onPressIn={haptics.tap}
      onPress={onPress}
      style={({ pressed }) => [
        styles.panel,
        { flex: grow, backgroundColor: bg, paddingTop: top + space.xl },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[type.body, { color }]}>{caption}</Text>
      <Text style={[type.title, { color }]}>{title}</Text>
    </Pressable>
  );
}

export default function Home({ navigation }) {
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState([]);
  const [owner, setOwner] = useState(null);

  // Re-read on focus: a ticket or queue may have been created or cleared since last visit.
  useFocusEffect(
    useCallback(() => {
      loadTickets().then(setTickets);
      loadOwner().then(setOwner);
    }, [])
  );

  const held = tickets.length > 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <Panel
        grow={held ? 40 : 55}
        bg={colors.blue}
        color={colors.white}
        top={insets.top}
        caption="I'm waiting"
        title="Join a queue"
        onPress={() => navigation.navigate('JoinQueue')}
      />
      {held && (
        <Panel
          grow={25}
          bg={colors.white}
          color={colors.ink}
          caption="Already in line"
          title={tickets.length === 1 ? 'My ticket' : `My tickets (${tickets.length})`}
          onPress={() => {
            const { name, params } = ticketRoute(tickets);
            navigation.navigate(name, params);
          }}
        />
      )}
      <Panel
        grow={held ? 35 : 45}
        bg={colors.paper}
        color={colors.ink}
        caption="I run the queue"
        title={owner ? 'Open my queue' : 'Start a queue'}
        onPress={() => (owner ? navigation.navigate('OwnerDashboard', { owner }) : navigation.navigate('StartQueue'))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  panel: { padding: space.xl, justifyContent: 'flex-end' },
  pressed: { transform: [{ scale: 0.99 }] },
});
