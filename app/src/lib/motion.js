import { LayoutAnimation, Platform } from 'react-native';

// The native animation driver does not exist in a browser; asking for it logs a warning.
export const NATIVE_DRIVER = Platform.OS !== 'web';

// Call just before a state change that adds, removes or moves views.
// (Android needs no opt-in flag on the New Architecture; web has no LayoutAnimation.)
export function animateLayout(reduceMotion) {
  if (reduceMotion || !LayoutAnimation || !LayoutAnimation.configureNext) return;
  LayoutAnimation.configureNext({
    duration: 250,
    create: { type: 'easeInEaseOut', property: 'opacity' },
    update: { type: 'easeInEaseOut' },
    delete: { type: 'easeInEaseOut', property: 'scaleXY' },
  });
}
