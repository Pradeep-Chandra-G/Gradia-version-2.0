"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  quizId: string;
};

export default function StartAssessmentButton({ quizId }: Props) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    if (!checked) return;

    try {
      // Request fullscreen
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      // Navigate after fullscreen is granted
      router.push(`/quiz_attempt?quizId=${quizId}`);
    } catch (err) {
      console.error("Fullscreen denied:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1 w-5 h-5 accent-amber-400"
        />
        <div>
          <h3 className="font-semibold">Honor Code Agreement</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            I certify that I will answer all questions on my own without outside
            assistance. I understand that plagiarism will result in immediate
            disqualification.
          </p>
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!checked}
        className={`px-8 py-3 rounded-xl font-semibold transition shadow-lg 
        ${
          checked
            ? "bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20"
            : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
        }`}
      >
        Start Assessment →
      </button>
    </div>
  );
}
