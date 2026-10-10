import { useEffect, useState } from 'react';

// The current time, refreshed on an interval, so a countdown moves without any new data arriving.
export default function useNow(everyMs) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), everyMs);
    return () => clearInterval(timer);
  }, [everyMs]);
  return now;
}
