"use client";

import { QuizSeed } from "@/data/quizQuestions";

type AnswerEntry = {
  selectedOption: number | null;
  selectedOptions: number[];
  markedForReview: boolean;
  isSaved: boolean;
};

type Props = {
  quizData: QuizSeed;
  answers: Record<number, AnswerEntry>;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function SubmitModal({
  quizData,
  answers,
  onConfirm,
  onCancel,
}: Props) {
  // Compute summary across all sections
  let total = 0;
  let answered = 0;
  let saved = 0;
  let forReview = 0;

  quizData.sections.forEach((section) => {
    section.questions.forEach((q) => {
      total++;
      const ans = answers[q.question_id];
      const isAnswered =
        q.questionType === "MCQ"
          ? (ans?.selectedOptions?.length ?? 0) > 0
          : ans?.selectedOption != null;
      if (isAnswered) answered++;
      if (ans?.isSaved) saved++;
      if (ans?.markedForReview) forReview++;
    });
  });

  const unanswered = total - answered;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="bg-neutral-950 border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Submit Quiz?</h2>
          <p className="text-gray-400 text-sm">
            Once submitted, you cannot change your answers.
          </p>
        </div>

        {/* Summary grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-900 rounded-xl p-4 border border-white/5">
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-xs text-gray-400 mt-0.5">Total Questions</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
            <div className="text-2xl font-bold text-emerald-400">{saved}</div>
            <div className="text-xs text-emerald-500 mt-0.5">Saved</div>
          </div>
          <div className="bg-amber-400/10 rounded-xl p-4 border border-amber-400/20">
            <div className="text-2xl font-bold text-amber-300">{forReview}</div>
            <div className="text-xs text-amber-400 mt-0.5">For Review</div>
          </div>
          <div
            className={`rounded-xl p-4 border ${unanswered > 0 ? "bg-red-500/10 border-red-500/20" : "bg-neutral-900 border-white/5"}`}
          >
            <div
              className={`text-2xl font-bold ${unanswered > 0 ? "text-red-400" : "text-gray-400"}`}
            >
              {unanswered}
            </div>
            <div
              className={`text-xs mt-0.5 ${unanswered > 0 ? "text-red-500" : "text-gray-500"}`}
            >
              Unanswered
            </div>
          </div>
        </div>

        {unanswered > 0 && (
          <p className="text-amber-300 text-xs bg-amber-400/5 border border-amber-400/20 rounded-lg px-3 py-2">
            ⚠ You have {unanswered} unanswered question
            {unanswered !== 1 ? "s" : ""}. These will be marked as incorrect.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-gray-300 text-sm font-medium hover:bg-neutral-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 active:scale-95 transition"
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
