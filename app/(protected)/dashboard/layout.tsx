import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/protected/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  // Middleware handles the redirect but this is a server-side safety net
  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="h-screen flex bg-background">
      <aside className="hidden md:block w-64 shrink-0">
        <Sidebar />
      </aside>
      <main className="flex-1 overflow-y-auto no-scrollbar">{children}</main>
    </div>
  );
}
