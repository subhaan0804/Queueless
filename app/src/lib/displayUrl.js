// The address of the shop display for a queue: the same page as the admin, opened with ?display=CODE,
// so it works on any host that serves the web app and needs no extra route or server setting.
export function displayUrl(code) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}?display=${code}`;
}

// The queue code in the current address, or null when this is not the display page.
export function displayCodeFromUrl() {
  const code = new URLSearchParams(window.location.search).get('display');
  return code && /^[A-Za-z0-9]{6}$/.test(code) ? code.toUpperCase() : null;
}
