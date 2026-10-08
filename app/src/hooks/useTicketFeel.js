import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { colors } from '../theme';
import * as haptics from '../lib/haptics';
import { NATIVE_DRIVER } from '../lib/motion';
import { LOOK } from '../lib/ticketState';

const BG_STEP = { blue: 0, yellow: 1, paper: 2 };

// The moments that make the ticket screen feel alive: colour cross-fade, the
// turn pulse and the haptics. Each haptic fires once per change, not per render.
export default function useTicketFeel(kind, serving, reduceMotion) {
  const step = useRef(new Animated.Value(BG_STEP[LOOK[kind].bg])).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prevKind = useRef(null);
  const prevServing = useRef(undefined);

  useEffect(() => {
    Animated.timing(step, {
      toValue: BG_STEP[LOOK[kind].bg],
      duration: reduceMotion ? 0 : 400,
      useNativeDriver: false, // colours cannot use the native driver
    }).start();

    const was = prevKind.current;
    prevKind.current = kind;
    // `was` is null on first render: reopening the app on a state is not a change.
    if (kind === 'turn' && was && was !== 'turn') {
      haptics.turn();
      if (!reduceMotion) {
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 150, useNativeDriver: NATIVE_DRIVER }),
          Animated.timing(pulse, { toValue: 1, duration: 150, useNativeDriver: NATIVE_DRIVER }),
        ]).start();
      }
    }
    if (kind === 'almost' && was === 'waiting') haptics.nudge();
  }, [kind, reduceMotion, step, pulse]);

  useEffect(() => {
    if (prevServing.current !== undefined && serving !== null && serving !== prevServing.current) {
      haptics.tick();
    }
    prevServing.current = serving;
  }, [serving]);

  const bg = step.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [colors.blue, colors.yellow, colors.paper],
  });
  return { bg, pulse };
}
