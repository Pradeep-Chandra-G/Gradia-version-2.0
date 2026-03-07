import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import QuizDetailPage from "@/components/protected/quizzes/student/QuizDetailPage";

type QuizParams = {
  params: Promise<{ id: string }>;
};

export default async function QuizTakingPage({ params }: QuizParams) {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");

  const { id: quizId } = await params;

  return (
    <div className="min-h-screen bg-background text-white">
      <QuizDetailPage quizId={quizId} />
    </div>
  );
}
