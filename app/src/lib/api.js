import { API_URL } from '../config';

const NETWORK_ERROR = 'Cannot reach the server. Check that both phones are on the same Wi-Fi.';

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
    throw new Error(NETWORK_ERROR);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Something went wrong. Try again.');
    error.status = res.status;
    throw error;
  }
  return data;
}
