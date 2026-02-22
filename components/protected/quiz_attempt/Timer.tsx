"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

type QuizTimerProps = {
  duration: string; // minutes
  start_time: string; // ISO string
};

function Timer({ duration, start_time }: QuizTimerProps) {
  const totalDurationMs = parseInt(duration) * 60 * 1000;
  const start = new Date(start_time).getTime();
  const end = start + totalDurationMs;

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    // Initial calculation (safe inside effect)
    const updateTime = () => {
      const remaining = Math.max(end - Date.now(), 0);
      setTimeLeft(remaining);
    };

    updateTime(); // run once immediately

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [end]);

  const totalSeconds = Math.floor(timeLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const format = (n: number) => String(n).padStart(2, "0");

  const percentageRemaining =
    totalDurationMs > 0 ? timeLeft / totalDurationMs : 0;

  let colorClasses = "border-neutral-600 text-neutral-200";

  if (percentageRemaining <= 0.1) {
    colorClasses = "border-red-500 text-red-500";
  } else if (percentageRemaining <= 0.5) {
    colorClasses = "border-amber-500 text-amber-500";
  }

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded-xl border bg-neutral-800 transition-colors duration-300 ${colorClasses}`}
    >
      {/* Icon */}
      <div className="bg-neutral-700 p-2 rounded-lg">
        <Clock className="w-5 h-5" />
      </div>

      {/* Time */}
      <div className="flex flex-col items-center justify-center leading-none min-w-22.5 select-none">
        <span className="text-lg font-semibold tracking-wide tabular-nums text-center">
          {hours > 0
            ? `${format(hours)}:${format(minutes)}:${format(seconds)}`
            : `${format(minutes)}:${format(seconds)}`}
        </span>
        <span className="text-[10px] tracking-widest uppercase opacity-70 text-center">
          Remaining
        </span>
      </div>
    </div>
  );
}

export default Timer;
