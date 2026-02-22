import QuizNavbar from "@/components/protected/quiz_attempt/QuizNavbar";
import QuizAttemptClient from "@/components/protected/quiz_attempt/QuizAttemptClient";
import { quiz1 } from "@/data/quizQuestions";
import { quizzesData } from "@/data/quizzes";

export default async function QuizAttemptPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const quizId = resolvedSearchParams.quizId;
  const quiz = quizzesData.find((quiz) => quiz.id === quizId);

  if (!quiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <div className="flex flex-col h-screen text-white overflow-hidden">
      <QuizNavbar quiz={quiz} />

      <QuizAttemptClient quizData={quiz1} />
    </div>
  );
}
