import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import StudentDashboard from "@/components/protected/dashboard/StudentDashboard";
import InstructorDashboard from "@/components/protected/dashboard/InstructorDashboard";
import AdminDashboard from "@/components/protected/dashboard/AdminDashboard";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/auth/sign-in");

  const role = user.publicMetadata?.role as string | undefined;

  // Role is assigned by the Clerk webhook on sign-up.
  // Default to STUDENT if somehow unset (shouldn't happen after webhook runs).
  const resolvedRole = role ?? "STUDENT";

  return (
    <div className="min-h-screen bg-background">
      {resolvedRole === "ADMIN" && (
        <AdminDashboard firstName={user.firstName ?? "Admin"} />
      )}
      {resolvedRole === "INSTRUCTOR" && (
        <InstructorDashboard firstName={user.firstName ?? "Instructor"} />
      )}
      {resolvedRole === "STUDENT" && (
        <StudentDashboard firstName={user.firstName ?? "Student"} />
      )}
      {/* Safety net: if role is somehow something unexpected */}
      {!["ADMIN", "INSTRUCTOR", "STUDENT"].includes(resolvedRole) && (
        <StudentDashboard firstName={user.firstName ?? "User"} />
      )}
    </div>
  );
}
