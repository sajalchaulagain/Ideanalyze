import { useCallback, useEffect, useState } from "react";

/*
  Shared retry timer for AI provider congestion. Keeping the end timestamp
  (instead of decrementing a counter in an interval) avoids drift and makes
  the countdown correct after tab switches.
*/
export function useRetryCooldown() {
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // An elapsed deadline already reports zero through the derived value
    // below; no state write is needed until the timer callback runs.
    if (!endsAt || Date.now() >= endsAt) return undefined;

    const timer = window.setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= endsAt) {
        window.clearInterval(timer);
        setEndsAt(0);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [endsAt]);

  const startCooldown = useCallback((seconds = 60) => {
    const current = Date.now();
    setNow(current);
    setEndsAt(current + seconds * 1000);
  }, []);

  const resetCooldown = useCallback(() => setEndsAt(0), []);

  return {
    retryCooldown: endsAt
      ? Math.max(0, Math.ceil((endsAt - now) / 1000))
      : 0,
    startCooldown,
    resetCooldown,
  };
}
