import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InstructorQuizzesClient from "@/components/protected/instructor/InstructorQuizzesClient";

export default async function InstructorQuizzesPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");
  return <InstructorQuizzesClient />;
}
