import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const TAG = 'queueless-qr';

// Keeps the screen on while mounted. A browser may refuse (no Wake Lock outside
// HTTPS), and that must not surface as an error: the QR still works.
export default function useScreenOn() {
  useEffect(() => {
    activateKeepAwakeAsync(TAG).catch(() => {});
    return () => {
      Promise.resolve(deactivateKeepAwake(TAG)).catch(() => {});
    };
  }, []);
}
