import { currentUser } from "@clerk/nextjs/server";
import { quizzesData } from "@/data/quizzes";
import QuizPageClient from "@/components/protected/quizzes/student/QuizPageClient";
import { ScanQrCode } from "lucide-react";
import Link from "next/link";

export default async function QuizPage() {
  const user = await currentUser();
  if (!user) return <div>User not found!</div>;

  return (
    <div className="h-screen overflow-x-hidden bg-background flex">
      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-white">My Quizzes</h1>
            <p className="text-sm text-gray-500 italic">
              Ready for your next challenge,{" "}
              <span className="text-white/80">{user.firstName}?</span>
            </p>
          </div>

          <Link href="/join" className="relative inline-block group">
            {/* Shockwave */}
            <span className="absolute inset-0 z-10 rounded-md pointer-events-none opacity-0 group-active:animate-wave bg-[radial-gradient(circle,rgba(255,204,0,0.35)_0%,rgba(255,204,0,0.2)_65%,transparent_70%)]" />

            {/* Button */}
            <span className="relative z-20 flex items-center gap-2 px-4 py-2 bg-amber-400 text-black font-semibold rounded-md transform-gpu origin-center transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97] hover:shadow-[0_0_24px_4px_rgba(255,204,0,0.2)]">
              <ScanQrCode />
              Join via Code
            </span>
          </Link>
        </div>

        <div className="p-8">
          <QuizPageClient quizzes={quizzesData} />
        </div>
      </main>
    </div>
  );
}
