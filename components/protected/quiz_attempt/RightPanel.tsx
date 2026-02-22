import { QuestionSeed } from "@/data/quizQuestions";

type Props = {
  questions: QuestionSeed[];
  curQuestionId?: number;
  setCurQuestionId: (id: number) => void;
};

export default function RightPanel({
  questions,
  curQuestionId,
  setCurQuestionId,
  answers,
}: {
  questions: QuestionSeed[];
  curQuestionId?: number;
  setCurQuestionId: (id: number) => void;
  answers?: Record<
    number,
    {
      selectedOption?: number;
      selectedOptions?: number[];
      markedForReview: boolean;
    }
  >;
}) {
  return (
    <div className="p-4 grid grid-cols-5 gap-2">
      {questions.map((q) => {
        const isMarked = answers?.[q.question_id]?.markedForReview;
        return (
          <button
            key={q.question_id}
            onClick={() => setCurQuestionId(q.question_id)}
            className={`p-2 rounded hover:cursor-pointer
              ${
                curQuestionId === q.question_id
                  ? "bg-amber-500 text-black"
                  : isMarked
                    ? "bg-yellow-400 text-black"
                    : "bg-neutral-800 text-white"
              }`}
          >
            {q.order}
          </button>
        );
      })}
    </div>
  );
}
