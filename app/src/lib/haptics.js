import * as Haptics from 'expo-haptics';

// Every pattern lives here so the feel can be tuned in one file.
// A device without a vibration motor (or a browser) may reject or throw; that is not worth surfacing.
async function run(pattern) {
  try {
    await pattern();
  } catch {
    // ignored on purpose
  }
}

export const tap = () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const nudge = () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
export const tick = () => run(() => Haptics.selectionAsync());
export const confirm = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const warn = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
export const error = () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));

// Two successes in a row so a buzz in a pocket is hard to miss.
export function turn() {
  confirm();
  setTimeout(confirm, 300);
}
