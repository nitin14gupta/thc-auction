"use client";

import { useEffect, useState } from "react";

const URGENT_THRESHOLD_MS = 10_000;

function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export type CountdownState = {
  label: string | null;
  remainingMs: number;
  isUrgent: boolean;
};

const EMPTY_STATE: CountdownState = { label: null, remainingMs: 0, isUrgent: false };

/** Ticking mm:ss (or hh:mm:ss) countdown to `targetIso`. label is null once passed or if no target. */
export function useCountdown(targetIso: string | null): CountdownState {
  const [state, setState] = useState<CountdownState>(EMPTY_STATE);

  useEffect(() => {
    if (!targetIso) {
      const clear = setTimeout(() => setState(EMPTY_STATE), 0);
      return () => clearTimeout(clear);
    }

    const target = new Date(targetIso).getTime();
    function tick() {
      const remaining = target - Date.now();
      setState(
        remaining <= 0
          ? EMPTY_STATE
          : { label: formatRemaining(remaining), remainingMs: remaining, isUrgent: remaining <= URGENT_THRESHOLD_MS }
      );
    }

    const initial = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [targetIso]);

  return state;
}
