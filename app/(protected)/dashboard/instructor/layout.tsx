import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");

  const role = user.publicMetadata?.role as string | undefined;
  if (role !== "INSTRUCTOR" && role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
