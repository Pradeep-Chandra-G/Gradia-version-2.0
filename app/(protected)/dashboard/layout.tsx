import { currentUser, auth } from "@clerk/nextjs/server";
import Sidebar from "@/components/protected/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="h-screen flex bg-background">
      <aside className="hidden md:block w-64 shrink-0">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
