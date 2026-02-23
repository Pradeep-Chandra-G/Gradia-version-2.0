import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InstructorAnalyticsClient from "@/components/protected/instructor/InstructorAnalyticsClient";

export default async function InstructorAnalyticsPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");
  return <InstructorAnalyticsClient />;
}
