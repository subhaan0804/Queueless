import { colors } from '../theme';

// Everything the ticket screen changes with state: background, text colour,
// status bar icons and the command at the top. Copy follows PRD section 7.7.
export const LOOK = {
  unknown: { bg: 'blue', line: 'Checking your place.' },
  waiting: { bg: 'blue', line: 'Wait here.' },
  almost: { bg: 'blue', line: 'Head back to the shop.' },
  turn: { bg: 'yellow', line: 'Go to the counter now.' },
  done: { bg: 'paper', line: 'Thanks for waiting.' },
  skipped: { bg: 'paper', line: 'You were skipped because you did not show up.' },
  closed: { bg: 'paper', line: 'This queue is closed.' },
};

export const isBlue = (kind) => LOOK[kind].bg === 'blue';
export const textColor = (kind) => (isBlue(kind) ? colors.white : colors.ink);
export const barStyle = (kind) => (isBlue(kind) ? 'light-content' : 'dark-content');

function ordinal(n) {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
}

export function positionLine(ahead) {
  return ahead === 0 ? 'You are next in line.' : `You are ${ordinal(ahead + 1)} in line.`;
}

// The phone works out its own place from the shared snapshot. A ticket that is
// in neither the serving slot nor the waiting list has ended, and only the
// server knows how, hence `endStatus` from GET /tickets/:id.
export function ticketState(snapshot, number, endStatus) {
  if (snapshot) {
    if (snapshot.serving === number) return { kind: 'turn', ahead: 0 };
    const index = snapshot.waiting.indexOf(number);
    if (index >= 0) return { kind: index <= 2 ? 'almost' : 'waiting', ahead: index };
  }
  // A ticket the server dropped ('left') can only mean the owner closed the queue.
  const ended = { done: 'done', skipped: 'skipped', left: 'closed' }[endStatus];
  return { kind: ended || 'unknown', ahead: null };
}
