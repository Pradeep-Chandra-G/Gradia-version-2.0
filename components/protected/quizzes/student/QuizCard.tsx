import { Eye } from "lucide-react";
import Link from "next/link";

type QuizCardProps = {
  quiz: {
    id: string;
    title: string;
    instructor: string;
    duration: number;
    date: string;
    status: "UPCOMING" | "COMPLETED" | "GRADE_AVAILABLE";
  };
};

export default function QuizCard({ quiz }: QuizCardProps) {
  const status = quiz.status.replace("_", " ");
  return (
    <div
      className="
        relative rounded-2xl p-5
        bg-neutral-900/70 border border-white/10
        hover:border-amber-400/40 transition
        flex flex-col
      "
    >
      {/* Status badge */}
      <span
        className="
          absolute top-4 right-4
        "
      >
        {status === "GRADE AVAILABLE" ? (
          <h1 className="text-emerald-400 bg-emerald-400/20 border border-emerald-400/70 text-xs px-2 py-1 rounded-full">
            {status}
          </h1>
        ) : status === "COMPLETED" ? (
          <h1 className="text-gray-400 bg-gray-400/20 border border-gray-400/70 text-xs px-2 py-1 rounded-full">
            {status}
          </h1>
        ) : (
          <h1 className="text-amber-400 bg-amber-400/20 border border-amber-400/70 text-xs px-2 py-1 rounded-full">
            {status}
          </h1>
        )}
      </span>

      {/* Icon */}
      <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
        Σ
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold mb-1">{quiz.title}</h3>
      <p className="text-xs text-gray-400 mb-4">
        Instructor: {quiz.instructor}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-6">
        <span>{quiz.date}</span>
        <span>{quiz.duration} mins</span>
      </div>

      {/* CTA */}
      <Link
        href={`/dashboard/quizzes/${quiz.id}`}
        className="
          mt-auto w-full font-sans tracking-wide
        "
      >
        {quiz.status === "GRADE_AVAILABLE" ? (
          <h1
            className="flex flex-row items-center justify-center gap-2 rounded-lg text-md
          bg-emerald-400/90 hover:bg-emerald-500/95 cursor-pointer text-white py-2 "
          >
            <Eye className="text-white" /> View Results
          </h1>
        ) : (
          <h1
            className="flex flex-row items-center justify-center gap-2 rounded-lg text-md
          bg-[#3713ec]/10 text-[#3713ec] hover:bg-[#3713ec]/18 cursor-pointer py-2"
          >
            Details
          </h1>
        )}
      </Link>
    </div>
  );
}
