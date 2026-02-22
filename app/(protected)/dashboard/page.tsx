import CoreStats from "@/components/protected/CoreStats";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return <div>User not found!</div>;
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex">
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black tracking-normal text-white">
              Welcome, {user.firstName} {user.lastName}
            </h1>
          </div>
        </div>

        <CoreStats />
      </main>
    </div>
  );
}
