const MS_PER_MIN = 60000;

// The person being served is, on average, halfway done, hence the half term.
export function waitMinutes(ahead, avg, someoneServing) {
  return Math.ceil(ahead * avg + (someoneServing ? avg / 2 : 0));
}

// A little slack, so the person arrives before their number is called rather than as it is.
export const LEAVE_BUFFER_MIN = 2;

// Minutes from now until the person should set off, given their wait and how far away they are.
export function leaveInMinutes(wait, travelMin) {
  return Math.max(0, wait - travelMin - LEAVE_BUFFER_MIN);
}

// The moment (ms since epoch) the person should set off, worked out from the snapshot that arrived
// at `receivedAt`. Null when it does not apply: no travel time set, or the ticket is not waiting.
export function leaveAt(snapshot, receivedAt, number, travelMin) {
  if (!snapshot || !travelMin) return null;
  const ahead = snapshot.waiting.indexOf(number);
  if (ahead < 0) return null;
  const wait = waitMinutes(ahead, snapshot.avgServiceMin, snapshot.serving !== null);
  return receivedAt + leaveInMinutes(wait, travelMin) * MS_PER_MIN;
}

// Whole minutes left until `timestamp`, rounded up, never negative. 0 means "now".
export function minutesUntil(timestamp, now) {
  return Math.max(0, Math.ceil((timestamp - now) / MS_PER_MIN));
}
