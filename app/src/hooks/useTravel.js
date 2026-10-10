import { useState } from 'react';
import * as haptics from '../lib/haptics';
import { leaveAt, minutesUntil } from '../lib/eta';
import { updateTicket } from '../lib/storage';
import useNow from './useNow';

// How far away this ticket's owner is, and from it when they should set off.
// `leaveIn` counts down on its own and is null until a distance is chosen.
export default function useTravel(record, snapshot, receivedAt) {
  const [travelMin, setTravelMin] = useState(record.travelMin || null);
  const now = useNow(15000);

  function choose(minutes) {
    haptics.tick();
    setTravelMin(minutes || null); // "Here" (0) switches the timer off
    // Saved on the ticket so the alert watcher, running above every screen, can act on it.
    updateTicket(record.ticketId, { travelMin: minutes || null });
  }

  const at = leaveAt(snapshot, receivedAt, record.number, travelMin);
  // `now` only refreshes every few seconds, so it can be older than a snapshot that just arrived;
  // measuring from the later of the two stops a "leave now" moment rounding up to "in 1 min".
  return { travelMin, choose, leaveIn: at === null ? null : minutesUntil(at, Math.max(now, receivedAt)) };
}
