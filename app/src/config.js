import { Platform } from 'react-native';

// Expo exposes EXPO_PUBLIC_* variables to the client at build/start time.
// Web defaults to the host serving the app; native builds need the server's
// reachable LAN/public URL because localhost means the device itself.
const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const webUrl = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : '';

export const API_URL = (configuredUrl || webUrl).replace(/\/$/, '');

if (!API_URL) {
  throw new Error(
    'Missing EXPO_PUBLIC_API_URL. Set it in app/.env for Android/iOS, for example http://192.168.1.20:4000.'
  );
}
