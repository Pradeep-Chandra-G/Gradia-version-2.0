"use client";

import { AlertTriangle } from "lucide-react";

type Props = {
  reason: string;
  current: number;
  max: number;
  onDismiss: () => void;
};

export default function ViolationWarning({
  reason,
  current,
  max,
  onDismiss,
}: Props) {
  const isLast = current >= max;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-950 border border-red-500/40 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-red-500/10 flex flex-col items-center gap-5 text-center">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle size={28} className="text-red-400" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            {isLast ? "Quiz Auto-Submitted" : `Warning ${current} of ${max}`}
          </h2>
          <p className="text-gray-400 text-sm">{reason}</p>
        </div>

        {/* Violation meter */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Violations</span>
            <span
              className={
                current >= max ? "text-red-400 font-semibold" : "text-amber-400"
              }
            >
              {current} / {max}
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                current >= max ? "bg-red-500" : "bg-amber-400"
              }`}
              style={{ width: `${(current / max) * 100}%` }}
            />
          </div>
        </div>

        {isLast ? (
          <p className="text-red-400 text-sm font-semibold">
            Maximum violations reached. Your answers have been submitted.
          </p>
        ) : (
          <>
            <p className="text-amber-300 text-xs">
              {max - current} more violation{max - current !== 1 ? "s" : ""}{" "}
              will auto-submit your quiz.
            </p>
            <button
              onClick={onDismiss}
              className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition text-sm"
            >
              I understand, resume quiz
            </button>
          </>
        )}
      </div>
    </div>
  );
}
