import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InstructorBatchDetailClient from "@/components/protected/instructor/InstructorBatchDetailClient";

export default async function InstructorBatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");
  const { id } = await params;
  return <InstructorBatchDetailClient batchId={id} />;
}
