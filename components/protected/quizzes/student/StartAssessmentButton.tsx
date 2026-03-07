"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type Props = {
  quizId: string;
};

export default function StartAssessmentButton({ quizId }: Props) {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStart = async () => {
    if (!checked) return;
    setLoading(true);
    setError(null);

    try {
      // Request fullscreen first
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {
          // Fullscreen denied — continue anyway (don't block the student)
        });
      }

      // Start (or resume) the attempt via API
      const res = await fetch("/api/quiz_attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to start quiz");
        setLoading(false);
        return;
      }

      router.push(`/quiz_attempt?attemptId=${data.attemptId}`);
    } catch (err) {
      console.error("Start assessment error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 w-full">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          disabled={loading}
          className="mt-1 w-5 h-5 accent-amber-400"
        />
        <div>
          <h3 className="font-semibold">Honor Code Agreement</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-xl">
            I certify that I will answer all questions on my own without outside
            assistance. I understand that plagiarism will result in immediate
            disqualification.
          </p>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!checked || loading}
        className={`px-8 py-3 rounded-xl font-semibold transition shadow-lg flex items-center gap-2
          ${
            checked && !loading
              ? "bg-amber-400 hover:bg-amber-300 text-black shadow-amber-400/20"
              : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
          }`}
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Starting…" : "Start Assessment →"}
      </button>
    </div>
  );
}
