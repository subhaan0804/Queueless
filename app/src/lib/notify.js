import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

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

// Returns the device token used by the server for background delivery.
// This requires a development or production build; Expo Go intentionally skips it.
export async function registerForPushNotifications() {
  if (!SUPPORTED) return null;
  try {
    const N = notifications();
    await ensureChannel();
    const current = await N.getPermissionsAsync();
    const permissions = current.granted || !current.canAskAgain ? current : await N.requestPermissionsAsync();
    if (!permissions.granted) return null;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    if (!projectId) return null;
    const token = await N.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return null;
  }
}

export async function notifyCalled(ticket) {
  if (!SUPPORTED) return;
  try {
    await ensureChannel();
    await notifications().scheduleNotificationAsync({
      content: {
        title: 'It is your turn',
        body: `Number ${ticket.number} at ${ticket.queueName}. Go to the counter now.`,
        data: { ticketId: ticket.ticketId },
      },
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL } : null, // null: show now
    });
  } catch {
    // not permitted or unsupported: the banner covers the foreground case
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
