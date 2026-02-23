"use client";

import React from "react";
import UserProfile from "./UserProfile";
import { GraduationCap } from "lucide-react";
import { Quiz } from "@/data/quizzes";
import ServerTimer from "./ServerTimer";

type QuizNavbarProps = {
  quiz: Quiz;
  durationMinutes: number;
  onTimerExpire?: () => void;
};

function QuizNavbar({ quiz, durationMinutes, onTimerExpire }: QuizNavbarProps) {
  return (
    <nav className="h-16 bg-neutral-900 flex flex-row items-center justify-between border-b border-white/30 px-6 shrink-0">
      <div className="flex items-center gap-4">
        <GraduationCap
          size={36}
          className="bg-amber-400 rounded-lg p-1 border border-amber-200 shrink-0"
        />
        <div>
          <h2 className="text-base font-semibold text-white leading-tight">
            {quiz.title}
          </h2>
          <p className="text-[11px] text-gray-400">{quiz.instructor}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ServerTimer
          durationMinutes={durationMinutes}
          onExpire={onTimerExpire}
        />
        <span className="h-8 rounded-full bg-neutral-600 w-px" />
        <UserProfile />
      </div>
    </nav>
  );
}

export default QuizNavbar;
