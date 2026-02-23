import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ResultsClient from "@/components/protected/results/ResultsClient";

export default async function ResultsPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");

  return <ResultsClient firstName={user.firstName ?? "Student"} />;
}
