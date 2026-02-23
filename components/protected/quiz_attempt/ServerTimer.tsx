"use client";

import React, { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

type Props = {
  durationMinutes: number;
  onExpire?: () => void;
};

// Key for sessionStorage so timer survives re-renders but resets on new attempt
const TIMER_KEY = (d: number) => `quiz_timer_end_${d}`;

export default function ServerTimer({ durationMinutes, onExpire }: Props) {
  const totalMs = durationMinutes * 60 * 1000;
  const [timeLeft, setTimeLeft] = useState<number>(totalMs);
  const firedRef = useRef(false);

  useEffect(() => {
    const key = TIMER_KEY(durationMinutes);
    let endTime: number;

    const stored = sessionStorage.getItem(key);
    if (stored) {
      endTime = parseInt(stored, 10);
    } else {
      endTime = Date.now() + totalMs;
      sessionStorage.setItem(key, String(endTime));
    }

    const tick = () => {
      const remaining = Math.max(endTime - Date.now(), 0);
      setTimeLeft(remaining);
      if (remaining === 0 && !firedRef.current) {
        firedRef.current = true;
        sessionStorage.removeItem(key);
        onExpire?.();
      }
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [durationMinutes, totalMs, onExpire]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const pct = totalMs > 0 ? timeLeft / totalMs : 0;
  let colorClass = "border-neutral-600 text-neutral-200";
  if (pct <= 0.1) colorClass = "border-red-500 text-red-400";
  else if (pct <= 0.33) colorClass = "border-amber-500 text-amber-400";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-neutral-800 transition-colors duration-500 ${colorClass}`}
    >
      <div className="bg-neutral-700 p-1.5 rounded-lg">
        <Clock className="w-4 h-4" />
      </div>
      <div className="flex flex-col items-center leading-none select-none min-w-[56px]">
        <span className="text-base font-semibold tracking-wide tabular-nums">
          {hours > 0
            ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
            : `${pad(minutes)}:${pad(seconds)}`}
        </span>
        <span className="text-[9px] tracking-widest uppercase opacity-60">
          Remaining
        </span>
      </div>
    </div>
  );
}
