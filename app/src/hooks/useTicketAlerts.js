import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { StackActions } from '@react-navigation/native';
import * as haptics from '../lib/haptics';
import { notifyCalled, onNotificationTap } from '../lib/notify';
import { socket } from '../lib/socket';
import { loadTickets, onTicketsChange } from '../lib/storage';

// Watches every queue this phone holds a ticket in, from any screen, and says so when a number
// is called: a banner and a buzz while the app is open, a system notification once it is in
// the background. It only works while the socket is alive: with no push server, a phone the
// system has fully put to sleep cannot be reached.
export default function useTicketAlerts(navigationRef) {
  const [tickets, setTickets] = useState([]);
  const [called, setCalled] = useState(null); // the ticket shown in the banner
  const calling = useRef(new Map()); // tickets being called right now, so each call alerts once

  useEffect(() => {
    loadTickets().then(setTickets);
    return onTicketsChange(setTickets);
  }, []);

  const open = useCallback(
    (ticket) => {
      setCalled(null);
      if (navigationRef.isReady()) navigationRef.dispatch(StackActions.push('MyTicket', { ticket }));
    },
    [navigationRef]
  );

  useEffect(() => {
    if (!tickets.length) return undefined;
    const ids = new Set(tickets.map((t) => t.ticketId));
    calling.current.forEach((_, id) => !ids.has(id) && calling.current.delete(id));

    // The ticket screen already turns yellow and buzzes, so the banner would repeat it.
    const viewing = (ticket) => {
      const route = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
      return !!route && route.name === 'MyTicket' && route.params.ticket.ticketId === ticket.ticketId;
    };
    const announce = (ticket) => {
      if (AppState.currentState !== 'active') notifyCalled(ticket);
      else if (!viewing(ticket)) {
        haptics.turn();
        setCalled(ticket);
      }
    };

    // Joining a room twice is harmless, so every code is joined again on each (re)connect.
    const join = () => new Set(tickets.map((t) => t.code)).forEach((code) => socket.emit('room:join', code));
    const update = (snapshot) => {
      tickets
        .filter((t) => t.code === snapshot.code)
        .forEach((ticket) => {
          const isCalled = snapshot.serving === ticket.number;
          if (isCalled && !calling.current.has(ticket.ticketId)) {
            calling.current.set(ticket.ticketId, ticket);
            announce(ticket);
          } else if (!isCalled && calling.current.delete(ticket.ticketId)) {
            setCalled((current) => (current && current.ticketId === ticket.ticketId ? null : current));
          }
        });
    };
    // Back from the background: show the banner for a call that came in while away.
    const appState = AppState.addEventListener('change', (state) => {
      const waiting = [...calling.current.values()].find((t) => !viewing(t));
      if (state === 'active') {
        if (!socket.connected) socket.connect();
        if (waiting) setCalled(waiting);
      }
    });
    const stopTap = onNotificationTap((id) => {
      const ticket = tickets.find((t) => t.ticketId === id);
      if (ticket) open(ticket);
    });

    socket.on('connect', join);
    socket.on('queue:update', update);
    if (socket.connected) join();
    else socket.connect();
    return () => {
      socket.off('connect', join);
      socket.off('queue:update', update);
      appState.remove();
      stopTap();
    };
  }, [tickets, navigationRef, open]);

  return { called, open, dismiss: () => setCalled(null) };
}
