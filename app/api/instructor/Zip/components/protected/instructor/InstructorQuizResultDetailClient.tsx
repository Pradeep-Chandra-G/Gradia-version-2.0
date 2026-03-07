"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Award,
  AlertTriangle,
} from "lucide-react";
import {
  mockSubmissions,
  mockQuizzes,
  type Submission,
} from "@/data/instructorData";

function ScoreRing({ pct, size = 48 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#262626"
        strokeWidth="5"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
}

function SubmissionRow({ sub, rank }: { sub: Submission; rank: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0">
      <div
        className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-800/20 transition cursor-pointer group"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-xs text-gray-600 w-6 shrink-0 font-mono">
          #{rank}
        </span>

        <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-bold text-gray-300">
            {sub.studentAvatar}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{sub.studentName}</p>
          <p className="text-xs text-gray-500">
            Submitted {sub.submittedAt.slice(0, 10)} · {sub.timeTaken}m taken
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center">
            <ScoreRing pct={sub.pct} size={40} />
            <span className="absolute text-[9px] font-bold text-white">
              {sub.pct}%
            </span>
          </div>
          <div
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              sub.passed
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {sub.passed ? "Pass" : "Fail"}
          </div>
          <span className="text-xs text-gray-600">
            {sub.score}/{sub.maxScore}
          </span>
          {open ? (
            <ChevronUp size={14} className="text-gray-500" />
          ) : (
            <ChevronDown size={14} className="text-gray-500" />
          )}
        </div>
      </div>

      {open && (
        <div className="px-14 pb-4 text-xs text-gray-500">
          {sub.answers.length === 0 ? (
            <p className="text-gray-600 italic">
              Detailed answer breakdown not available in mock data.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {sub.answers.map((a, i) => (
                <div
                  key={a.questionId}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${a.correct ? "bg-emerald-500/5" : "bg-red-500/5"}`}
                >
                  {a.correct ? (
                    <CheckCircle2
                      size={12}
                      className="text-emerald-400 shrink-0"
                    />
                  ) : (
                    <XCircle size={12} className="text-red-400 shrink-0" />
                  )}
                  <span>Q{i + 1}</span>
                  <span className="ml-auto">
                    {a.pointsEarned}/{a.maxPoints} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InstructorQuizResultDetailClient({
  quizId,
}: {
  quizId: string;
}) {
  const quiz = mockQuizzes.find((q) => q.id === quizId) ?? mockQuizzes[0];
  const submissions = mockSubmissions
    .filter((s) => s.quizId === quizId)
    .sort((a, b) => b.pct - a.pct);

  const avgScore = submissions.length
    ? Math.round(
        submissions.reduce((a, s) => a + s.pct, 0) / submissions.length,
      )
    : 0;
  const passCount = submissions.filter((s) => s.passed).length;
  const passRate = submissions.length
    ? Math.round((passCount / submissions.length) * 100)
    : 0;
  const avgTime = submissions.length
    ? Math.round(
        submissions.reduce((a, s) => a + s.timeTaken, 0) / submissions.length,
      )
    : 0;
  const highest = submissions[0];
  const lowest = [...submissions].sort((a, b) => a.pct - b.pct)[0];

  // Score distribution buckets
  const buckets = [
    {
      label: "0–39",
      color: "#ef4444",
      count: submissions.filter((s) => s.pct < 40).length,
    },
    {
      label: "40–59",
      color: "#f97316",
      count: submissions.filter((s) => s.pct >= 40 && s.pct < 60).length,
    },
    {
      label: "60–74",
      color: "#eab308",
      count: submissions.filter((s) => s.pct >= 60 && s.pct < 75).length,
    },
    {
      label: "75–89",
      color: "#22c55e",
      count: submissions.filter((s) => s.pct >= 75 && s.pct < 90).length,
    },
    {
      label: "90–100",
      color: "#10b981",
      count: submissions.filter((s) => s.pct >= 90).length,
    },
  ];
  const maxBucket = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="p-6 md:p-8 text-white min-h-full">
      <Link
        href="/dashboard/instructor/results"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition mb-6"
      >
        <ArrowLeft size={14} /> Back to Results
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              quiz.status === "closed"
                ? "text-red-400 bg-red-400/10 border-red-400/20"
                : quiz.status === "published"
                  ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                  : "text-gray-400 bg-gray-400/10 border-gray-400/20"
            }`}
          >
            {quiz.status}
          </span>
          {quiz.batchName && (
            <span className="text-xs text-gray-500">{quiz.batchName}</span>
          )}
        </div>
        <h1 className="text-2xl font-black tracking-tight">{quiz.title}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {quiz.duration}m · {quiz.submissionCount}/{quiz.totalStudents}{" "}
          submitted
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            l: "Avg Score",
            v: `${avgScore}%`,
            c:
              avgScore >= 75
                ? "text-emerald-400"
                : avgScore >= 50
                  ? "text-amber-400"
                  : "text-red-400",
          },
          {
            l: "Pass Rate",
            v: `${passRate}%`,
            c:
              passRate >= 75
                ? "text-emerald-400"
                : passRate >= 50
                  ? "text-amber-400"
                  : "text-red-400",
          },
          { l: "Avg Time", v: `${avgTime}m`, c: "text-white" },
          { l: "Submissions", v: submissions.length, c: "text-white" },
        ].map((s) => (
          <div
            key={s.l}
            className="bg-neutral-900 border border-white/8 rounded-2xl p-4"
          >
            <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Submissions list */}
        <div className="lg:col-span-2 bg-neutral-900 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users size={14} className="text-gray-500" /> Submissions (
              {submissions.length})
            </h2>
            <span className="text-xs text-gray-600">Ranked by score</span>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-14 text-gray-600 text-sm">
              <Users size={28} className="mx-auto mb-2 text-gray-700" />
              No submissions yet
            </div>
          ) : (
            submissions.map((sub, i) => (
              <SubmissionRow key={sub.id} sub={sub} rank={i + 1} />
            ))
          )}
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-4">
          {/* Score distribution */}
          <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-gray-500" /> Distribution
            </h2>
            <div className="flex items-end gap-2 h-20">
              {buckets.map((b) => (
                <div
                  key={b.label}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[8px] text-gray-600">{b.count}</span>
                  <div
                    className="w-full rounded-t overflow-hidden"
                    style={{ height: 52, background: "#262626" }}
                  >
                    <div
                      className="w-full rounded-t transition-all duration-700"
                      style={{
                        height: `${(b.count / maxBucket) * 100}%`,
                        background: b.color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span className="text-[8px] text-gray-600">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights */}
          {submissions.length > 0 && (
            <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5 flex flex-col gap-3">
              <h2 className="text-sm font-bold text-white mb-1">Highlights</h2>
              {highest && (
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-white truncate">
                      {highest.studentName}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Top score · {highest.pct}%
                    </p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-emerald-400">
                    {highest.pct}%
                  </span>
                </div>
              )}
              {lowest && lowest.id !== highest?.id && (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-white truncate">
                      {lowest.studentName}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Needs support · {lowest.pct}%
                    </p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-red-400">
                    {lowest.pct}%
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <p className="text-xs text-gray-400">
                  {passCount} of {submissions.length} passed ({passRate}%)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
