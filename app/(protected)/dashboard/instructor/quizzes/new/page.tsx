import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InstructorQuizBuilderClient from "@/components/protected/instructor/InstructorQuizBuilderClient";

export default async function InstructorQuizNewPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");
  return <InstructorQuizBuilderClient />;
}
