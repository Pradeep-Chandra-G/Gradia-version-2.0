import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InstructorResultsClient from "@/components/protected/instructor/InstructorResultsClient";

export default async function InstructorResultsPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");
  return <InstructorResultsClient />;
}
