import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { leaveAt } from '../lib/eta';
import { cancelLeaveReminder, scheduleLeaveReminder } from '../lib/notify';
import { socket } from '../lib/socket';

const CHECK_EVERY_MS = 15000;
const RESCHEDULE_IF_MOVED_MS = 5000;

// Tells each person when to set off for the shop, from the distance they gave and the latest
// estimate. While the app is open it calls `show(ticket)` at that moment. It also hands the same
// moment to the phone's own scheduler, so the reminder still arrives if the app has been suspended
// (development or production builds). The estimate moves as people are served, so both follow it.
export default function useLeaveAlerts(tickets, show) {
  const latest = useRef(new Map()); // queue code -> the newest snapshot and when it arrived
  const alerted = useRef(new Set()); // `${ticketId}:${travelMin}`, so each choice alerts once
  const planned = useRef(new Map()); // ticketId -> the moment last given to the scheduler

  useEffect(() => {
    const ids = new Set(tickets.map((t) => t.ticketId));
    planned.current.forEach((_, id) => {
      if (ids.has(id)) return;
      planned.current.delete(id);
      cancelLeaveReminder(id);
    });

    const check = () => {
      const now = Date.now();
      tickets.forEach((ticket) => {
        const seen = latest.current.get(ticket.code);
        const at = seen ? leaveAt(seen.snapshot, seen.at, ticket.number, ticket.travelMin) : null;
        if (at === null) {
          // No distance set, or the ticket is no longer waiting: nothing should fire.
          if (planned.current.delete(ticket.ticketId)) cancelLeaveReminder(ticket.ticketId);
          return;
        }
        if (at > now) {
          const before = planned.current.get(ticket.ticketId);
          if (before === undefined || Math.abs(before - at) > RESCHEDULE_IF_MOVED_MS) {
            planned.current.set(ticket.ticketId, at);
            scheduleLeaveReminder(ticket, at);
          }
          return;
        }
        const key = `${ticket.ticketId}:${ticket.travelMin}`;
        if (AppState.currentState === 'active' && !alerted.current.has(key)) {
          alerted.current.add(key);
          show(ticket);
        }
      });
    };

    const update = (snapshot) => {
      latest.current.set(snapshot.code, { snapshot, at: Date.now() });
      check();
    };
    socket.on('queue:update', update);
    const timer = setInterval(check, CHECK_EVERY_MS);
    const appState = AppState.addEventListener('change', (state) => state === 'active' && check());
    check();
    return () => {
      socket.off('queue:update', update);
      clearInterval(timer);
      appState.remove();
    };
  }, [tickets, show]);
}
