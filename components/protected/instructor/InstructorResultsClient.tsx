"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  BookOpen,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import {
  mockSubmissions,
  mockQuizzes,
  mockBatches,
  type Submission,
  type Quiz,
} from "@/data/instructorData";

type SortKey = "date" | "score" | "student" | "quiz";

function ScoreBadge({ pct, passed }: { pct: number; passed: boolean }) {
  return (
    <div
      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
        passed
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
          : "bg-red-500/15 text-red-400 border border-red-500/20"
      }`}
    >
      {pct}%
    </div>
  );
}

// ── Per-quiz results card ────────────────────────────────────────────────────
function QuizResultCard({ quiz }: { quiz: Quiz }) {
  const subs = mockSubmissions.filter((s) => s.quizId === quiz.id);
  if (subs.length === 0 && quiz.status === "draft") return null;

  const avgScore = subs.length
    ? Math.round(subs.reduce((a, s) => a + s.pct, 0) / subs.length)
    : null;
  const passRate = subs.length
    ? Math.round((subs.filter((s) => s.passed).length / subs.length) * 100)
    : null;
  const completion =
    quiz.totalStudents > 0
      ? Math.round((quiz.submissionCount / quiz.totalStudents) * 100)
      : 0;

  const STATUS = {
    draft: "text-gray-500",
    published: "text-emerald-400",
    closed: "text-red-400",
  };

  return (
    <Link href={`/dashboard/instructor/results/${quiz.id}`}>
      <div className="group bg-neutral-900 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all duration-200 cursor-pointer">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-white text-sm">{quiz.title}</h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
              <span className={STATUS[quiz.status]}>{quiz.status}</span>
              {quiz.batchName && (
                <span className="flex items-center gap-1">
                  <Layers size={10} /> {quiz.batchName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={10} /> {quiz.duration}m
              </span>
            </div>
          </div>
          <ChevronRight
            size={15}
            className="text-gray-600 group-hover:text-gray-400 mt-1 shrink-0"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-neutral-800/40 rounded-xl p-2.5 text-center">
            <div className="text-sm font-bold text-white">
              {subs.length}/{quiz.totalStudents}
            </div>
            <div className="text-[9px] text-gray-600 mt-0.5">Submitted</div>
          </div>
          <div
            className={`rounded-xl p-2.5 text-center ${avgScore != null ? (avgScore >= 75 ? "bg-emerald-500/8" : avgScore >= 50 ? "bg-amber-500/8" : "bg-red-500/8") : "bg-neutral-800/40"}`}
          >
            <div
              className={`text-sm font-bold ${avgScore != null ? (avgScore >= 75 ? "text-emerald-400" : avgScore >= 50 ? "text-amber-400" : "text-red-400") : "text-gray-600"}`}
            >
              {avgScore != null ? `${avgScore}%` : "—"}
            </div>
            <div className="text-[9px] text-gray-600 mt-0.5">Avg Score</div>
          </div>
          <div
            className={`rounded-xl p-2.5 text-center ${passRate != null ? (passRate >= 75 ? "bg-emerald-500/8" : passRate >= 50 ? "bg-amber-500/8" : "bg-red-500/8") : "bg-neutral-800/40"}`}
          >
            <div
              className={`text-sm font-bold ${passRate != null ? (passRate >= 75 ? "text-emerald-400" : passRate >= 50 ? "text-amber-400" : "text-red-400") : "text-gray-600"}`}
            >
              {passRate != null ? `${passRate}%` : "—"}
            </div>
            <div className="text-[9px] text-gray-600 mt-0.5">Pass Rate</div>
          </div>
        </div>

        {quiz.status !== "draft" && (
          <div>
            <div className="flex justify-between text-[10px] text-gray-600 mb-1">
              <span>Completion</span>
              <span>{completion}%</span>
            </div>
            <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400/60 rounded-full"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

// ── All submissions table ────────────────────────────────────────────────────
function SubmissionsTable({
  submissions,
  sort,
  setSort,
}: {
  submissions: Submission[];
  sort: SortKey;
  setSort: (k: SortKey) => void;
}) {
  const quizMap = Object.fromEntries(mockQuizzes.map((q) => [q.id, q.title]));

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSort(k)}
      className={`flex items-center gap-1 text-[10px] uppercase tracking-wide transition ${sort === k ? "text-amber-400" : "text-gray-600 hover:text-gray-400"}`}
    >
      {label} <ArrowUpDown size={9} />
    </button>
  );

  return (
    <div className="bg-neutral-900 border border-white/8 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/5 grid grid-cols-12 gap-3">
        <div className="col-span-3">
          <SortBtn k="student" label="Student" />
        </div>
        <div className="col-span-4">
          <SortBtn k="quiz" label="Quiz" />
        </div>
        <div className="col-span-2">
          <SortBtn k="score" label="Score" />
        </div>
        <div className="col-span-2">
          <SortBtn k="date" label="Date" />
        </div>
        <div className="col-span-1" />
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-600 text-sm">
          No submissions
        </div>
      ) : (
        submissions.map((sub) => (
          <div
            key={sub.id}
            className="px-5 py-3 border-b border-white/5 last:border-0 grid grid-cols-12 gap-3 items-center hover:bg-neutral-800/20 transition group"
          >
            <div className="col-span-3 flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-gray-300">
                  {sub.studentAvatar}
                </span>
              </div>
              <span className="text-xs text-gray-300 truncate">
                {sub.studentName}
              </span>
            </div>
            <div className="col-span-4">
              <span className="text-xs text-gray-500 truncate block">
                {quizMap[sub.quizId] ?? sub.quizId}
              </span>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <ScoreBadge pct={sub.pct} passed={sub.passed} />
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-gray-600">
                {sub.submittedAt.slice(0, 10)}
              </span>
            </div>
            <div className="col-span-1 flex justify-end">
              <Link
                href={`/dashboard/instructor/results/${sub.quizId}`}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-amber-400 transition"
              >
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function InstructorResultsClient() {
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [view, setView] = useState<"quizzes" | "submissions">("quizzes");

  const allSubmissions = useMemo(() => {
    let s = [...mockSubmissions];
    if (search)
      s = s.filter((sub) =>
        sub.studentName.toLowerCase().includes(search.toLowerCase()),
      );
    if (batchFilter !== "all") {
      const batchQuizIds = mockQuizzes
        .filter((q) => q.batchId === batchFilter)
        .map((q) => q.id);
      s = s.filter((sub) => batchQuizIds.includes(sub.quizId));
    }
    s.sort((a, b) => {
      if (sort === "date") return b.submittedAt.localeCompare(a.submittedAt);
      if (sort === "score") return b.pct - a.pct;
      if (sort === "student") return a.studentName.localeCompare(b.studentName);
      if (sort === "quiz") return a.quizId.localeCompare(b.quizId);
      return 0;
    });
    return s;
  }, [search, batchFilter, sort]);

  const filteredQuizzes = useMemo(() => {
    let q = mockQuizzes.filter(
      (q) => q.status !== "draft" || q.submissionCount > 0,
    );
    if (batchFilter !== "all") q = q.filter((q2) => q2.batchId === batchFilter);
    if (statusFilter !== "all")
      q = q.filter((q2) => q2.status === statusFilter);
    return q;
  }, [batchFilter, statusFilter]);

  const totalSubs = mockSubmissions.length;
  const passedSubs = mockSubmissions.filter((s) => s.passed).length;
  const avgScore = totalSubs
    ? Math.round(mockSubmissions.reduce((a, s) => a + s.pct, 0) / totalSubs)
    : 0;

  return (
    <div className="p-6 md:p-8 text-white min-h-full">
      <div className="mb-7">
        <h1 className="text-2xl font-black tracking-tight">Results</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track quiz submissions and student performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            l: "Total Submissions",
            v: totalSubs,
            c: "text-white",
            bg: "bg-neutral-800/50",
            b: "border-white/8",
          },
          {
            l: "Passed",
            v: passedSubs,
            c: "text-emerald-400",
            bg: "bg-emerald-500/10",
            b: "border-emerald-500/15",
          },
          {
            l: "Failed",
            v: totalSubs - passedSubs,
            c: "text-red-400",
            bg: "bg-red-500/10",
            b: "border-red-500/15",
          },
          {
            l: "Avg Score",
            v: `${avgScore}%`,
            c:
              avgScore >= 75
                ? "text-emerald-400"
                : avgScore >= 50
                  ? "text-amber-400"
                  : "text-red-400",
            bg: "bg-neutral-800/50",
            b: "border-white/8",
          },
        ].map((s) => (
          <div key={s.l} className={`${s.bg} border ${s.b} rounded-2xl p-4`}>
            <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
            <div className="text-xs text-gray-500">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Filters + view toggle */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students…"
            className="bg-neutral-900 border border-white/8 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition w-48"
          />
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-900 border border-white/8 rounded-xl px-3 py-2 text-sm text-gray-400 focus:outline-none focus:border-white/20 transition"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </select>

        <div className="ml-auto flex bg-neutral-900 border border-white/8 rounded-xl overflow-hidden">
          {[
            { v: "quizzes", l: "By Quiz" },
            { v: "submissions", l: "All Submissions" },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => setView(t.v as any)}
              className={`px-3 py-1.5 text-xs font-medium transition ${view === t.v ? "bg-amber-400 text-black" : "text-gray-500 hover:text-white"}`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {view === "quizzes" ? (
        filteredQuizzes.length === 0 ? (
          <div className="text-center py-20 text-gray-600 text-sm">
            No quiz results to show
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredQuizzes.map((q) => (
              <QuizResultCard key={q.id} quiz={q} />
            ))}
          </div>
        )
      ) : (
        <SubmissionsTable
          submissions={allSubmissions}
          sort={sort}
          setSort={setSort}
        />
      )}
    </div>
  );
}
