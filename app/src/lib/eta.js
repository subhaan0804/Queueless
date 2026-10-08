// The person being served is, on average, halfway done, hence the half term.
export function waitMinutes(ahead, avg, someoneServing) {
  return Math.ceil(ahead * avg + (someoneServing ? avg / 2 : 0));
}
