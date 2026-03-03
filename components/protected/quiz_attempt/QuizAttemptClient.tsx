"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Send,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Option = {
  id: string;
  text: string;
  order: number;
};

type Question = {
  id: string;
  text: string;
  questionType: "SINGLE_OPTION" | "MCQ" | "TRUE_FALSE";
  points: number;
  order: number;
  options: Option[];
};

type Section = {
  id: string;
  title: string;
  timeLimit: number | null;
  questions: Question[];
};

type Quiz = {
  id: string;
  title: string;
  totalTimeLimit: number | null;
  correctPoints: number;
  wrongPoints: number;
  sections: Section[];
};

type Answer = {
  questionId: string;
  optionId?: string;
  selectedOptions?: string[];
};

// ─── Timer ───────────────────────────────────────────────────────────────────

function useTimer(totalSeconds: number | null, onExpire: () => void) {
  const [remaining, setRemaining] = useState<number | null>(totalSeconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (remaining === null) return;
    if (remaining <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire();
      return;
    }
    const t = setTimeout(
      () => setRemaining((r) => (r !== null ? r - 1 : null)),
      1000,
    );
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return { remaining, display: remaining !== null ? fmt(remaining) : null };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function QuizAttemptClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const quizId = searchParams.get("quizId"); // fallback if coming directly

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loadedAttemptId, setLoadedAttemptId] = useState<string | null>(
    attemptId,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    totalScore: number;
    maxScore: number;
    percentageScore: number;
    passed: boolean;
    showResultsImmediately: boolean;
  } | null>(null);

  // Flat list of all questions across sections
  const [allQuestions, setAllQuestions] = useState<
    (Question & { sectionTitle: string })[]
  >([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const startTimeRef = useRef<number>(Date.now());

  // Load quiz — if attemptId given use it; else start new attempt
  useEffect(() => {
    if (!attemptId && !quizId) {
      setError("No quiz specified");
      setLoading(false);
      return;
    }

    const loadQuiz = async () => {
      try {
        let resolvedAttemptId = attemptId;
        let quizData: Quiz;

        if (!resolvedAttemptId && quizId) {
          // Start a new attempt
          const res = await fetch("/api/quiz_attempt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quizId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed to start attempt");
          resolvedAttemptId = data.attemptId;
          quizData = data.quiz;
          setLoadedAttemptId(resolvedAttemptId);
          // Update URL without reload
          window.history.replaceState(
            {},
            "",
            `/quiz_attempt?attemptId=${resolvedAttemptId}`,
          );
        } else {
          // Fetch quiz via attempt — we need a way to get quiz from attemptId
          // Use GET /api/quiz_attempt/[id]
          const res = await fetch(`/api/quiz_attempt/${resolvedAttemptId}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Failed to load attempt");
          quizData = data.quiz;
        }

        setQuiz(quizData);

        // Flatten questions
        const flat: (Question & { sectionTitle: string })[] = [];
        for (const section of quizData.sections) {
          for (const q of section.questions) {
            flat.push({ ...q, sectionTitle: section.title });
          }
        }
        setAllQuestions(flat);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [attemptId, quizId]);

  const handleSubmit = useCallback(async () => {
    if (!loadedAttemptId || submitting) return;
    setSubmitting(true);
    setError(null);

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const answersPayload = Array.from(answers.values());

    try {
      const res = await fetch(`/api/quiz_attempt/${loadedAttemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersPayload, timeSpent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to submit");
      setResult(data);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }, [loadedAttemptId, answers, submitting]);

  const { display: timerDisplay, remaining } = useTimer(
    quiz?.totalTimeLimit ? quiz.totalTimeLimit * 60 : null,
    handleSubmit,
  );

  const setAnswer = (
    questionId: string,
    answer: Omit<Answer, "questionId">,
  ) => {
    setAnswers((prev) =>
      new Map(prev).set(questionId, { questionId, ...answer }),
    );
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
      <div className="p-6 max-w-xl">
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-gray-400 hover:text-white flex items-center gap-1"
        >
          <ChevronLeft size={14} /> Go back
        </button>
      </div>
    );
  }

  // ── Submitted / result screen ───────────────────────────────────────────────
  if (submitted && result) {
    const pct = Math.round(result.percentageScore);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 gap-6">
        <div
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 ${result.passed ? "border-emerald-500 bg-emerald-500/10" : "border-red-500 bg-red-500/10"}`}
        >
          <span
            className={`text-3xl font-black ${result.passed ? "text-emerald-400" : "text-red-400"}`}
          >
            {pct}%
          </span>
          <span
            className={`text-xs font-medium ${result.passed ? "text-emerald-500" : "text-red-500"}`}
          >
            {result.passed ? "Passed" : "Failed"}
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black text-white">Quiz Submitted!</h2>
          <p className="text-gray-400 mt-2">
            You scored {result.totalScore} / {result.maxScore} points
          </p>
        </div>
        <div className="flex gap-3">
          {result.showResultsImmediately && loadedAttemptId && (
            <button
              onClick={() =>
                router.push(`/dashboard/results/${loadedAttemptId}`)
              }
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold rounded-xl px-6 py-3 transition"
            >
              <CheckCircle2 size={16} /> View Results
            </button>
          )}
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-white/10 text-white font-semibold rounded-xl px-6 py-3 transition"
          >
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || allQuestions.length === 0) return null;

  const current = allQuestions[currentIdx];
  const currentAnswer = answers.get(current.id);
  const answered = answers.size;
  const total = allQuestions.length;
  const progressPct = (answered / total) * 100;

  const isLast = currentIdx === allQuestions.length - 1;
  const timerWarning = remaining !== null && remaining < 60;

  return (
    <div className="flex flex-col h-full min-h-screen bg-neutral-950">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur border-b border-white/8 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-white font-bold text-sm truncate">
            {quiz.title}
          </h1>
          <p className="text-xs text-gray-500">
            Question {currentIdx + 1} of {total} · {answered} answered
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {timerDisplay && (
            <div
              className={`flex items-center gap-1.5 font-mono font-bold text-sm px-3 py-1.5 rounded-xl border ${timerWarning ? "text-red-400 bg-red-500/10 border-red-500/30 animate-pulse" : "text-amber-400 bg-amber-400/10 border-amber-400/20"}`}
            >
              <Clock size={13} />
              {timerDisplay}
            </div>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-1 bg-neutral-900">
        <div
          className="h-full bg-amber-400 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── Question ── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 max-w-3xl mx-auto w-full">
        {/* Section label */}
        <p className="text-xs text-gray-600 font-medium uppercase tracking-wider mb-2">
          {current.sectionTitle}
        </p>

        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between gap-3 mb-6">
            <p className="text-white text-base leading-relaxed">
              {current.text}
            </p>
            <span className="shrink-0 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5 font-semibold">
              {current.points}pt{current.points !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-2">
            {current.options.map((opt) => {
              const isMCQ = current.questionType === "MCQ";
              const isSelected = isMCQ
                ? (currentAnswer?.selectedOptions?.includes(opt.id) ?? false)
                : currentAnswer?.optionId === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (isMCQ) {
                      const prev = currentAnswer?.selectedOptions ?? [];
                      const next = prev.includes(opt.id)
                        ? prev.filter((id) => id !== opt.id)
                        : [...prev, opt.id];
                      setAnswer(current.id, { selectedOptions: next });
                    } else {
                      setAnswer(current.id, { optionId: opt.id });
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${
                    isSelected
                      ? "bg-amber-400/10 border-amber-400/60 text-amber-300 font-medium"
                      : "bg-neutral-800/50 border-white/8 text-gray-300 hover:border-white/20 hover:bg-neutral-800"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-${isMCQ ? "sm" : "full"} border mr-3 text-xs font-bold flex-shrink-0 ${
                      isSelected
                        ? "bg-amber-400 border-amber-400 text-black"
                        : "border-gray-600"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {current.questionType === "MCQ" && (
            <p className="text-xs text-gray-600 mt-3">Select all that apply</p>
          )}
        </div>

        {/* Question navigator */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {allQuestions.map((q, i) => {
            const isAns = answers.has(q.id);
            const isCurr = i === currentIdx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                  isCurr
                    ? "bg-amber-400 text-black"
                    : isAns
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-neutral-800 text-gray-500 hover:bg-neutral-700"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm mb-4">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 text-sm font-semibold text-gray-400 hover:text-white disabled:opacity-30 transition px-3 py-2"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-black font-bold rounded-xl px-6 py-3 transition"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
              {submitting
                ? "Submitting…"
                : `Submit Quiz (${answered}/${total} answered)`}
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentIdx((i) => Math.min(allQuestions.length - 1, i + 1))
              }
              className="flex items-center gap-1 text-sm font-semibold text-amber-400 hover:text-amber-300 transition px-3 py-2"
            >
              Next <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
