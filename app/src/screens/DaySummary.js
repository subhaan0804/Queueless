import { StyleSheet, Text, View } from 'react-native';
import { colors, space, type } from '../theme';
import { goHome } from '../lib/nav';
import { clearOwner } from '../lib/storage';
import DockButton from '../components/DockButton';
import Screen from '../components/Screen';

function Line({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={[type.body, styles.ink, styles.label]}>{label}</Text>
      <Text style={[type.rowNumber, styles.ink]}>{value}</Text>
    </View>
  );
}

export default function DaySummary({ navigation, route }) {
  const { summary, name } = route.params;

  async function done() {
    await clearOwner(); // only now is the owner record dropped, so a crash here still resumes
    goHome(navigation);
  }

  return (
    <Screen>
      <View style={styles.body}>
        <Text accessibilityRole="header" style={[type.title, styles.ink]}>
          Queue closed
        </Text>
        <Text style={[type.body, styles.pencil]}>{name}</Text>
        <View style={styles.rows}>
          <Line label="People served" value={summary.served} />
          <Line label="Skipped" value={summary.skipped} />
          <Line label="Left on their own" value={summary.left} />
          <Line label="Minutes per person on average" value={Number(summary.avgServiceMin.toFixed(1))} />
        </View>
      </View>
      <DockButton label="Done" onPress={done} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  ink: { color: colors.ink },
  pencil: { color: colors.pencil },
  label: { flex: 1 },
  body: { flex: 1, padding: space.xl },
  rows: { marginTop: space.xl },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
});
