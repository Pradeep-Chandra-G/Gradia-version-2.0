"use client";

import { QuizSeed } from "@/data/quizQuestions";
import { Quiz } from "@/data/quizzes";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import SectionContainer from "./SectionContainer";
import QuestionContainer from "./QuestionContainer";
import RightPanel from "./RightPanel";
import SubmitModal from "./SubmitModal";
import ViolationWarning from "./ViolationWarning";
import QuizNavbar from "./QuizNavbar";
import {
  ChevronLeft,
  ChevronRight,
  BookmarkCheck,
  Bookmark,
  CheckCheck,
  Check,
  LogOut,
} from "lucide-react";
import Link from "next/link";

type Props = {
  quizData: QuizSeed;
  quiz: Quiz;
};

type QuestionAnswer = {
  selectedOption: number | null;
  selectedOptions: number[];
  markedForReview: boolean;
  isSaved: boolean;
};

type AnswerState = { [questionId: number]: QuestionAnswer };

const DEFAULT_ANSWER: QuestionAnswer = {
  selectedOption: null,
  selectedOptions: [],
  markedForReview: false,
  isSaved: false,
};

export default function QuizAttemptClient({ quizData, quiz }: Props) {
  // ── Navigation ──────────────────────────────────────────────────────────
  const [curSectionId, setCurSectionId] = useState(
    quizData.sections[0]?.section_id,
  );
  const [curQuestionId, setCurQuestionId] = useState<number>(
    quizData.sections[0]?.questions[0]?.question_id ?? 1,
  );
  const [answers, setAnswers] = useState<AnswerState>({});

  // ── UI ───────────────────────────────────────────────────────────────────
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitReason, setSubmitReason] = useState<
    "manual" | "timer" | "violation"
  >("manual");

  // ── Violations ──────────────────────────────────────────────────────────
  const [violations, setViolations] = useState(0);
  const [showViolation, setShowViolation] = useState(false);
  const [violationReason, setViolationReason] = useState("");
  const MAX_VIOLATIONS = 3;
  const submittedRef = useRef(false);

  const doSubmit = useCallback(
    (reason: "manual" | "timer" | "violation") => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitReason(reason);
      setShowSubmitModal(false);
      setShowViolation(false);
      setSubmitted(true);
      // Clear the session timer so it resets on next attempt
      sessionStorage.removeItem(`quiz_timer_end_${quiz.duration}`);
    },
    [quiz.duration],
  );

  const handleViolation = useCallback(
    (reason: string) => {
      if (submittedRef.current) return;
      setViolations((prev) => {
        const next = prev + 1;
        setViolationReason(reason);
        setShowViolation(true);
        if (next >= MAX_VIOLATIONS) {
          setTimeout(() => doSubmit("violation"), 2500);
        }
        return next;
      });
    },
    [doSubmit],
  );

  // ── Tab visibility ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      if (document.hidden)
        handleViolation("You switched tabs or minimised the window.");
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [handleViolation]);

  // ── Fullscreen ──────────────────────────────────────────────────────────
  const reRequestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement)
        await document.documentElement.requestFullscreen();
    } catch {
      /* denied */
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement && !submittedRef.current) {
        handleViolation("You exited fullscreen mode.");
        reRequestFullscreen();
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [handleViolation, reRequestFullscreen]);

  // ── Block copy / right-click / shortcuts ─────────────────────────────────
  useEffect(() => {
    const onCtx = (e: MouseEvent) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey &&
          ["c", "v", "u", "a", "s", "p"].includes(e.key.toLowerCase())) ||
        e.key === "F12" ||
        (e.altKey && e.key === "Tab")
      )
        e.preventDefault();
    };
    document.addEventListener("contextmenu", onCtx);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────
  const curSection = useMemo(
    () => quizData.sections.find((s) => s.section_id === curSectionId),
    [quizData.sections, curSectionId],
  );
  const curQuestion = useMemo(
    () => curSection?.questions.find((q) => q.question_id === curQuestionId),
    [curSection, curQuestionId],
  );

  if (!curSection || !curQuestion) return null;

  const curAnswer: QuestionAnswer =
    answers[curQuestion.question_id] ?? DEFAULT_ANSWER;
  const curIdx = curSection.questions.findIndex(
    (q) => q.question_id === curQuestion.question_id,
  );
  const isFirst = curIdx === 0;
  const isLast = curIdx === curSection.questions.length - 1;
  const isAnswered =
    curQuestion.questionType === "MCQ"
      ? curAnswer.selectedOptions.length > 0
      : curAnswer.selectedOption !== null;

  // ── Answer handlers ─────────────────────────────────────────────────────
  const handleSingleChange = (optionId: number | null) => {
    setAnswers((prev) => ({
      ...prev,
      [curQuestion.question_id]: {
        ...(prev[curQuestion.question_id] ?? DEFAULT_ANSWER),
        selectedOption: optionId,
        isSaved: false,
      },
    }));
  };
  const handleMultiChange = (optionIds: number[]) => {
    setAnswers((prev) => ({
      ...prev,
      [curQuestion.question_id]: {
        ...(prev[curQuestion.question_id] ?? DEFAULT_ANSWER),
        selectedOptions: optionIds,
        isSaved: false,
      },
    }));
  };
  const handleSave = () => {
    setAnswers((prev) => ({
      ...prev,
      [curQuestion.question_id]: {
        ...(prev[curQuestion.question_id] ?? DEFAULT_ANSWER),
        isSaved: true,
      },
    }));
  };
  const handlePrevious = () => {
    if (curIdx > 0)
      setCurQuestionId(curSection.questions[curIdx - 1].question_id);
  };
  const handleNext = () => {
    if (curIdx < curSection.questions.length - 1)
      setCurQuestionId(curSection.questions[curIdx + 1].question_id);
  };
  const handleSaveAndNext = () => {
    if (isAnswered) handleSave();
    handleNext();
  };
  const toggleMarkForReview = () => {
    setAnswers((prev) => ({
      ...prev,
      [curQuestion.question_id]: {
        ...(prev[curQuestion.question_id] ?? DEFAULT_ANSWER),
        markedForReview: !curAnswer.markedForReview,
      },
    }));
  };

  // ── Score computation ────────────────────────────────────────────────────
  const computeResults = () => {
    let score = 0;
    let maxScore = 0;
    const breakdown: {
      questionId: number;
      questionText: string;
      correct: boolean;
      pointsEarned: number;
      points: number;
      explanation?: string;
    }[] = [];

    quizData.sections.forEach((section) => {
      section.questions.forEach((q) => {
        maxScore += q.points;
        const ans = answers[q.question_id] ?? DEFAULT_ANSWER;
        let correct = false;

        if (q.questionType === "MCQ") {
          const correctIds =
            q.options?.filter((o) => o.isCorrect).map((o) => o.optionId) ?? [];
          correct =
            correctIds.length === ans.selectedOptions.length &&
            correctIds.every((id) => ans.selectedOptions.includes(id));
        } else {
          const correctOpt = q.options?.find((o) => o.isCorrect);
          correct = correctOpt?.optionId === ans.selectedOption;
        }

        const earned = correct ? q.points : 0;
        score += earned;
        breakdown.push({
          questionId: q.question_id,
          questionText: q.questionText,
          correct,
          pointsEarned: earned,
          points: q.points,
          explanation: q.explanation,
        });
      });
    });

    return { score, maxScore, breakdown };
  };

  // ── Results screen ────────────────────────────────────────────────────────
  if (submitted) {
    const { score, maxScore, breakdown } = computeResults();
    const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = pct >= 60;

    return (
      <div className="flex flex-col h-screen bg-black text-white">
        {/* Slim results header */}
        <div className="shrink-0 h-14 bg-neutral-900 border-b border-white/10 flex items-center px-8 gap-3">
          <span className="text-sm text-gray-400">Results for</span>
          <span className="text-sm font-semibold text-white">{quiz.title}</span>
          {submitReason !== "manual" && (
            <span className="ml-auto text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-full">
              {submitReason === "timer"
                ? "⏱ Time expired"
                : "⚠ Auto-submitted: violations"}
            </span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {/* Score card */}
            <div
              className={`rounded-2xl p-8 border text-center ${
                passed
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div
                className={`text-7xl font-black mb-2 ${passed ? "text-emerald-400" : "text-red-400"}`}
              >
                {pct}%
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {passed ? "🎉 Passed!" : "❌ Not Passed"}
              </div>
              <div className="text-gray-400 text-sm">
                {score} / {maxScore} points
              </div>
              <div className="mt-4 w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${passed ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Stat row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-neutral-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {breakdown.length}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Total Questions
                </div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {breakdown.filter((b) => b.correct).length}
                </div>
                <div className="text-xs text-emerald-500 mt-1">Correct</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {breakdown.filter((b) => !b.correct).length}
                </div>
                <div className="text-xs text-red-500 mt-1">Incorrect</div>
              </div>
            </div>

            {/* Breakdown */}
            <h2 className="text-lg font-bold">Answer Breakdown</h2>
            <div className="flex flex-col gap-3">
              {breakdown.map((item, i) => (
                <div
                  key={item.questionId}
                  className={`rounded-xl p-5 border ${
                    item.correct
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm text-white">
                      <span className="text-gray-500 mr-2">Q{i + 1}.</span>
                      {item.questionText}
                    </p>
                    <span
                      className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${
                        item.correct
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {item.correct ? `+${item.pointsEarned}` : "0"} /{" "}
                      {item.points}
                    </span>
                  </div>
                  {item.explanation && (
                    <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-white/5">
                      💡 {item.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center pb-8">
              <Link
                href="/dashboard/quizzes"
                className="inline-block px-8 py-3 bg-amber-400 text-black font-bold rounded-xl hover:bg-amber-300 transition"
              >
                Back to My Quizzes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz attempt UI ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen text-white overflow-hidden bg-black">
      {/* Navbar owns the timer so onExpire can trigger submit */}
      <QuizNavbar
        quiz={quiz}
        durationMinutes={quiz.duration}
        onTimerExpire={() => doSubmit("timer")}
      />

      {/* Violation overlay */}
      {showViolation && (
        <ViolationWarning
          reason={violationReason}
          current={violations}
          max={MAX_VIOLATIONS}
          onDismiss={() => setShowViolation(false)}
        />
      )}

      {/* Submit modal */}
      {showSubmitModal && (
        <SubmitModal
          quizData={quizData}
          answers={answers}
          onConfirm={() => doSubmit("manual")}
          onCancel={() => setShowSubmitModal(false)}
        />
      )}

      <div className="flex flex-1 min-h-0 w-full">
        {/* LEFT PANEL */}
        <div className="flex flex-col w-3/4 min-h-0 border-r border-white/30 p-2 relative">
          <SectionContainer
            sections={quizData.sections}
            curSectionId={curSectionId}
            setCurSectionId={(id) => {
              setCurSectionId(id);
              const section = quizData.sections.find(
                (s) => s.section_id === id,
              );
              if (section?.questions[0])
                setCurQuestionId(section.questions[0].question_id);
            }}
          />

          <div className="flex-1 overflow-y-auto no-scrollbar p-2 pb-28">
            <QuestionContainer
              question={curQuestion}
              selectedOption={curAnswer.selectedOption}
              selectedOptions={curAnswer.selectedOptions}
              onSingleChange={handleSingleChange}
              onMultiChange={handleMultiChange}
            />
          </div>

          {/* ── Action Bar ── */}
          <div className="absolute bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur-md border-t border-white/10 px-5 py-3 flex items-center justify-between gap-3">
            <button
              onClick={handlePrevious}
              disabled={isFirst}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-gray-300 text-sm font-medium
                hover:border-white/25 hover:text-white hover:bg-neutral-800
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-150"
            >
              <ChevronLeft
                size={16}
                className="transition-transform duration-150 group-hover:-translate-x-0.5"
              />
              Prev
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMarkForReview}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150
                  ${
                    curAnswer.markedForReview
                      ? "bg-amber-400/15 border-amber-400/50 text-amber-300 hover:bg-amber-400/20"
                      : "bg-neutral-900 border-white/10 text-gray-400 hover:border-amber-400/40 hover:text-amber-300 hover:bg-amber-400/5"
                  }`}
              >
                {curAnswer.markedForReview ? (
                  <BookmarkCheck size={15} className="shrink-0" />
                ) : (
                  <Bookmark size={15} className="shrink-0" />
                )}
                {curAnswer.markedForReview ? "Marked" : "Review"}
              </button>

              <span className="w-px h-6 bg-white/10 rounded-full" />

              <button
                onClick={handleSave}
                disabled={!isAnswered || curAnswer.isSaved}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150
                  ${
                    curAnswer.isSaved
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default"
                      : isAnswered
                        ? "bg-emerald-500 border-emerald-400 text-black hover:bg-emerald-400 active:scale-95"
                        : "bg-neutral-900 border-white/5 text-neutral-600 cursor-not-allowed"
                  }`}
              >
                {curAnswer.isSaved ? (
                  <>
                    <CheckCheck size={15} className="shrink-0" /> Saved
                  </>
                ) : (
                  <>
                    <Check size={15} className="shrink-0" /> Save
                  </>
                )}
              </button>

              <span className="w-px h-6 bg-white/10 rounded-full" />

              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-red-500/40 bg-red-500/10 text-red-400
                  hover:bg-red-500/20 hover:border-red-500/60 transition-all duration-150"
              >
                <LogOut size={15} className="shrink-0" />
                Submit
              </button>
            </div>

            <button
              onClick={handleSaveAndNext}
              disabled={isLast}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-gray-300 text-sm font-medium
                hover:border-white/25 hover:text-white hover:bg-neutral-800
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-150"
            >
              Next
              <ChevronRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-1/4 min-h-0">
          <RightPanel
            questions={curSection.questions}
            curQuestionId={curQuestion.question_id}
            setCurQuestionId={setCurQuestionId}
            answers={answers}
          />
        </div>
      </div>
    </div>
  );
}
