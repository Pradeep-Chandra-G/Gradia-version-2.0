import { QuestionSeed } from "@/data/quizQuestions";

type AnswerEntry = {
  selectedOption: number | null;
  selectedOptions: number[];
  markedForReview: boolean;
  isSaved: boolean;
};

type Props = {
  questions: QuestionSeed[];
  curQuestionId?: number;
  setCurQuestionId: (id: number) => void;
  answers?: Record<number, AnswerEntry>;
};

export default function RightPanel({
  questions,
  curQuestionId,
  setCurQuestionId,
  answers,
}: Props) {
  const savedCount = questions.filter(
    (q) => answers?.[q.question_id]?.isSaved,
  ).length;

  const reviewCount = questions.filter(
    (q) => answers?.[q.question_id]?.markedForReview,
  ).length;

  const notAnsweredCount = questions.filter((q) => {
    const ans = answers?.[q.question_id];
    const isAnswered =
      q.questionType === "MCQ"
        ? (ans?.selectedOptions?.length ?? 0) > 0
        : ans?.selectedOption != null;
    return !isAnswered;
  }).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Scrollable top section */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        {/* Legend */}
        <div className="mb-4 flex flex-wrap items-center justify-between text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-sm bg-amber-500 inline-block" />{" "}
            Current
          </span>
          <span className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-sm bg-green-600 inline-block" />{" "}
            Saved
          </span>
          <span className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-sm bg-yellow-400 inline-block" />{" "}
            Review
          </span>
          <span className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-sm bg-neutral-800 inline-block" />{" "}
            Not visited
          </span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {questions.map((q) => {
            const ans = answers?.[q.question_id];
            const isCurrent = curQuestionId === q.question_id;
            const isMarked = ans?.markedForReview;
            const isSaved = ans?.isSaved;
            const isAnswered =
              q.questionType === "MCQ"
                ? (ans?.selectedOptions?.length ?? 0) > 0
                : ans?.selectedOption != null;

            let className =
              "p-2 rounded text-sm font-medium transition-colors hover:cursor-pointer ";

            if (isCurrent) {
              className += "bg-amber-500 text-black";
            } else if (isMarked) {
              className += "bg-yellow-400 text-black";
            } else if (isSaved) {
              className += "bg-green-600 text-white";
            } else if (isAnswered) {
              className += "bg-green-800 text-white";
            } else {
              className += "bg-neutral-800 text-white hover:bg-neutral-700";
            }

            return (
              <button
                key={q.question_id}
                onClick={() => setCurQuestionId(q.question_id)}
                className={className}
                title={
                  isSaved
                    ? "Saved"
                    : isAnswered
                      ? "Answered (unsaved)"
                      : isMarked
                        ? "Marked for review"
                        : "Not answered"
                }
              >
                {q.order}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky summary pinned to bottom */}
      <div className="shrink-0 border-t border-white/30 p-4 bg-neutral-950">
        <p className="text-sm font-semibold uppercase tracking-widest text-white mb-3">
          Summary
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-900 rounded-xl p-3 flex flex-col gap-1 border border-white/5">
            <span className="text-2xl font-bold text-white">
              {questions.length}
            </span>
            <span className="text-xs text-gray-400">Total</span>
          </div>

          <div className="bg-green-600/10 rounded-xl p-3 flex flex-col gap-1 border border-green-600/20">
            <span className="text-2xl font-bold text-green-400">
              {savedCount}
            </span>
            <span className="text-xs text-green-500">Saved</span>
          </div>

          <div className="bg-yellow-400/10 rounded-xl p-3 flex flex-col gap-1 border border-yellow-400/20">
            <span className="text-2xl font-bold text-yellow-300">
              {reviewCount}
            </span>
            <span className="text-xs text-yellow-400">For Review</span>
          </div>

          <div className="bg-neutral-800/60 rounded-xl p-3 flex flex-col gap-1 border border-white/5">
            <span className="text-2xl font-bold text-gray-400">
              {notAnsweredCount}
            </span>
            <span className="text-xs text-gray-500">Unanswered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
