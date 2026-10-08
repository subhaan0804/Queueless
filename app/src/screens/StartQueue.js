import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme';
import { api } from '../lib/api';
import * as haptics from '../lib/haptics';
import { saveOwner } from '../lib/storage';
import DockButton from '../components/DockButton';
import Field from '../components/Field';
import Screen from '../components/Screen';
import TopBar from '../components/TopBar';

function StepButton({ label, symbol, onPress, disabled }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPressIn={haptics.tap}
      onPress={onPress}
      style={({ pressed }) => [styles.step, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Text style={[type.section, styles.ink]}>{symbol}</Text>
    </Pressable>
  );
}

export default function StartQueue({ navigation }) {
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState(5);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function open() {
    if (!name.trim()) {
      setError('Enter a shop or clinic name.');
      haptics.error();
      return;
    }
    setBusy(true);
    try {
      const { code, ownerKey } = await api('/queues', {
        method: 'POST',
        body: { name: name.trim(), defaultServiceMin: minutes },
      });
      const owner = { code, ownerKey, name: name.trim() };
      await saveOwner(owner);
      navigation.replace('OwnerDashboard', { owner });
    } catch (e) {
      setError(e.message);
      haptics.error();
      setBusy(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior="padding" style={styles.flex}>
        <TopBar navigation={navigation} />
        <View style={[styles.body, styles.flex]}>
          <Text accessibilityRole="header" style={[type.title, styles.ink]}>
            Start a queue
          </Text>
          <Field
            label="Shop or clinic name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError('');
            }}
            error={error}
            autoFocus
            maxLength={40}
            returnKeyType="done"
            style={styles.field}
          />
          <Text style={[type.body, styles.ink, styles.field]}>Minutes per person</Text>
          <View style={styles.stepper}>
            <StepButton label="Fewer minutes" symbol={'−'} disabled={minutes <= 1} onPress={() => setMinutes(minutes - 1)} />
            <Text accessibilityLiveRegion="polite" style={[type.stat, styles.minutes]}>
              {minutes}
            </Text>
            <StepButton label="More minutes" symbol="+" disabled={minutes >= 60} onPress={() => setMinutes(minutes + 1)} />
          </View>
          <Text style={[type.caption, styles.pencil]}>Used until you have served three people.</Text>
        </View>
        <DockButton label="Open queue" busy={busy} onPress={open} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  ink: { color: colors.ink },
  pencil: { color: colors.pencil, marginTop: space.sm },
  body: { paddingHorizontal: space.xl, paddingTop: space.sm },
  field: { marginTop: space.xl },
  stepper: { marginTop: space.sm, flexDirection: 'row', alignItems: 'center', gap: space.lg },
  step: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minutes: { minWidth: 48, textAlign: 'center', color: colors.ink },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
});
