import { useEffect, useRef } from 'react';
import { Animated, Easing, PixelRatio, Text, View } from 'react-native';
import { NATIVE_DRIVER } from '../lib/motion';

// One clipped column of 0-9. Changing the digit slides the column, like a departure board.
function Digit({ d, h, style, reduceMotion }) {
  const y = useRef(new Animated.Value(-d * h)).current;
  useEffect(() => {
    Animated.timing(y, {
      toValue: -d * h,
      duration: reduceMotion ? 0 : 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE_DRIVER,
    }).start();
  }, [d, h, reduceMotion, y]);

  return (
    <View style={{ height: h, overflow: 'hidden' }}>
      <Animated.View style={{ transform: [{ translateY: y }] }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Text key={n} allowFontScaling={false} style={[style, { height: h, lineHeight: h }]}>
            {n}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

export default function RollingNumber({ value, style, color, reduceMotion }) {
  // The column height must match the glyphs, so scale by hand (capped at 1.3)
  // instead of letting the system scale the font independently of the column.
  const scale = Math.min(PixelRatio.getFontScale(), 1.3);
  const h = Math.round(style.lineHeight * scale);
  const textStyle = { ...style, fontSize: style.fontSize * scale, color, includeFontPadding: false };
  const digits = String(value).split('');

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={String(value)}
      accessibilityLiveRegion="polite"
      style={{ flexDirection: 'row' }}
    >
      {/* Keyed from the right so the units column stays mounted when 9 becomes 10. */}
      {digits.map((d, i) => (
        <Digit key={digits.length - i} d={Number(d)} h={h} style={textStyle} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
}
