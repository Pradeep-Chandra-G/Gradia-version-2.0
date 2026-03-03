"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Calendar,
  ChevronRight,
  Search,
  Filter,
  Loader2,
  CheckCircle2,
  Lock,
  Play,
} from "lucide-react";

type Quiz = {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  totalQuestions: number;
  totalTimeLimit: number | null;
  beginWindow: string | null;
  endWindow: string | null;
  status: string;
  // student-specific
  attemptStatus: "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | null;
  percentageScore: number | null;
  passed: boolean | null;
  batchName: string | null;
};

const diffStyles: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  HARD: "bg-red-500/10 text-red-400 border-red-500/30",
};

function StatusBadge({ quiz }: { quiz: Quiz }) {
  const now = new Date();
  const begin = quiz.beginWindow ? new Date(quiz.beginWindow) : null;
  const end = quiz.endWindow ? new Date(quiz.endWindow) : null;

  if (quiz.attemptStatus === "SUBMITTED") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
        <CheckCircle2 size={11} /> Done
      </span>
    );
  }
  if (end && end < now) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-neutral-800 border border-white/10 rounded-full px-3 py-1">
        <Lock size={11} /> Closed
      </span>
    );
  }
  if (begin && begin > now) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/30 rounded-full px-3 py-1">
        <Clock size={11} /> Upcoming
      </span>
    );
  }
  if (quiz.attemptStatus === "IN_PROGRESS") {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1">
        <Play size={11} /> In Progress
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-1">
      <Play size={11} /> Available
    </span>
  );
}

export default function QuizPageClient() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "ALL" | "AVAILABLE" | "UPCOMING" | "DONE"
  >("ALL");

  useEffect(() => {
    fetch("/api/student/quizzes")
      .then((r) => r.json())
      .then((d) => setQuizzes(d.quizzes ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const filtered = quizzes.filter((q) => {
    const matchSearch =
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (q.subject ?? "").toLowerCase().includes(search.toLowerCase());

    const begin = q.beginWindow ? new Date(q.beginWindow) : null;
    const end = q.endWindow ? new Date(q.endWindow) : null;
    const isAvailable =
      (!begin || begin <= now) &&
      (!end || end >= now) &&
      q.attemptStatus !== "SUBMITTED";
    const isUpcoming = begin && begin > now;
    const isDone = q.attemptStatus === "SUBMITTED";

    const matchFilter =
      filter === "ALL" ||
      (filter === "AVAILABLE" && isAvailable) ||
      (filter === "UPCOMING" && isUpcoming) ||
      (filter === "DONE" && isDone);

    return matchSearch && matchFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin text-amber-400" size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Quizzes</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} assigned to
          you
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes..."
            className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "AVAILABLE", "UPCOMING", "DONE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                filter === f
                  ? "bg-amber-400 text-black border-amber-400"
                  : "bg-neutral-900 text-gray-400 border-white/10 hover:border-white/20"
              }`}
            >
              {f === "ALL"
                ? "All"
                : f === "AVAILABLE"
                  ? "Available"
                  : f === "UPCOMING"
                    ? "Upcoming"
                    : "Done"}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600">
          <BookOpen size={40} className="mb-3 opacity-30" />
          <p className="font-medium">No quizzes found</p>
          <p className="text-sm mt-1">
            {filter !== "ALL"
              ? "Try changing the filter"
              : "No quizzes assigned yet"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((q) => {
            const end = q.endWindow ? new Date(q.endWindow) : null;
            const begin = q.beginWindow ? new Date(q.beginWindow) : null;
            const isLocked = (end && end < now) || (begin && begin > now);
            const isDone = q.attemptStatus === "SUBMITTED";

            return (
              <div
                key={q.id}
                className="bg-neutral-900 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {q.subject && (
                        <span className="text-xs text-gray-500 font-medium">
                          {q.subject}
                        </span>
                      )}
                      {q.batchName && (
                        <>
                          <span className="text-gray-700">·</span>
                          <span className="text-xs text-gray-600">
                            {q.batchName}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-base leading-tight group-hover:text-amber-300 transition">
                      {q.title}
                    </h3>
                    {q.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {q.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap mt-1">
                      <span
                        className={`text-[10px] font-bold border rounded-full px-2 py-0.5 ${diffStyles[q.difficulty]}`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <BookOpen size={11} /> {q.totalQuestions}q
                      </span>
                      {q.totalTimeLimit && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={11} /> {q.totalTimeLimit}m
                        </span>
                      )}
                      {begin && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={11} />
                          {begin.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                          {end
                            ? ` – ${end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                            : ""}
                        </span>
                      )}
                    </div>

                    {isDone && q.percentageScore != null && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 max-w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${q.passed ? "bg-emerald-500" : "bg-red-500"}`}
                            style={{
                              width: `${Math.round(q.percentageScore)}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold ${q.passed ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {Math.round(q.percentageScore)}%
                        </span>
                        <span className="text-xs text-gray-600">
                          {q.passed ? "Passed" : "Failed"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <StatusBadge quiz={q} />
                    {!isLocked && (
                      <Link
                        href={`/dashboard/quizzes/${q.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-neutral-800 hover:bg-amber-400 hover:text-black text-gray-300 rounded-xl px-3 py-2 transition"
                      >
                        {isDone
                          ? "Review"
                          : q.attemptStatus === "IN_PROGRESS"
                            ? "Continue"
                            : "Start"}
                        <ChevronRight size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
