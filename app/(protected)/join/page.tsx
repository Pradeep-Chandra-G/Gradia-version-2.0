import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import JoinPage from "@/components/protected/join/JoinPage";

export default async function JoinRoute() {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");
  return <JoinPage />;
}