import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space, type } from '../theme';
import * as haptics from '../lib/haptics';

const OPTIONS = [0, 5, 10, 20, 30]; // minutes away; 0 means already at the shop

// "How far away are you?" and the answer that matters: when to leave.
export default function TravelPicker({ value, onChange, leaveIn, wait, color }) {
  return (
    <View style={styles.wrap}>
      <Text style={[type.body, { color }]}>How many minutes away are you?</Text>
      <View style={styles.chips}>
        {OPTIONS.map((minutes) => {
          const selected = (value || 0) === minutes;
          return (
            <Pressable
              key={minutes}
              accessibilityRole="button"
              accessibilityLabel={minutes ? `${minutes} minutes away` : 'I am at the shop'}
              accessibilityState={{ selected }}
              onPressIn={haptics.tap}
              onPress={() => onChange(minutes)}
              style={[styles.chip, { borderColor: color }, selected && { backgroundColor: color }]}
            >
              <Text style={[type.button, { color: selected ? colors.blue : color }]}>{minutes || 'Here'}</Text>
            </Pressable>
          );
        })}
      </View>
      {value ? (
        <View accessibilityLiveRegion="polite">
          <Text style={[type.section, { color }]}>{leaveIn === 0 ? 'Leave now.' : `Leave in ${leaveIn} min.`}</Text>
          <Text style={[type.caption, { color }]}>
            You are {value} min away. Your turn is in about {wait} min.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  chips: { flexDirection: 'row', gap: space.sm },
  chip: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
