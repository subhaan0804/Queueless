import { API_URL } from '../config';

// Without a limit, an unreachable server leaves a button spinning forever with no message.
const TIMEOUT_MS = 10000;

const networkError = () =>
  new Error(`Cannot reach the server at ${API_URL}. Check that both phones are on the same Wi-Fi.`);

// Resolves with the JSON body, or throws an Error whose message is safe to show.
export async function api(path, { method = 'GET', body, ownerKey } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(ownerKey ? { 'x-owner-key': ownerKey } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw networkError();
  } finally {
    clearTimeout(timer);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || 'Something went wrong. Try again.');
    error.status = res.status;
    throw error;
  }
  return data;
}
