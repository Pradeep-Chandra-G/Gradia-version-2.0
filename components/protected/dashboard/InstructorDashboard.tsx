"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Medal,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

// ── Mock data ──────────────────────────────────────────────────────────────
const students = [
  { name: "Arjun Sharma", scores: [88, 91, 76, 95, 84], avatar: "AS" },
  { name: "Priya Nair", scores: [72, 68, 79, 65, 70], avatar: "PN" },
  { name: "Karan Mehta", scores: [95, 98, 92, 97, 96], avatar: "KM" },
  { name: "Sneha Iyer", scores: [55, 60, 58, 62, 57], avatar: "SI" },
  { name: "Rohan Das", scores: [80, 85, 78, 88, 82], avatar: "RD" },
  { name: "Isha Kulkarni", scores: [67, 72, 69, 74, 71], avatar: "IK" },
  { name: "Dev Patel", scores: [91, 88, 94, 90, 93], avatar: "DP" },
  { name: "Ananya Roy", scores: [48, 52, 45, 55, 50], avatar: "AR" },
];

const quizzes = [
  {
    title: "Java Basics Test",
    course: "Java",
    submitted: 18,
    total: 22,
    avgScore: 76,
  },
  {
    title: "Spring Boot Fundamentals",
    course: "Java",
    submitted: 20,
    total: 22,
    avgScore: 82,
  },
  {
    title: "DBMS Mid Term",
    course: "DBMS",
    submitted: 22,
    total: 22,
    avgScore: 69,
  },
  {
    title: "OS Processes",
    course: "OS",
    submitted: 15,
    total: 22,
    avgScore: 73,
  },
  {
    title: "Advanced OOP",
    course: "Java",
    submitted: 21,
    total: 22,
    avgScore: 88,
  },
];

const weeklySubmissions = [12, 18, 14, 22, 19, 20, 16];
const weekLabels = ["M", "T", "W", "T", "F", "S", "S"];

// score distribution buckets: 0-49, 50-59, 60-69, 70-79, 80-89, 90-100
const scoreBuckets = [
  { label: "0-49", count: 3, color: "#ef4444" },
  { label: "50-59", count: 5, color: "#f97316" },
  { label: "60-69", count: 8, color: "#eab308" },
  { label: "70-79", count: 14, color: "#84cc16" },
  { label: "80-89", count: 10, color: "#22c55e" },
  { label: "90-100", count: 7, color: "#10b981" },
];

const maxBucket = Math.max(...scoreBuckets.map((b) => b.count));

function avg(arr: number[]) {
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function MiniBarChart({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-sm bg-neutral-800 flex items-end overflow-hidden"
            style={{ height: 48 }}
          >
            <div
              className="w-full rounded-sm bg-amber-400/70 transition-all duration-700 ease-out"
              style={{ height: mounted ? `${(v / max) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-[9px] text-gray-600">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreDistChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 200);
  }, []);
  return (
    <div className="flex items-end gap-2 h-24">
      {scoreBuckets.map((b) => (
        <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
          <span className="text-[9px] text-gray-500 font-medium">
            {b.count}
          </span>
          <div
            className="w-full bg-neutral-800 rounded-t overflow-hidden"
            style={{ height: 64 }}
          >
            <div
              className="w-full rounded-t transition-all duration-700 ease-out"
              style={{
                height: mounted ? `${(b.count / maxBucket) * 100}%` : "0%",
                backgroundColor: b.color,
                opacity: 0.8,
              }}
            />
          </div>
          <span className="text-[8px] text-gray-600">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function InstructorDashboard({
  firstName,
}: {
  firstName: string;
}) {
  const [sortBy, setSortBy] = useState<"name" | "avg" | "trend">("avg");
  const [hoveredStudent, setHoveredStudent] = useState<string | null>(null);

  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === "avg") return avg(b.scores) - avg(a.scores);
    if (sortBy === "trend")
      return b.scores[4] - b.scores[0] - (a.scores[4] - a.scores[0]);
    return a.name.localeCompare(b.name);
  });

  const classAvg = Math.round(
    students.reduce((sum, s) => sum + avg(s.scores), 0) / students.length,
  );
  const passRate = Math.round(
    (students.filter((s) => avg(s.scores) >= 60).length / students.length) *
      100,
  );
  const atRisk = students.filter((s) => avg(s.scores) < 60).length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto no-scrollbar">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">Instructor Console</p>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {firstName} <span className="text-blue-400">·</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Batch: <span className="text-white">CSE-2026-A</span>
          </p>
        </div>
        <Link
          href="/dashboard/admin/quizzes"
          className="px-4 py-2 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-sm font-semibold rounded-xl hover:bg-blue-500/25 transition"
        >
          + Create Quiz
        </Link>
      </div>

      {/* ── Stat strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Class Average",
            value: `${classAvg}%`,
            icon: <BarChart3 size={18} />,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
          },
          {
            label: "Pass Rate",
            value: `${passRate}%`,
            icon: <TrendingUp size={18} />,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20",
          },
          {
            label: "Students",
            value: students.length,
            icon: <Users size={18} />,
            color: "text-violet-400",
            bg: "bg-violet-400/10",
            border: "border-violet-400/20",
          },
          {
            label: "At Risk",
            value: atRisk,
            icon: <AlertTriangle size={18} />,
            color: "text-red-400",
            bg: "bg-red-400/10",
            border: "border-red-400/20",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border ${s.border} ${s.bg} p-4 flex flex-col gap-2`}
          >
            <div className={s.color}>{s.icon}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Score distribution */}
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-1">Score Distribution</h2>
          <p className="text-xs text-gray-500 mb-4">
            All students · all quizzes
          </p>
          <ScoreDistChart />
        </div>

        {/* Submissions per day */}
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-1">Submissions This Week</h2>
          <p className="text-xs text-gray-500 mb-4">
            Total: {weeklySubmissions.reduce((a, b) => a + b, 0)}
          </p>
          <MiniBarChart data={weeklySubmissions} labels={weekLabels} />
        </div>
      </div>

      {/* ── Student performance table ── */}
      <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-bold">Student Performance</h2>
            <p className="text-xs text-gray-500">Last 5 quizzes</p>
          </div>
          {/* Sort controls */}
          <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">
            {(["avg", "trend", "name"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  sortBy === s
                    ? "bg-neutral-700 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-white/5">
                <th className="text-left pb-3 font-medium">Student</th>
                <th
                  className="text-center pb-3 font-medium hidden md:table-cell"
                  colSpan={5}
                >
                  Quiz Scores
                </th>
                <th className="text-right pb-3 font-medium">Avg</th>
                <th className="text-right pb-3 font-medium">Trend</th>
                <th className="text-right pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedStudents.map((s) => {
                const average = avg(s.scores);
                const trend = s.scores[4] - s.scores[0];
                const passed = average >= 60;
                const isHovered = hoveredStudent === s.name;

                return (
                  <tr
                    key={s.name}
                    className="transition-colors hover:bg-white/3 cursor-default"
                    onMouseEnter={() => setHoveredStudent(s.name)}
                    onMouseLeave={() => setHoveredStudent(null)}
                  >
                    {/* Name */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            passed
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {s.avatar}
                        </div>
                        <span className="text-white font-medium">{s.name}</span>
                      </div>
                    </td>

                    {/* Individual scores */}
                    {s.scores.map((score, i) => (
                      <td
                        key={i}
                        className="py-3 px-1 text-center hidden md:table-cell"
                      >
                        <span
                          className={`text-xs font-medium ${
                            score >= 85
                              ? "text-emerald-400"
                              : score >= 70
                                ? "text-amber-400"
                                : score >= 60
                                  ? "text-orange-400"
                                  : "text-red-400"
                          }`}
                        >
                          {score}
                        </span>
                      </td>
                    ))}

                    {/* Avg */}
                    <td className="py-3 pl-4 text-right">
                      <span
                        className={`text-sm font-bold ${
                          average >= 85
                            ? "text-emerald-400"
                            : average >= 70
                              ? "text-amber-400"
                              : average >= 60
                                ? "text-orange-400"
                                : "text-red-400"
                        }`}
                      >
                        {average}%
                      </span>
                    </td>

                    {/* Trend */}
                    <td className="py-3 pl-2 text-right">
                      <span
                        className={`flex items-center justify-end gap-0.5 text-xs font-semibold ${
                          trend > 0
                            ? "text-emerald-400"
                            : trend < 0
                              ? "text-red-400"
                              : "text-gray-500"
                        }`}
                      >
                        {trend > 0 ? (
                          <TrendingUp size={12} />
                        ) : trend < 0 ? (
                          <TrendingDown size={12} />
                        ) : null}
                        {trend > 0 ? "+" : ""}
                        {trend}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 pl-2 text-right">
                      <span
                        className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${
                          passed
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}
                      >
                        {passed ? "Passing" : "At Risk"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Quiz completion status ── */}
      <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">Quiz Completion Rates</h2>
          <Link
            href="/dashboard/admin/quizzes"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Manage <ChevronRight size={12} />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {quizzes.map((q) => {
            const rate = Math.round((q.submitted / q.total) * 100);
            return (
              <div key={q.title} className="flex items-center gap-4">
                <div className="flex flex-col gap-0.5 w-48 shrink-0">
                  <span className="text-sm text-white font-medium truncate">
                    {q.title}
                  </span>
                  <span className="text-xs text-gray-500">
                    {q.submitted}/{q.total} submitted · avg {q.avgScore}%
                  </span>
                </div>
                <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${rate === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white w-10 text-right">
                  {rate}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
