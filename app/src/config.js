import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Must match PORT in server/.env (the server defaults to 4000).
const SERVER_PORT = 4000;

// Where the API lives. Nothing here is specific to one laptop or one Wi-Fi network.
// Most explicit source first:
//   1. EXPO_PUBLIC_API_URL (app/.env): for a tunnel, a built app, or a server on another machine
//   2. web: the host that served the page
//   3. phone in development: the host that served the JS bundle, which is this laptop
function resolveApiUrl() {
  const explicit = process.env.EXPO_PUBLIC_API_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  if (Platform.OS === 'web') return `http://${window.location.hostname}:${SERVER_PORT}`;
  const hostUri = Constants.expoConfig && Constants.expoConfig.hostUri; // e.g. "192.168.0.10:8081"
  if (hostUri) return `http://${hostUri.split(':')[0]}:${SERVER_PORT}`;
  // Last resort. Errors name this address, so a wrong one is easy to spot.
  return `http://localhost:${SERVER_PORT}`;
}

export const API_URL = resolveApiUrl();
