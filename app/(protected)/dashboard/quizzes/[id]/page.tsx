import React from "react";
import { quizzesData } from "@/data/quizzes";
import {
  CalendarCheck,
  Check,
  ListChecks,
  NotepadTextDashed,
  PenTool,
  SquareLibrary,
  Timer,
  X,
} from "lucide-react";
import Link from "next/link";
import StartAssessmentButton from "@/components/protected/quizzes/student/StartAssessmentButton";

type QuizParams = {
  params: Promise<{ id: string }>;
};

async function QuizTakingPage({ params }: QuizParams) {
  // Await params in Next.js 15+
  const { id: quizId } = await params;

  const quiz = quizzesData.find((q) => q.id === quizId);

  if (!quiz) {
    return (
      <div className="flex min-h-screen flex-col text-white items-center justify-center text-center px-6">
        <h1 className="text-3xl font-semibold">
          Quiz with ID <span className="text-red-400">{quizId}</span>{" "}
          doesn&apos;t exist or is not available to you.
        </h1>
        <p className="mt-2 text-gray-400">
          Please contact your organisation admin for more info.
        </p>
      </div>
    );
  }
  const status = quiz.status.replace("_", " ");

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="flex flex-col px-2 py-10 gap-10 w-full max-w-6xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <h1 className="text-5xl font-bold tracking-tight">{quiz.title}</h1>
            <p className="text-gray-400 text-lg">
              By{" "}
              <span className="text-amber-400 font-medium">
                {quiz.instructor}
              </span>
            </p>
          </div>

          {/* STATUS */}
          <span>
            {status === "GRADE AVAILABLE" ? (
              <span className="text-emerald-400 bg-emerald-400/10 border border-emerald-400/40 px-6 py-1 rounded-full text-sm font-medium">
                {status}
              </span>
            ) : status === "COMPLETED" ? (
              <span className="text-gray-400 bg-gray-400/10 border border-gray-400/40 px-6 py-1 rounded-full text-sm font-medium">
                {status}
              </span>
            ) : (
              <span className="text-amber-400 bg-amber-400/10 border border-amber-400/40 px-6 py-1 rounded-full text-sm font-medium">
                {status}
              </span>
            )}
          </span>
        </div>

        {/* ================= TOP SECTION ================= */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* DETAILS CARD */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Timer size={20} />
              <div>
                <p className="text-xs uppercase text-gray-500">Duration</p>
                <p className="text-lg font-medium">{quiz.duration} mins</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotepadTextDashed size={20} />
              <div>
                <p className="text-xs uppercase text-gray-500">Category</p>
                <p className="text-lg font-medium">{quiz.course}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <CalendarCheck size={20} />
              <div>
                <p className="text-xs uppercase text-gray-500">Date</p>
                <p className="text-lg font-medium">{quiz.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Check size={20} className="text-green-400" />
              <div>
                <p className="text-xs uppercase text-gray-500">
                  Correct Answer
                </p>
                <p className="text-lg font-medium">4 points</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <X size={20} className="text-red-500" />
              <div>
                <p className="text-xs uppercase text-gray-500">Wrong Answer</p>
                <p className="text-lg font-medium">-1 point</p>
              </div>
            </div>
          </div>

          {/* DESCRIPTION CARD */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-400 leading-relaxed">{quiz.description}</p>

            <div className="mt-6">
              <p className="text-xs uppercase text-gray-500 mb-3">
                Topics Covered
              </p>

              <div className="flex flex-wrap gap-3">
                {quiz.topics_covered.map((topic, id) => (
                  <span
                    key={id}
                    className="text-amber-400 bg-amber-400/10 border border-amber-400/40 px-3 py-1 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= INSTRUCTOR PROFILE ================= */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-6">Instructor Profile</h2>

          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-neutral-800 border border-amber-400 flex items-center justify-center">
              <PenTool />
            </div>

            <div>
              <h3 className="text-lg font-semibold">{quiz.instructor}</h3>
              <p className="text-gray-500 text-sm">
                Senior Lecturer, Computer Science Dept.
              </p>
              <p className="text-gray-400 mt-3 max-w-3xl">
                Specializes in Software Engineering and Design Patterns with
                over 15 years of industry experience. Focuses on practical
                application of object-oriented principles.
              </p>
            </div>
          </div>
        </div>

        {/* ================= HONOR CODE + CTA ================= */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <StartAssessmentButton quizId={quizId} />
        </div>
      </div>
    </div>
  );
}

export default QuizTakingPage;
