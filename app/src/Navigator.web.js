import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from './theme';
import StartQueue from './screens/StartQueue';
import OwnerDashboard from './screens/OwnerDashboard';
import DaySummary from './screens/DaySummary';

const Stack = createNativeStackNavigator();

// The web admin is for the owner only. Metro picks this file for web, so the
// customer screens (camera, ticket) are never bundled into the browser build.
export function pickStart({ owner }) {
  return owner ? { name: 'OwnerDashboard', params: { owner } } : { name: 'StartQueue' };
}

export default function Navigator({ start }) {
  return (
    <NavigationContainer documentTitle={{ formatter: () => 'Queueless' }}>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
