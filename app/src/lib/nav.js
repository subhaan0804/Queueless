import { Platform } from 'react-native';

// The web admin has no role switch, so "home" there is the start of the owner flow.
export const HOME = Platform.OS === 'web' ? 'StartQueue' : 'Home';

// One ticket opens straight away; several open the list to choose from.
export function ticketRoute(tickets) {
  return tickets.length === 1
    ? { name: 'MyTicket', params: { ticket: tickets[0] } }
    : { name: 'Tickets' };
}

// Reset rather than navigate so no stale screen (and its socket) stays mounted underneath.
export function goHome(navigation) {
  navigation.reset({ index: 0, routes: [{ name: HOME }] });
}
