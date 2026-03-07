import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ResultDetailPage from "@/components/protected/results/ResultsDetailClient";

export default async function ResultsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");

  const { id: attemptId } = await params;

  return (
    <div className="min-h-screen bg-background text-white">
      <ResultDetailPage attemptId={attemptId} />
    </div>
  );
}
