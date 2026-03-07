import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import QuizAttemptClient from "@/components/protected/quiz_attempt/QuizAttemptClient";

export default async function QuizAttemptPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");

  // QuizAttemptClient reads attemptId / quizId from searchParams itself via useSearchParams()
  // No props needed — the component handles all data fetching from the API
  return <QuizAttemptClient />;
}
