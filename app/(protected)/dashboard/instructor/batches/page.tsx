import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InstructorBatchesClient from "@/components/protected/instructor/InstructorBatchesClient";

export default async function InstructorBatchesPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");
  return <InstructorBatchesClient />;
}
