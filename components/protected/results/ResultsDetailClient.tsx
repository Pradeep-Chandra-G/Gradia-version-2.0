"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  BookOpen,
} from "lucide-react";
import { mockResults } from "./ResultsClient";

type Result = (typeof mockResults)[0];

export default function ResultDetailClient({ result }: { result: Result }) {
  const correct = result.breakdown.filter((b) => b.correct).length;
  const incorrect = result.breakdown.length - correct;
  const pct = result.pct;

  // Score bar animation handled via inline style + CSS transition on mount
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl mx-auto no-scrollbar">
      {/* Back */}
      <Link
        href="/dashboard/results"
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        Back to Results
      </Link>

      {/* Score hero */}
      <div
        className={`rounded-2xl p-8 border text-center ${
          result.passed
            ? "bg-emerald-500/8 border-emerald-500/25"
            : "bg-red-500/8 border-red-500/25"
        }`}
      >
        <div
          className={`text-7xl font-black mb-2 ${result.passed ? "text-emerald-400" : "text-red-400"}`}
        >
          {pct}%
        </div>
        <h1 className="text-xl font-bold text-white mb-1">{result.title}</h1>
        <p className="text-gray-400 text-sm mb-4">
          {result.course} · {result.instructor} ·{" "}
          {new Date(result.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <span
          className={`inline-block text-sm font-bold border rounded-full px-4 py-1 ${
            result.passed
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
              : "bg-red-500/15 border-red-500/40 text-red-400"
          }`}
        >
          {result.passed ? "✓ Passed" : "✗ Not Passed"}
        </span>

        {/* Score bar */}
        <div className="mt-6 w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${result.passed ? "bg-emerald-500" : "bg-red-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: <CheckCircle2 size={16} className="text-emerald-400" />,
            label: "Correct",
            value: correct,
            color: "text-emerald-400",
          },
          {
            icon: <XCircle size={16} className="text-red-400" />,
            label: "Incorrect",
            value: incorrect,
            color: "text-red-400",
          },
          {
            icon: <Award size={16} className="text-amber-400" />,
            label: "Score",
            value: `${result.score}/${result.maxScore}`,
            color: "text-amber-400",
          },
          {
            icon: <Clock size={16} className="text-blue-400" />,
            label: "Time Taken",
            value: `${result.duration} min`,
            color: "text-blue-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-neutral-900 border border-white/8 rounded-2xl p-4 text-center"
          >
            <div className="flex justify-center mb-2">{s.icon}</div>
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Question breakdown */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-gray-400" />
          Question Breakdown
        </h2>

        <div className="flex flex-col gap-3">
          {result.breakdown.map((b, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-5 ${
                b.correct
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-red-500/5 border-red-500/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Number badge */}
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      b.correct
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-white leading-relaxed">{b.q}</p>
                </div>

                {/* Points chip */}
                <span
                  className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                    b.correct
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {b.correct ? `+${b.earned}` : "0"} / {b.max} pts
                </span>
              </div>

              {/* Correct / Wrong indicator */}
              <div className="flex items-center gap-2 mt-3">
                {b.correct ? (
                  <CheckCircle2
                    size={13}
                    className="text-emerald-400 shrink-0"
                  />
                ) : (
                  <XCircle size={13} className="text-red-400 shrink-0" />
                )}
                <span
                  className={`text-xs font-semibold ${b.correct ? "text-emerald-400" : "text-red-400"}`}
                >
                  {b.correct ? "Correct" : "Incorrect"}
                </span>
              </div>

              {/* Explanation */}
              {b.explanation && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-gray-400">
                    <span className="text-gray-300 font-medium">
                      💡 Explanation:{" "}
                    </span>
                    {b.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <Link
          href="/dashboard/results"
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={13} /> All Results
        </Link>
        <Link
          href="/dashboard/quizzes"
          className="px-5 py-2.5 bg-amber-400 text-black text-sm font-bold rounded-xl hover:bg-amber-300 transition"
        >
          Take Another Quiz →
        </Link>
      </div>
    </div>
  );
}
