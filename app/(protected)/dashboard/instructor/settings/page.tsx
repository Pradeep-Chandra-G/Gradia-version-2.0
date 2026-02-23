import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import InstructorSettingsClient from "@/components/protected/instructor/InstructorSettingsClient";

export default async function InstructorSettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");
  return <InstructorSettingsClient />;
}
