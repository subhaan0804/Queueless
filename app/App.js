import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Archivo_400Regular, Archivo_600SemiBold, useFonts } from '@expo-google-fonts/archivo';
import { ArchivoNarrow_700Bold } from '@expo-google-fonts/archivo-narrow';
import { colors } from './src/theme';
import { loadOwner, loadTickets } from './src/lib/storage';
import Navigator, { pickStart } from './src/Navigator';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Archivo_400Regular, Archivo_600SemiBold, ArchivoNarrow_700Bold });
  const [start, setStart] = useState(null);

  useEffect(() => {
    Promise.all([loadTickets(), loadOwner()])
      .then(([tickets, owner]) => setStart(pickStart({ tickets, owner })))
      .catch(() => setStart({ name: 'Home' }));
  }, []);

  // Same blue as the splash, so the hand-off to the first screen is seamless.
  if ((!fontsLoaded && !fontError) || !start) return <View style={{ flex: 1, backgroundColor: colors.blue }} />;

  return (
    <SafeAreaProvider>
      <Navigator start={start} />
    </SafeAreaProvider>
  );
}
