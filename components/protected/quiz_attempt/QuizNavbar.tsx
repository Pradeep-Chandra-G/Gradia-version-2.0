import React from "react";
import Timer from "./Timer";
import UserProfile from "./UserProfile";
import { GraduationCap, LogOut } from "lucide-react";
import { Quiz } from "@/data/quizzes";

type QuizNavbarProps = {
  quiz: Quiz;
};

function QuizNavbar({ quiz }: QuizNavbarProps) {
  return (
    <nav className="h-16 bg-neutral-900 flex flex-row items-center justify-between border-b border-white/30 px-6">
      {/* Quiz title */}
      <div className="flex flex-row">
        {/* Gradia Icon */}
        <div className="flex items-center gap-4">
          <GraduationCap
            size={36}
            className="bg-amber-400 rounded-lg p-1 border border-amber-200"
          />
          <div>
            <h2 className="text-lg text-white">{quiz.title}</h2>
            <p className="text-[12px] text-gray-400">{quiz.instructor}</p>
          </div>
        </div>
      </div>

      {/* Timer & User profile */}
      <div className="flex flex-row items-center">
        {/* Timer & User profile */}
        <div className="flex flex-row items-center justify-around gap-4">
          {/* Timer */}
          {/* Requires wiring up to server timer. */}
          <div className="">
            <Timer start_time={new Date().toISOString()} duration="61" />
          </div>

          {/* Divider */}
          <span className="h-8 rounded-full bg-neutral-600 w-0.5"></span>

          {/* User Profile */}
          <div className="flex flex-row items-center justify-between gap-8">
            <UserProfile />
            <button className="flex flex-row gap-2 items-center justify-center px-2 py-2 border font-bold text-red-600 rounded-lg bg-red-600/10 border-red-500 hover:cursor-pointer">
              <h1>Submit Exam</h1>
              <LogOut />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default QuizNavbar;
