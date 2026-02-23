import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InstructorQuizResultDetailClient from "@/components/protected/instructor/InstructorQuizResultDetailClient";

export default async function InstructorResultDetailPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");
  const { quizId } = await params;
  return <InstructorQuizResultDetailClient quizId={quizId} />;
}
