import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from './theme';
import { ticketRoute } from './lib/nav';
import useTicketAlerts from './hooks/useTicketAlerts';
import AlertBanner from './components/AlertBanner';
import Home from './screens/Home';
import StartQueue from './screens/StartQueue';
import OwnerDashboard from './screens/OwnerDashboard';
import JoinQueue from './screens/JoinQueue';
import MyTicket from './screens/MyTicket';
import Tickets from './screens/Tickets';
import DaySummary from './screens/DaySummary';

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

// Resume where the person left off: ticket first, then queue, else Home.
export function pickStart({ tickets, owner }) {
  if (tickets.length) return ticketRoute(tickets);
  if (owner) return { name: 'OwnerDashboard', params: { owner } };
  return { name: 'Home' };
}

// The phone app: every screen, customer and owner. The ticket alerts live here, above the screens,
// so a call is announced wherever the person happens to be.
export default function Navigator({ start }) {
  const paramsFor = (name) => (start.name === name ? start.params : undefined);
  const { alert, open, dismiss } = useTicketAlerts(navigationRef);
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={start.name}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="StartQueue" component={StartQueue} />
        <Stack.Screen name="OwnerDashboard" component={OwnerDashboard} initialParams={paramsFor('OwnerDashboard')} />
        <Stack.Screen name="JoinQueue" component={JoinQueue} />
        <Stack.Screen name="MyTicket" component={MyTicket} initialParams={paramsFor('MyTicket')} />
        <Stack.Screen name="Tickets" component={Tickets} />
        <Stack.Screen name="DaySummary" component={DaySummary} />
      </Stack.Navigator>
      <AlertBanner alert={alert} onOpen={open} onDismiss={dismiss} />
    </NavigationContainer>
  );
}
