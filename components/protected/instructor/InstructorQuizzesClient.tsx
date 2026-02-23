"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  Clock,
  ChevronRight,
  Edit3,
  Eye,
  Share2,
  Layers,
  CheckCircle2,
  Circle,
  XCircle,
  BarChart3,
  Calendar,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { mockQuizzes, mockBatches, type Quiz } from "@/data/instructorData";

type StatusFilter = "all" | "draft" | "published" | "closed";

const STATUS_META = {
  draft: {
    label: "Draft",
    color: "text-gray-400",
    bg: "bg-gray-400/10",
    border: "border-gray-400/20",
    dot: "bg-gray-400",
  },
  published: {
    label: "Published",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    dot: "bg-emerald-400",
  },
  closed: {
    label: "Closed",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    dot: "bg-red-400",
  },
};

function StatusBadge({ status }: { status: Quiz["status"] }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${m.bg} ${m.border} border ${m.color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function QuizCard({
  quiz,
  onPublish,
  onClose,
}: {
  quiz: Quiz;
  onPublish: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const completion =
    quiz.totalStudents > 0
      ? Math.round((quiz.submissionCount / quiz.totalStudents) * 100)
      : 0;

  return (
    <div className="group bg-neutral-900 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all duration-200 flex flex-col gap-4">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <StatusBadge status={quiz.status} />
            <span className="text-xs text-gray-600 border border-white/8 px-2 py-0.5 rounded-full">
              {quiz.subject}
            </span>
          </div>
          <h3 className="font-bold text-white text-sm leading-tight">
            {quiz.title}
          </h3>
          {quiz.batchName && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Layers size={10} /> {quiz.batchName}
            </p>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock size={11} /> {quiz.duration}m
        </span>
        {quiz.deadline && (
          <span className="flex items-center gap-1">
            <Calendar size={11} /> Due {quiz.deadline.slice(5)}
          </span>
        )}
        {quiz.publishedAt && (
          <span className="text-gray-600">
            Published {quiz.publishedAt.slice(5)}
          </span>
        )}
      </div>

      {/* Submission progress */}
      {quiz.status !== "draft" && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500">
              {quiz.submissionCount}/{quiz.totalStudents} submitted
            </span>
            <span
              className={
                quiz.avgScore != null
                  ? quiz.avgScore >= 75
                    ? "text-emerald-400"
                    : quiz.avgScore >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                  : "text-gray-600"
              }
            >
              {quiz.avgScore != null ? `Avg ${quiz.avgScore}%` : "No results"}
            </span>
          </div>
          <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400/60 rounded-full transition-all duration-700"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      )}

      {/* Pass rate */}
      {quiz.passRate != null && (
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2 size={12} className="text-emerald-400" />
          <span className="text-emerald-400 font-medium">
            {quiz.passRate}% pass rate
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-white/5">
        <Link
          href={`/dashboard/instructor/quizzes/${quiz.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-neutral-800 text-xs text-gray-300 hover:text-white hover:bg-neutral-700 transition"
        >
          <Edit3 size={12} /> {quiz.status === "draft" ? "Edit" : "View"}
        </Link>

        {quiz.status === "draft" && (
          <button
            onClick={() => onPublish(quiz.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/15 text-xs text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition"
          >
            <Share2 size={12} /> Publish
          </button>
        )}
        {quiz.status === "published" && (
          <button
            onClick={() => onClose(quiz.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 text-xs text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
          >
            <XCircle size={12} /> Close
          </button>
        )}
        {quiz.status === "closed" && (
          <Link
            href={`/dashboard/instructor/results/${quiz.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-500/10 text-xs text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition"
          >
            <BarChart3 size={12} /> Results
          </Link>
        )}
      </div>
    </div>
  );
}

export default function InstructorQuizzesClient() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [batchFilter, setBatchFilter] = useState("all");

  const filtered = useMemo(
    () =>
      quizzes.filter((q) => {
        const matchSearch =
          q.title.toLowerCase().includes(search.toLowerCase()) ||
          q.subject.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filter === "all" || q.status === filter;
        const matchBatch = batchFilter === "all" || q.batchId === batchFilter;
        return matchSearch && matchStatus && matchBatch;
      }),
    [quizzes, search, filter, batchFilter],
  );

  const counts = {
    all: quizzes.length,
    draft: quizzes.filter((q) => q.status === "draft").length,
    published: quizzes.filter((q) => q.status === "published").length,
    closed: quizzes.filter((q) => q.status === "closed").length,
  };

  const publishQuiz = (id: string) => {
    setQuizzes((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              status: "published",
              publishedAt: new Date().toISOString().split("T")[0],
            }
          : q,
      ),
    );
  };
  const closeQuiz = (id: string) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "closed" } : q)),
    );
  };

  return (
    <div className="p-6 md:p-8 text-white min-h-full">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Quizzes</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create, publish, and manage quiz assessments
          </p>
        </div>
        <Link
          href="/dashboard/instructor/quizzes/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 text-black text-sm font-bold rounded-xl hover:bg-amber-300 transition active:scale-[0.97]"
        >
          <Plus size={14} /> New Quiz
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            l: "Total",
            v: counts.all,
            c: "text-white",
            bg: "bg-neutral-800/50",
            b: "border-white/8",
          },
          {
            l: "Draft",
            v: counts.draft,
            c: "text-gray-400",
            bg: "bg-gray-500/10",
            b: "border-gray-500/15",
          },
          {
            l: "Published",
            v: counts.published,
            c: "text-emerald-400",
            bg: "bg-emerald-500/10",
            b: "border-emerald-500/15",
          },
          {
            l: "Closed",
            v: counts.closed,
            c: "text-red-400",
            bg: "bg-red-500/10",
            b: "border-red-500/15",
          },
        ].map((s) => (
          <div key={s.l} className={`${s.bg} border ${s.b} rounded-2xl p-4`}>
            <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
            <div className="text-xs text-gray-500">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes…"
            className="bg-neutral-900 border border-white/8 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition w-52"
          />
        </div>

        <div className="flex bg-neutral-900 border border-white/8 rounded-xl overflow-hidden">
          {(["all", "draft", "published", "closed"] as StatusFilter[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium transition capitalize ${
                  filter === s
                    ? "bg-amber-400 text-black"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {s}
                {s !== "all" ? ` (${counts[s]})` : ""}
              </button>
            ),
          )}
        </div>

        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="bg-neutral-900 border border-white/8 rounded-xl px-3 py-2 text-sm text-gray-400 focus:outline-none focus:border-white/20 transition"
        >
          <option value="all">All Batches</option>
          {mockBatches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FileText size={36} className="text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm">No quizzes found</p>
          <Link
            href="/dashboard/instructor/quizzes/new"
            className="mt-3 text-amber-400 text-sm hover:underline flex items-center gap-1"
          >
            <Plus size={12} /> Create your first quiz
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((q) => (
            <QuizCard
              key={q.id}
              quiz={q}
              onPublish={publishQuiz}
              onClose={closeQuiz}
            />
          ))}
        </div>
      )}
    </div>
  );
}
