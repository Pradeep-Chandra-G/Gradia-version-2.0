import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AnalyticsClient from "@/components/protected/analytics/AnalyticsClient";

export default async function AnalyticsPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");
  return <AnalyticsClient />;
}
