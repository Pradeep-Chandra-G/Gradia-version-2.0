"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  Target,
  Flame,
  Award,
  BarChart3,
} from "lucide-react";

// ── Mock data ──────────────────────────────────────────────────────────────
const upcomingQuizzes = [
  {
    id: "1",
    title: "Java Basics Test",
    course: "Java",
    date: "Feb 25, 2026",
    duration: 90,
    difficulty: "EASY",
  },
  {
    id: "4",
    title: "OS – Processes",
    course: "OS",
    date: "Mar 2, 2026",
    duration: 60,
    difficulty: "MEDIUM",
  },
  {
    id: "7",
    title: "OS Memory Management",
    course: "OS",
    date: "Mar 10, 2026",
    duration: 80,
    difficulty: "HARD",
  },
  {
    id: "11",
    title: "Java Streams & Lambdas",
    course: "Java",
    date: "Mar 15, 2026",
    duration: 65,
    difficulty: "MEDIUM",
  },
];

const recentResults = [
  {
    title: "Spring Boot Fundamentals",
    course: "Java",
    score: 82,
    max: 100,
    date: "Feb 18",
  },
  {
    title: "DBMS Mid Term",
    course: "DBMS",
    score: 67,
    max: 100,
    date: "Feb 12",
  },
  {
    title: "Advanced Java OOP",
    course: "Java",
    score: 91,
    max: 100,
    date: "Feb 5",
  },
  { title: "OS Scheduling", course: "OS", score: 74, max: 100, date: "Jan 30" },
  {
    title: "DBMS Normalization",
    course: "DBMS",
    score: 88,
    max: 100,
    date: "Jan 22",
  },
];

const weeklyScores = [55, 67, 74, 71, 82, 88, 91];
const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const subjectPerf = [
  { subject: "Java", avg: 88, count: 6 },
  { subject: "DBMS", avg: 77, count: 4 },
  { subject: "OS", avg: 72, count: 3 },
];

const diffColor: Record<string, string> = {
  EASY: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  MEDIUM: "text-amber-400   bg-amber-400/10   border-amber-400/30",
  HARD: "text-red-400     bg-red-400/10     border-red-400/30",
};

// ── Mini sparkline via inline SVG ─────────────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
  const w = 200,
    h = 56,
    pad = 4;
  const min = Math.min(...data) - 5;
  const max = Math.max(...data) + 5;
  const scaleX = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const scaleY = (v: number) =>
    h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const pts = data.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ");
  const area =
    `M${scaleX(0)},${h} ` +
    data.map((v, i) => `L${scaleX(i)},${scaleY(v)}`).join(" ") +
    ` L${scaleX(data.length - 1)},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-14">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <polyline
        points={pts}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* last dot */}
      <circle
        cx={scaleX(data.length - 1)}
        cy={scaleY(data[data.length - 1])}
        r="3"
        fill="#f59e0b"
      />
    </svg>
  );
}

// ── Bar for subject performance ────────────────────────────────────────────
function SubjectBar({
  subject,
  avg,
  count,
}: {
  subject: string;
  avg: number;
  count: number;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setTimeout(() => setWidth(avg), 120);
  }, [avg]);
  const color = avg >= 85 ? "#10b981" : avg >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 w-10 shrink-0">{subject}</span>
      <div className="flex-1 h-2.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-bold text-white w-10 text-right">
        {avg}%
      </span>
      <span className="text-xs text-gray-600 w-10">
        {count} quiz{count !== 1 ? "zes" : ""}
      </span>
    </div>
  );
}

export default function StudentDashboard({ firstName }: { firstName: string }) {
  const streak = 7;
  const avgScore = Math.round(
    recentResults.reduce((a, r) => a + r.score, 0) / recentResults.length,
  );
  const trend =
    weeklyScores[weeklyScores.length - 1] -
    weeklyScores[weeklyScores.length - 2];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto no-scrollbar">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">Good to see you back</p>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {firstName} <span className="text-amber-400">↗</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-2">
          <Flame size={18} className="text-orange-400" />
          <span className="text-orange-300 font-bold text-sm">
            {streak} day streak
          </span>
        </div>
      </div>

      {/* ── Top stat strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Avg. Score",
            value: `${avgScore}%`,
            icon: <Target size={18} />,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
          },
          {
            label: "Quizzes Taken",
            value: "13",
            icon: <BookOpen size={18} />,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
          },
          {
            label: "Upcoming",
            value: `${upcomingQuizzes.length}`,
            icon: <Clock size={18} />,
            color: "text-violet-400",
            bg: "bg-violet-400/10",
            border: "border-violet-400/20",
          },
          {
            label: "Completed",
            value: "9",
            icon: <CheckCircle2 size={18} />,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border ${s.border} ${s.bg} p-4 flex flex-col gap-2`}
          >
            <div className={`${s.color}`}>{s.icon}</div>
            <div className="text-2xl font-black text-white">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Score trend — spans 2 cols */}
        <div className="md:col-span-2 bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-bold">Score Trend</h2>
              <p className="text-xs text-gray-500">This week</p>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${trend >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
            >
              {trend >= 0 ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              {trend >= 0 ? "+" : ""}
              {trend}%
            </div>
          </div>
          <Sparkline data={weeklyScores} />
          <div className="flex justify-between mt-1">
            {weekLabels.map((l) => (
              <span key={l} className="text-[10px] text-gray-600">
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Subject performance */}
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-white font-bold">By Subject</h2>
            <p className="text-xs text-gray-500">Average scores</p>
          </div>
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {subjectPerf.map((s) => (
              <SubjectBar key={s.subject} {...s} />
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <Award size={14} className="text-amber-400" />
            <span className="text-xs text-gray-400">
              Best: <span className="text-white font-semibold">Java (88%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Upcoming quizzes */}
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Upcoming Quizzes</h2>
            <Link
              href="/dashboard/quizzes"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-white/5">
            {upcomingQuizzes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between py-3 group"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">
                    {q.title}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{q.date}</span>
                    <span>·</span>
                    <span>{q.duration}m</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${diffColor[q.difficulty]}`}
                  >
                    {q.difficulty}
                  </span>
                  <Link
                    href={`/dashboard/quizzes/${q.id}`}
                    className="text-[10px] font-semibold bg-neutral-800 hover:bg-amber-400 hover:text-black text-gray-300 rounded-full px-3 py-1 transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent results */}
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Recent Results</h2>
            <Link
              href="/dashboard/results"
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-white/5">
            {recentResults.map((r) => {
              const pct = Math.round((r.score / r.max) * 100);
              const passed = pct >= 60;
              return (
                <div
                  key={r.title}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-white">
                      {r.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {r.course} · {r.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* mini bar */}
                    <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${passed ? "bg-emerald-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-bold w-10 text-right ${passed ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
