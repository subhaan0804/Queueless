import { API_URL } from '../config';

const NETWORK_ERROR = (url) =>
  `Cannot reach the server at ${url}. Check app/.env, Windows Firewall, and that the phone is on the same Wi-Fi.`;

// Resolves with the JSON body, or throws an Error whose message is safe to show.
export async function api(path, { method = 'GET', body, ownerKey } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(ownerKey ? { 'x-owner-key': ownerKey } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(NETWORK_ERROR(API_URL));
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Something went wrong. Try again.');
    error.status = res.status;
    throw error;
  }
  return data;
}
