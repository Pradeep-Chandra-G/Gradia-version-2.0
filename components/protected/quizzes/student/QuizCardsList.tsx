import QuizCard from "./QuizCard";
import { Quiz } from "@/data/quizzes";

type Props = {
  quizzes: Quiz[];
};

export default function QuizCardsList({ quizzes }: Props) {
  if (!quizzes.length) {
    return (
      <div className="text-gray-400 text-center py-12">No quizzes found.</div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  );
}
