import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import { alertText } from './alertText';

// Local notifications only: the phone raises them itself, with no push server, account or token.
//
// Expo Go cannot run this on Android (SDK 53+): merely loading expo-notifications there throws,
// because the library registers a push-token listener on import. So in Expo Go the library is
// never loaded and the in-app banner is the only alert. A development or production build
// supports the full thing.
const SUPPORTED = !isRunningInExpoGo();

const CHANNEL = 'called';
let library = null;

// Loaded on first use, and never in Expo Go.
function notifications() {
  if (!library) library = require('expo-notifications');
  return library;
}

// Android needs a high-importance channel for the notification to pop up over other apps.
async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  const N = notifications();
  await N.setNotificationChannelAsync(CHANNEL, {
    name: 'Your turn',
    importance: N.AndroidImportance.MAX,
    vibrationPattern: [0, 300, 200, 300],
  });
}

// Asked right after joining, when the reason for the question is obvious. A refusal is fine:
// the in-app banner still works.
export async function askNotificationPermission() {
  if (!SUPPORTED) return;
  try {
    await ensureChannel();
    const N = notifications();
    const { granted, canAskAgain } = await N.getPermissionsAsync();
    if (!granted && canAskAgain) await N.requestPermissionsAsync();
  } catch {
    // notifications are a bonus; never block joining over them
  }
}

function contentFor(kind, ticket) {
  const { title, body } = alertText(kind, ticket);
  return { title, body, data: { ticketId: ticket.ticketId } };
}

// Shows right now: used when a number is called while the app is in the background.
export async function notifyCalled(ticket) {
  if (!SUPPORTED) return;
  try {
    await ensureChannel();
    await notifications().scheduleNotificationAsync({
      content: contentFor('called', ticket),
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL } : null, // null: show now
    });
  } catch {
    // not permitted or unsupported: the banner covers the foreground case
  }
}

// A fixed identifier per ticket, so scheduling again replaces the earlier reminder instead of
// stacking a second one, even after the app has been restarted.
const reminderId = (ticketId) => `leave-${ticketId}`;

// Asks the phone's own scheduler to say "time to head back" at `atMs`. It then arrives even if
// the app has been suspended in the meantime (development or production builds only).
export async function scheduleLeaveReminder(ticket, atMs) {
  if (!SUPPORTED) return;
  const seconds = Math.ceil((atMs - Date.now()) / 1000);
  if (seconds < 1) return;
  try {
    await ensureChannel();
    await notifications().scheduleNotificationAsync({
      identifier: reminderId(ticket.ticketId),
      content: contentFor('leave', ticket),
      trigger: { type: 'timeInterval', seconds, ...(Platform.OS === 'android' ? { channelId: CHANNEL } : {}) },
    });
  } catch {
    // the in-app banner still fires while the app is open
  }
}

export async function cancelLeaveReminder(ticketId) {
  if (!SUPPORTED) return;
  try {
    await notifications().cancelScheduledNotificationAsync(reminderId(ticketId));
  } catch {
    // nothing was scheduled
  }
}

// Calls `handler(ticketId)` when the person taps a notification. Returns the unsubscribe function.
export function onNotificationTap(handler) {
  if (!SUPPORTED) return () => {};
  try {
    const sub = notifications().addNotificationResponseReceivedListener((response) =>
      handler(response.notification.request.content.data.ticketId)
    );
    return () => sub.remove();
  } catch {
    return () => {};
  }
}
