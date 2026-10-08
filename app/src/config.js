import { Platform } from 'react-native';

// A phone must be given the laptop's LAN IP. A browser can simply use the host that served the page.
export const API_URL =
  Platform.OS === 'web' ? `http://${window.location.hostname}:4000` : 'http://192.168.0.199:4000';
