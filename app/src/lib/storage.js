import AsyncStorage from '@react-native-async-storage/async-storage';

const OWNER = 'queueless.owner'; // { code, ownerKey, name }
const TICKETS = 'queueless.tickets'; // [{ ticketId, code, number, queueName, issuedAt, travelMin? }], one per queue joined
const LEGACY_TICKET = 'queueless.ticket'; // the single record the first version wrote

async function load(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // a corrupt record should open Home, not crash the launch
  }
}

const write = (key, value) => AsyncStorage.setItem(key, JSON.stringify(value));

// The alert watcher follows joins and leaves through this, instead of polling storage.
const listeners = new Set();
export function onTicketsChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
async function writeTickets(tickets) {
  await write(TICKETS, tickets);
  listeners.forEach((listener) => listener(tickets));
}

export const saveOwner = (owner) => write(OWNER, owner);
export const loadOwner = () => load(OWNER);
export const clearOwner = () => AsyncStorage.removeItem(OWNER);

export async function loadTickets() {
  const tickets = (await load(TICKETS)) || [];
  const legacy = await load(LEGACY_TICKET);
  if (!legacy) return tickets;
  // A ticket held under the single-ticket version moves into the list, once.
  const merged = [...tickets, legacy];
  await writeTickets(merged);
  await AsyncStorage.removeItem(LEGACY_TICKET);
  return merged;
}

export async function saveTicket(ticket) {
  const others = (await loadTickets()).filter((t) => t.ticketId !== ticket.ticketId);
  await writeTickets([...others, ticket]);
}

// Changes fields of one held ticket, such as how far away its owner is.
export async function updateTicket(ticketId, changes) {
  const tickets = (await loadTickets()).map((t) => (t.ticketId === ticketId ? { ...t, ...changes } : t));
  await writeTickets(tickets);
}

// Returns what is left, so the caller can decide where to go next.
export async function removeTicket(ticketId) {
  const remaining = (await loadTickets()).filter((t) => t.ticketId !== ticketId);
  await writeTickets(remaining);
  return remaining;
}
