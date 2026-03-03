"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Calendar,
  Target,
  ChevronLeft,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  BarChart3,
} from "lucide-react";

type QuizDetail = {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  totalQuestions: number;
  totalTimeLimit: number | null;
  beginWindow: string | null;
  endWindow: string | null;
  passScore: number | null;
  correctPoints: number;
  wrongPoints: number;
  showResultsImmediately: boolean;
  sections: {
    id: string;
    title: string;
    questionCount: number;
    timeLimit: number | null;
  }[];
  // attempt info
  attemptStatus: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | null;
  attemptId: string | null;
  percentageScore: number | null;
  passed: boolean | null;
};

const diffStyles: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  HARD: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function QuizDetailPage({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/student/quizzes/${quizId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setQuiz(d.quiz ?? d);
      })
      .catch(() => setError("Failed to load quiz"))
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleStart = async () => {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/quiz_attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to start quiz");
        return;
      }
      router.push(`/quiz_attempt?attemptId=${data.attemptId}`);
    } catch {
      setError("Failed to start quiz. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-amber-400" size={28} />
      </div>
    );
  }

  if (error && !quiz) {
    return (
      <div className="p-6">
        <Link
          href="/dashboard/quizzes"
          className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6"
        >
          <ChevronLeft size={15} /> Back
        </Link>
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const now = new Date();
  const begin = quiz.beginWindow ? new Date(quiz.beginWindow) : null;
  const end = quiz.endWindow ? new Date(quiz.endWindow) : null;
  const isExpired = end && end < now;
  const isNotStarted = begin && begin > now;
  const isDone = quiz.attemptStatus === "SUBMITTED";
  const isInProgress = quiz.attemptStatus === "IN_PROGRESS";

  const canStart = !isExpired && !isNotStarted && !isDone;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-3xl">
      {/* Back */}
      <Link
        href="/dashboard/quizzes"
        className="flex items-center gap-1 text-gray-400 hover:text-white text-sm w-fit transition"
      >
        <ChevronLeft size={15} /> All Quizzes
      </Link>

      {/* Hero card */}
      <div className="bg-neutral-900 border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            {quiz.subject && (
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {quiz.subject}
              </p>
            )}
            <h1 className="text-2xl font-black text-white leading-tight">
              {quiz.title}
            </h1>
            {quiz.description && (
              <p className="text-sm text-gray-400 leading-relaxed">
                {quiz.description}
              </p>
            )}
          </div>
          <span
            className={`shrink-0 text-xs font-bold border rounded-full px-3 py-1.5 ${diffStyles[quiz.difficulty]}`}
          >
            {quiz.difficulty}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {[
            {
              label: "Questions",
              value: String(quiz.totalQuestions),
              icon: <BookOpen size={14} />,
            },
            {
              label: "Duration",
              value: quiz.totalTimeLimit
                ? `${quiz.totalTimeLimit}m`
                : "Untimed",
              icon: <Clock size={14} />,
            },
            {
              label: "Pass Score",
              value: quiz.passScore ? `${quiz.passScore}%` : "N/A",
              icon: <Target size={14} />,
            },
            {
              label: "Sections",
              value: String(quiz.sections?.length ?? 1),
              icon: <BarChart3 size={14} />,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-neutral-800/60 rounded-xl p-3 flex flex-col gap-1"
            >
              <div className="text-gray-500">{s.icon}</div>
              <div className="text-white font-bold text-base">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scoring info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 bg-neutral-800/40 rounded-xl px-4 py-3">
          <span>
            Correct:{" "}
            <span className="text-emerald-400 font-semibold">
              +{quiz.correctPoints} pts
            </span>
          </span>
          <span>·</span>
          <span>
            Wrong:{" "}
            <span className="text-red-400 font-semibold">
              {quiz.wrongPoints} pts
            </span>
          </span>
          {quiz.passScore != null && (
            <>
              <span>·</span>
              <span>
                Pass at{" "}
                <span className="text-amber-400 font-semibold">
                  {quiz.passScore}%
                </span>
              </span>
            </>
          )}
        </div>

        {/* Window */}
        {(begin || end) && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            <span>
              {begin
                ? begin.toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Now"}
              {" → "}
              {end
                ? end.toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "No deadline"}
            </span>
          </div>
        )}
      </div>

      {/* Sections */}
      {quiz.sections && quiz.sections.length > 0 && (
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-4">Sections</h2>
          <div className="flex flex-col gap-2">
            {quiz.sections.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-600 w-5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white">{s.title}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{s.questionCount}q</span>
                  {s.timeLimit && <span>{s.timeLimit}m</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result if done */}
      {isDone && quiz.percentageScore != null && (
        <div
          className={`flex items-center gap-4 rounded-2xl border p-5 ${quiz.passed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black ${quiz.passed ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
          >
            {Math.round(quiz.percentageScore)}%
          </div>
          <div>
            <div
              className={`font-bold text-base ${quiz.passed ? "text-emerald-400" : "text-red-400"}`}
            >
              {quiz.passed ? "Passed!" : "Failed"}
            </div>
            <div className="text-sm text-gray-500">
              You scored {Math.round(quiz.percentageScore)}%
              {quiz.passScore ? ` (pass: ${quiz.passScore}%)` : ""}
            </div>
          </div>
          {quiz.attemptId && (
            <Link
              href={`/dashboard/results/${quiz.attemptId}`}
              className="ml-auto text-xs font-semibold bg-neutral-800 hover:bg-white/10 text-gray-300 rounded-xl px-4 py-2.5 transition"
            >
              View Results
            </Link>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-3">
        {isNotStarted && (
          <div className="flex items-center gap-2 text-sm text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-xl px-5 py-3">
            <Lock size={15} />
            Opens{" "}
            {begin!.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
        {isExpired && !isDone && (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-neutral-900 border border-white/10 rounded-xl px-5 py-3">
            <Lock size={15} />
            Quiz closed
          </div>
        )}
        {canStart && (
          <button
            onClick={handleStart}
            disabled={starting}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-black font-bold rounded-xl px-6 py-3 transition"
          >
            {starting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Play size={16} />
            )}
            {starting
              ? "Starting…"
              : isInProgress
                ? "Continue Quiz"
                : "Start Quiz"}
          </button>
        )}
        {isDone && quiz.showResultsImmediately && quiz.attemptId && (
          <Link
            href={`/dashboard/results/${quiz.attemptId}`}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-white/10 text-white font-semibold rounded-xl px-5 py-3 transition"
          >
            <CheckCircle2 size={15} />
            View Detailed Results
          </Link>
        )}
      </div>
    </div>
  );
}
