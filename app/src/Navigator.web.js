import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from './theme';
import { displayCodeFromUrl } from './lib/displayUrl';
import StartQueue from './screens/StartQueue';
import OwnerDashboard from './screens/OwnerDashboard';
import DaySummary from './screens/DaySummary';
import Display from './screens/Display';

const Stack = createNativeStackNavigator();

// The web admin is for the owner only. Metro picks this file for web, so the
// customer screens (camera, ticket) are never bundled into the browser build.
export function pickStart({ owner }) {
  const display = displayCodeFromUrl(); // opened as the shop's wall screen: ?display=CODE
  if (display) return { name: 'Display', params: { code: display } };
  return owner ? { name: 'OwnerDashboard', params: { owner } } : { name: 'StartQueue' };
}

export default function Navigator({ start }) {
  return (
    <NavigationContainer
      documentTitle={{ formatter: (_options, route) => (route && route.name === 'Display' ? 'Queueless display' : 'Queueless') }}
    >
      <Stack.Navigator
        initialRouteName={start.name}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}
      >
        <Stack.Screen name="StartQueue" component={StartQueue} />
        <Stack.Screen
          name="OwnerDashboard"
          component={OwnerDashboard}
          initialParams={start.name === 'OwnerDashboard' ? start.params : undefined}
        />
        <Stack.Screen name="DaySummary" component={DaySummary} />
        <Stack.Screen
          name="Display"
          component={Display}
          initialParams={start.name === 'Display' ? start.params : undefined}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
