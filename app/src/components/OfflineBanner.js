import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space, type } from '../theme';
import { NATIVE_DRIVER } from '../lib/motion';
import useReducedMotion from '../hooks/useReducedMotion';

const HIDDEN = -200; // far enough off-screen on any phone

export default function OfflineBanner({ visible }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const y = useRef(new Animated.Value(HIDDEN)).current;

  useEffect(() => {
    Animated.timing(y, {
      toValue: visible ? 0 : HIDDEN,
      duration: reduceMotion ? 0 : 200,
      useNativeDriver: NATIVE_DRIVER,
    }).start();
  }, [visible, reduceMotion, y]);

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      aria-hidden={!visible} // off-screen, so it must not be announced either
      style={[styles.banner, { paddingTop: insets.top + space.sm, transform: [{ translateY: y }] }]}
    >
      <Text style={[type.caption, styles.text]}>Reconnecting. Numbers may be out of date.</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: space.sm,
    paddingHorizontal: space.xl,
    backgroundColor: colors.ink,
    pointerEvents: 'none',
  },
  text: { color: colors.white },
});
