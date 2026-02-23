import QuizAttemptClient from "@/components/protected/quiz_attempt/QuizAttemptClient";
import { quizDataMap } from "@/data/quizQuestions";
import { quizzesData } from "@/data/quizzes";
import Link from "next/link";

export default async function QuizAttemptPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const quizId = resolvedSearchParams.quizId as string | undefined;

  const quiz = quizzesData.find((q) => q.id === quizId);
  const quizData = quizId ? quizDataMap[quizId] : undefined;

  if (!quiz || !quizData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white gap-4 bg-black">
        <h1 className="text-2xl font-bold">Quiz not available</h1>
        <p className="text-gray-400 text-sm">
          {quiz
            ? "This quiz has no questions configured yet."
            : "Quiz not found."}
        </p>
        <Link
          href="/dashboard/quizzes"
          className="px-4 py-2 bg-amber-400 text-black rounded-lg font-semibold"
        >
          Back to Quizzes
        </Link>
      </div>
    );
  }

  return (
    // QuizAttemptClient renders the navbar itself so the timer expiry
    // callback can cross the server/client boundary cleanly.
    <QuizAttemptClient quizData={quizData} quiz={quiz} />
  );
}
