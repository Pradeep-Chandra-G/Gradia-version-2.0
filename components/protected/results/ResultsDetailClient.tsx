"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  Loader2,
  AlertCircle,
  Trophy,
} from "lucide-react";

type AnswerDetail = {
  questionId: string;
  questionText: string;
  questionType: string;
  pointsAvailable: number;
  pointsEarned: number;
  isCorrect: boolean;
  selectedOption: string | null;
  selectedOptions: string[] | null;
  correctOptions: string[];
  optionTexts: Record<string, string>;
};

type ResultDetail = {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: string | null;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  passed: boolean;
  submittedAt: string | null;
  timeSpent: number | null;
  attemptNumber: number;
  showAnswers: boolean;
  sections: {
    id: string;
    title: string;
    answers: AnswerDetail[];
  }[];
};

function formatTime(s: number) {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
}

export default function ResultDetailPage({ attemptId }: { attemptId: string }) {
  const [result, setResult] = useState<ResultDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/student/results/${attemptId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setResult(d.result ?? d);
      })
      .catch(() => setError("Failed to load result"))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-amber-400" size={28} />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="p-6">
        <Link
          href="/dashboard/results"
          className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6"
        >
          <ChevronLeft size={15} /> Back
        </Link>
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertCircle size={18} />
          <span>{error ?? "Result not found"}</span>
        </div>
      </div>
    );
  }

  const pct = Math.round(result.percentageScore);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-3xl">
      {/* Back */}
      <Link
        href="/dashboard/results"
        className="flex items-center gap-1 text-gray-400 hover:text-white text-sm w-fit transition"
      >
        <ChevronLeft size={15} /> All Results
      </Link>

      {/* Hero */}
      <div
        className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-center gap-6 ${result.passed ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}
      >
        {/* Score circle */}
        <div
          className={`shrink-0 w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center ${result.passed ? "border-emerald-500 bg-emerald-500/10" : "border-red-500 bg-red-500/10"}`}
        >
          <span
            className={`text-2xl font-black ${result.passed ? "text-emerald-400" : "text-red-400"}`}
          >
            {pct}%
          </span>
        </div>

        <div className="flex flex-col gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            {result.passed ? (
              <Trophy size={18} className="text-amber-400" />
            ) : (
              <XCircle size={18} className="text-red-400" />
            )}
            <h1 className="text-xl font-black text-white">
              {result.passed ? "Passed!" : "Not passed"}
            </h1>
          </div>
          <p className="text-sm text-gray-400">{result.quizTitle}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap justify-center sm:justify-start">
            <span>
              {result.totalScore} / {result.maxScore} points
            </span>
            {result.timeSpent && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatTime(result.timeSpent)}
                </span>
              </>
            )}
            {result.submittedAt && (
              <>
                <span>·</span>
                <span>
                  {new Date(result.submittedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </>
            )}
            {result.attemptNumber > 1 && (
              <>
                <span>·</span>
                <span>Attempt #{result.attemptNumber}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Section breakdown */}
      {result.showAnswers &&
        result.sections.map((section) => {
          const correct = section.answers.filter((a) => a.isCorrect).length;
          const total = section.answers.length;
          return (
            <div
              key={section.id}
              className="bg-neutral-900 border border-white/8 rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
                <h2 className="text-white font-bold">{section.title}</h2>
                <span className="text-xs text-gray-500">
                  {correct}/{total} correct
                </span>
              </div>
              <div className="flex flex-col divide-y divide-white/5">
                {section.answers.map((ans, qi) => {
                  const earned = ans.pointsEarned;
                  const available = ans.pointsAvailable;
                  const isCorrect = ans.isCorrect;
                  const noAnswer =
                    ans.selectedOption === null &&
                    (!ans.selectedOptions || ans.selectedOptions.length === 0);

                  return (
                    <div
                      key={ans.questionId}
                      className={`p-5 ${isCorrect ? "bg-emerald-500/3" : noAnswer ? "" : "bg-red-500/3"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {isCorrect ? (
                            <CheckCircle2
                              size={16}
                              className="text-emerald-400"
                            />
                          ) : noAnswer ? (
                            <MinusCircle size={16} className="text-gray-600" />
                          ) : (
                            <XCircle size={16} className="text-red-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-white leading-relaxed">
                              {qi + 1}. {ans.questionText}
                            </p>
                            <span
                              className={`shrink-0 text-xs font-bold ${earned > 0 ? "text-emerald-400" : earned < 0 ? "text-red-400" : "text-gray-600"}`}
                            >
                              {earned > 0 ? "+" : ""}
                              {earned}/{available}
                            </span>
                          </div>

                          {/* Answers */}
                          <div className="mt-3 flex flex-col gap-1.5">
                            {Object.entries(ans.optionTexts).map(
                              ([optId, optText]) => {
                                const isChosen =
                                  ans.selectedOption === optId ||
                                  ans.selectedOptions?.includes(optId);
                                const isCorrectOpt =
                                  ans.correctOptions.includes(optId);

                                let style =
                                  "bg-neutral-800/50 border-white/8 text-gray-500";
                                if (isChosen && isCorrectOpt)
                                  style =
                                    "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
                                else if (isChosen && !isCorrectOpt)
                                  style =
                                    "bg-red-500/10 border-red-500/30 text-red-300";
                                else if (!isChosen && isCorrectOpt)
                                  style =
                                    "bg-emerald-500/5 border-emerald-500/20 text-emerald-500/70";

                                return (
                                  <div
                                    key={optId}
                                    className={`text-xs px-3 py-2 rounded-lg border ${style} flex items-center gap-2`}
                                  >
                                    {isChosen && isCorrectOpt && (
                                      <CheckCircle2
                                        size={11}
                                        className="text-emerald-400 shrink-0"
                                      />
                                    )}
                                    {isChosen && !isCorrectOpt && (
                                      <XCircle
                                        size={11}
                                        className="text-red-400 shrink-0"
                                      />
                                    )}
                                    {!isChosen && isCorrectOpt && (
                                      <CheckCircle2
                                        size={11}
                                        className="text-emerald-500/50 shrink-0"
                                      />
                                    )}
                                    {optText}
                                    {!isChosen && isCorrectOpt && (
                                      <span className="ml-auto text-[10px] text-emerald-500/70">
                                        Correct answer
                                      </span>
                                    )}
                                  </div>
                                );
                              },
                            )}
                          </div>

                          {noAnswer && (
                            <p className="text-xs text-gray-600 mt-2 italic">
                              Not answered
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {!result.showAnswers && (
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-6 text-center text-gray-500 text-sm">
          Detailed answer breakdown is not available for this quiz.
        </div>
      )}
    </div>
  );
}
