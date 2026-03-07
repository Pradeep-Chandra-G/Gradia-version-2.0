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
  Loader2,
} from "lucide-react";

type DashboardData = {
  student: { id: string; name: string; email: string };
  stats: {
    totalBatches: number;
    totalAssigned: number;
    completed: number;
    upcoming: number;
    averageScore: number;
    latestScore: number | null;
  };
  batches: { id: string; name: string; subject: string; color: string }[];
  upcomingQuizzes: {
    id: string;
    title: string;
    subject: string;
    difficulty: string;
    beginWindow: string | null;
    endWindow: string | null;
    totalQuestions: number;
    totalTimeLimit: number | null;
  }[];
  recentAttempts: {
    id: string;
    quizId: string;
    totalScore: number | null;
    maxScore: number | null;
    percentageScore: number | null;
    passed: boolean | null;
    submittedAt: string | null;
    timeSpent: number | null;
  }[];
};

const diffColor: Record<string, string> = {
  EASY: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  MEDIUM: "text-amber-400   bg-amber-400/10   border-amber-400/30",
  HARD: "text-red-400     bg-red-400/10     border-red-400/30",
};

// ── Mini sparkline via inline SVG ─────────────────────────────────────────
function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const w = 200, h = 56, pad = 4;
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
      <polyline points={pts} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={scaleX(data.length - 1)} cy={scaleY(data[data.length - 1])} r="3" fill="#f59e0b" />
    </svg>
  );
}

// ── Bar for batch performance ──────────────────────────────────────────────
function BatchBar({ name, subject, color }: { name: string; subject: string; color: string }) {
  const colorMap: Record<string, string> = {
    amber: "bg-amber-400",
    blue: "bg-blue-400",
    violet: "bg-violet-400",
    emerald: "bg-emerald-400",
  };
  const bar = colorMap[color] ?? "bg-amber-400";
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <div className={`w-2 h-2 rounded-full ${bar} shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{name}</p>
        <p className="text-xs text-gray-500">{subject}</p>
      </div>
    </div>
  );
}

export default function StudentDashboard({ firstName }: { firstName: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-amber-400" size={32} />
      </div>
    );
  }

  const stats = data?.stats;
  const scoreHistory = (data?.recentAttempts ?? [])
    .filter(a => a.percentageScore != null)
    .map(a => Math.round(a.percentageScore!))
    .reverse();

  const trend = scoreHistory.length >= 2
    ? scoreHistory[scoreHistory.length - 1] - scoreHistory[scoreHistory.length - 2]
    : 0;

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
        {(stats?.totalBatches ?? 0) > 0 && (
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2">
            <Flame size={18} className="text-blue-400" />
            <span className="text-blue-300 font-bold text-sm">
              {stats?.totalBatches} batch{(stats?.totalBatches ?? 0) !== 1 ? "es" : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── Top stat strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Avg. Score",
            value: stats?.averageScore ? `${Math.round(stats.averageScore)}%` : "—",
            icon: <Target size={18} />,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
          },
          {
            label: "Quizzes Taken",
            value: String(stats?.completed ?? 0),
            icon: <BookOpen size={18} />,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
          },
          {
            label: "Upcoming",
            value: String(stats?.upcoming ?? 0),
            icon: <Clock size={18} />,
            color: "text-violet-400",
            bg: "bg-violet-400/10",
            border: "border-violet-400/20",
          },
          {
            label: "Completed",
            value: String(stats?.completed ?? 0),
            icon: <CheckCircle2 size={18} />,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20",
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-4 flex flex-col gap-2`}>
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
              <p className="text-xs text-gray-500">Recent attempts</p>
            </div>
            {scoreHistory.length >= 2 && (
              <div className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full ${trend >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {trend >= 0 ? "+" : ""}{trend}%
              </div>
            )}
          </div>
          {scoreHistory.length >= 2 ? (
            <Sparkline data={scoreHistory} />
          ) : (
            <div className="h-14 flex items-center justify-center text-gray-600 text-sm">
              Take some quizzes to see your trend
            </div>
          )}
        </div>

        {/* Batches */}
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-white font-bold">My Batches</h2>
            <p className="text-xs text-gray-500">Active enrollments</p>
          </div>
          <div className="flex flex-col flex-1 justify-center">
            {(data?.batches ?? []).length === 0 ? (
              <div className="text-center text-gray-600 text-sm py-4">
                No active batches
                <div className="mt-2">
                  <Link href="/join" className="text-amber-400 text-xs hover:underline">Join via code →</Link>
                </div>
              </div>
            ) : (
              (data?.batches ?? []).map(b => (
                <BatchBar key={b.id} name={b.name} subject={b.subject} color={b.color} />
              ))
            )}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <Award size={14} className="text-amber-400" />
            <span className="text-xs text-gray-400">
              {(data?.batches ?? []).length} active batch{(data?.batches ?? []).length !== 1 ? "es" : ""}
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
            <Link href="/dashboard/quizzes" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-white/5">
            {(data?.upcomingQuizzes ?? []).length === 0 ? (
              <div className="text-center text-gray-600 text-sm py-6">No upcoming quizzes</div>
            ) : (
              (data?.upcomingQuizzes ?? []).map((q) => (
                <div key={q.id} className="flex items-center justify-between py-3 group">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors">
                      {q.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {q.beginWindow && (
                        <span>{new Date(q.beginWindow).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      )}
                      {q.totalTimeLimit && <><span>·</span><span>{q.totalTimeLimit}m</span></>}
                      {q.totalQuestions > 0 && <><span>·</span><span>{q.totalQuestions}q</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 ${diffColor[q.difficulty] ?? diffColor.MEDIUM}`}>
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
              ))
            )}
          </div>
        </div>

        {/* Recent results */}
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold">Recent Results</h2>
            <Link href="/dashboard/results" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-white/5">
            {(data?.recentAttempts ?? []).length === 0 ? (
              <div className="text-center text-gray-600 text-sm py-6">No results yet</div>
            ) : (
              (data?.recentAttempts ?? []).map((a) => {
                const pct = Math.round(a.percentageScore ?? 0);
                const passed = a.passed ?? false;
                return (
                  <Link key={a.id} href={`/dashboard/results/${a.id}`} className="flex items-center justify-between py-3 hover:bg-white/3 rounded-xl px-1 -mx-1 transition">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white">Attempt #{a.id.slice(-6)}</span>
                      <span className="text-xs text-gray-500">
                        {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${passed ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-sm font-bold w-10 text-right ${passed ? "text-emerald-400" : "text-red-400"}`}>
                        {pct}%
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}