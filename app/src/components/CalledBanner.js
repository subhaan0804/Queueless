import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space, type } from '../theme';
import { NATIVE_DRIVER } from '../lib/motion';
import useReducedMotion from '../hooks/useReducedMotion';

const HIDDEN = -300; // far enough off-screen on any phone

// "Yellow means go": slides over whatever screen the person is on when a held number is called.
export default function CalledBanner({ ticket, onOpen, onDismiss }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const y = useRef(new Animated.Value(HIDDEN)).current;
  const last = useRef(null);
  if (ticket) last.current = ticket; // keeps the text while the banner slides back out

  useEffect(() => {
    Animated.timing(y, {
      toValue: ticket ? 0 : HIDDEN,
      duration: reduceMotion ? 0 : 200,
      useNativeDriver: NATIVE_DRIVER,
    }).start();
  }, [ticket, reduceMotion, y]);

  const shown = last.current;
  if (!shown) return null;
  return (
    <Animated.View
      accessibilityLiveRegion="assertive"
      aria-hidden={!ticket}
      style={[
        styles.banner,
        { paddingTop: insets.top + space.sm, transform: [{ translateY: y }], pointerEvents: ticket ? 'auto' : 'none' },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Number ${shown.number} is being called. Open ticket`}
        onPress={() => onOpen(shown)}
        style={styles.text}
      >
        <Text style={[type.section, styles.ink]}>Number {shown.number} is being called</Text>
        <Text style={[type.body, styles.ink]} numberOfLines={2}>
          {shown.queueName}. Go to the counter now.
        </Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Dismiss" onPress={onDismiss} style={styles.close}>
        <Feather name="x" size={24} color={colors.ink} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: space.md,
    paddingLeft: space.xl,
    paddingRight: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.yellow,
    borderBottomWidth: 1,
    borderBottomColor: colors.ink,
  },
  text: { flex: 1, minHeight: 48, justifyContent: 'center' },
  ink: { color: colors.ink },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
