"use client";

import { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Award,
  AlertTriangle,
  Layers,
} from "lucide-react";
import {
  mockBatches,
  mockSubmissions,
  mockQuizzes,
} from "@/data/instructorData";

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// ── Line chart (score trend over quizzes) ────────────────────────────────────
function TrendChart({ batchId }: { batchId: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const batchQuizzes = mockQuizzes
    .filter((q) => q.batchId === batchId && q.avgScore != null && q.publishedAt)
    .sort((a, b) => (a.publishedAt ?? "").localeCompare(b.publishedAt ?? ""));

  if (batchQuizzes.length < 2)
    return (
      <div className="flex items-center justify-center h-32 text-gray-600 text-sm">
        Not enough data
      </div>
    );

  const scores = batchQuizzes.map((q) => q.avgScore!);
  const labels = batchQuizzes.map((q) =>
    q.title.split(" ").slice(0, 2).join(" "),
  );
  const W = 460;
  const H = 100;
  const minV = Math.min(...scores, 40);
  const maxV = Math.max(...scores, 100);
  const x = (i: number) => (i / (scores.length - 1)) * W;
  const y = (v: number) => H - ((v - minV) / (maxV - minV)) * H;
  const pts = scores.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area =
    `M${x(0)},${H} ` +
    scores.map((v, i) => `L${x(i)},${y(v)}`).join(" ") +
    ` L${x(scores.length - 1)},${H} Z`;
  const pass = H - ((60 - minV) / (maxV - minV)) * H;

  return (
    <div className="overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H + 24}`}
        className="w-full"
        style={{ height: 140 }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <clipPath id="revealTrend">
            <rect
              x="0"
              y="0"
              width={mounted ? W : 0}
              height={H + 24}
              style={{ transition: "width 1s ease" }}
            />
          </clipPath>
        </defs>
        {/* Pass line */}
        <line
          x1="0"
          y1={pass}
          x2={W}
          y2={pass}
          stroke="#22c55e"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.4"
        />
        <text x="4" y={pass - 4} fill="#22c55e" fontSize="9" opacity="0.5">
          Pass (60%)
        </text>
        {/* Area + line */}
        <path d={area} fill="url(#areaGrad)" clipPath="url(#revealTrend)" />
        <polyline
          points={pts}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath="url(#revealTrend)"
        />
        {/* Dots */}
        {scores.map((v, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r="3.5"
            fill="#f59e0b"
            clipPath="url(#revealTrend)"
          />
        ))}
        {/* Labels */}
        {labels.map((l, i) => (
          <text
            key={i}
            x={x(i)}
            y={H + 18}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="8"
          >
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ── Radar / subject comparison ────────────────────────────────────────────────
function SubjectRadar({ batchId }: { batchId: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 150);
  }, []);

  const batch = mockBatches.find((b) => b.id === batchId);
  if (!batch) return null;

  const subjects = ["Java", "DBMS", "OS", "IT"];
  const subjectAvgs = subjects
    .map((sub) => {
      const quizIds = mockQuizzes
        .filter(
          (q) =>
            q.batchId === batchId && q.subject === sub && q.avgScore != null,
        )
        .map((q) => q.id);
      const subs = mockSubmissions.filter((s) => quizIds.includes(s.quizId));
      return subs.length ? avg(subs.map((s) => s.pct)) : 0;
    })
    .filter((_, i) => {
      const sub = subjects[i];
      return mockQuizzes.some(
        (q) => q.batchId === batchId && q.subject === sub,
      );
    });

  const activeSubjects = subjects.filter((sub) =>
    mockQuizzes.some((q) => q.batchId === batchId && q.subject === sub),
  );
  if (activeSubjects.length < 2) return null;

  const n = activeSubjects.length;
  const CX = 100;
  const CY = 100;
  const R = 75;
  const pt = (i: number, r: number) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  };

  const outerPts = Array.from({ length: n }, (_, i) => pt(i, R));
  const scorePts = subjectAvgs.map((v, i) =>
    pt(i, mounted ? (v / 100) * R : 0),
  );

  return (
    <svg viewBox="0 0 200 200" className="w-full" style={{ height: 180 }}>
      {[0.33, 0.66, 1].map((f) => (
        <polygon
          key={f}
          points={outerPts
            .map((p) => {
              const dx = p.x - CX;
              const dy = p.y - CY;
              return `${CX + dx * f},${CY + dy * f}`;
            })
            .join(" ")}
          fill="none"
          stroke="#262626"
          strokeWidth="1"
        />
      ))}
      {outerPts.map((p, i) => (
        <line
          key={i}
          x1={CX}
          y1={CY}
          x2={p.x}
          y2={p.y}
          stroke="#262626"
          strokeWidth="1"
        />
      ))}
      <polygon
        points={scorePts.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="#f59e0b"
        fillOpacity="0.2"
        stroke="#f59e0b"
        strokeWidth="1.5"
        style={{ transition: "all 0.8s ease" }}
      />
      {activeSubjects.map((sub, i) => {
        const p = pt(i, R + 14);
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#9ca3af"
            fontSize="9"
          >
            {sub}
          </text>
        );
      })}
      {subjectAvgs.map((v, i) => {
        const p = pt(i, mounted ? (v / 100) * R : 0);
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="#f59e0b"
            style={{ transition: "all 0.8s ease" }}
          />
        );
      })}
    </svg>
  );
}

// ── Student performance table ─────────────────────────────────────────────────
function StudentLeaderboard({ batchId }: { batchId: string }) {
  const batch = mockBatches.find((b) => b.id === batchId);
  if (!batch) return null;

  const students = batch.students
    .map((s) => ({
      ...s,
      avgScore: avg(s.scores),
      trend:
        s.scores.length >= 2 ? s.scores[s.scores.length - 1] - s.scores[0] : 0,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  return (
    <div className="flex flex-col">
      {students.slice(0, 8).map((s, i) => (
        <div
          key={s.id}
          className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0"
        >
          <span
            className={`text-xs font-bold w-5 text-center shrink-0 ${i === 0 ? "text-amber-400" : "text-gray-600"}`}
          >
            {i + 1}
          </span>
          <div className="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-gray-300">
              {s.avatar}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white truncate">{s.name}</p>
            <div className="h-1 bg-neutral-800 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full rounded-full ${s.avgScore >= 75 ? "bg-emerald-500" : s.avgScore >= 50 ? "bg-amber-400" : "bg-red-500"}`}
                style={{ width: `${s.avgScore}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`text-xs font-bold ${s.avgScore >= 75 ? "text-emerald-400" : s.avgScore >= 50 ? "text-amber-400" : "text-red-400"}`}
            >
              {s.avgScore}%
            </span>
            {s.trend > 0 ? (
              <TrendingUp size={11} className="text-emerald-400" />
            ) : s.trend < 0 ? (
              <TrendingDown size={11} className="text-red-400" />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Activity heatmap (30-day) ────────────────────────────────────────────────
function ActivityHeatmap() {
  const today = new Date();
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (34 - i));
    // Mock activity: random 0-4 submissions per day
    const seed = d.getDate() + d.getMonth() * 31;
    const activity =
      seed % 7 === 0
        ? 0
        : seed % 5 === 0
          ? 4
          : seed % 3 === 0
            ? 3
            : seed % 2 === 0
              ? 2
              : 1;
    return { date: d.toISOString().slice(0, 10), activity };
  });

  const maxAct = 4;
  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => (
          <div
            key={d.date}
            title={`${d.date}: ${d.activity} submission${d.activity !== 1 ? "s" : ""}`}
            className="aspect-square rounded-sm transition-colors"
            style={{
              background:
                d.activity === 0
                  ? "#1a1a1a"
                  : `rgba(245,158,11,${0.2 + (d.activity / maxAct) * 0.8})`,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 justify-end">
        <span className="text-[9px] text-gray-600">Less</span>
        {[0, 1, 2, 3, 4].map((v) => (
          <div
            key={v}
            className="w-3 h-3 rounded-sm"
            style={{
              background:
                v === 0 ? "#1a1a1a" : `rgba(245,158,11,${0.2 + (v / 4) * 0.8})`,
            }}
          />
        ))}
        <span className="text-[9px] text-gray-600">More</span>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function InstructorAnalyticsClient() {
  const [batchId, setBatchId] = useState(mockBatches[0]?.id ?? "");
  const batch = mockBatches.find((b) => b.id === batchId) ?? mockBatches[0];

  const batchSubs = useMemo(() => {
    const quizIds = mockQuizzes
      .filter((q) => q.batchId === batchId)
      .map((q) => q.id);
    return mockSubmissions.filter((s) => quizIds.includes(s.quizId));
  }, [batchId]);

  const batchAvg = batchSubs.length ? avg(batchSubs.map((s) => s.pct)) : 0;
  const passRate = batchSubs.length
    ? Math.round(
        (batchSubs.filter((s) => s.passed).length / batchSubs.length) * 100,
      )
    : 0;
  const totalStudents = batch?.students.length ?? 0;
  const publishedQuizzes = mockQuizzes.filter(
    (q) => q.batchId === batchId && q.status !== "draft",
  ).length;

  return (
    <div className="p-6 md:p-8 text-white min-h-full">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">
            Batch performance insights and trends
          </p>
        </div>
        <select
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          className="bg-neutral-900 border border-white/8 rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-white/20 transition"
        >
          {mockBatches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            l: "Students",
            v: totalStudents,
            c: "text-white",
            bg: "bg-neutral-800/50",
            b: "border-white/8",
          },
          {
            l: "Avg Score",
            v: `${batchAvg}%`,
            c:
              batchAvg >= 75
                ? "text-emerald-400"
                : batchAvg >= 50
                  ? "text-amber-400"
                  : "text-red-400",
            bg: "bg-neutral-800/50",
            b: "border-white/8",
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
            bg: "bg-neutral-800/50",
            b: "border-white/8",
          },
          {
            l: "Quizzes Run",
            v: publishedQuizzes,
            c: "text-amber-400",
            bg: "bg-amber-500/10",
            b: "border-amber-500/15",
          },
        ].map((s) => (
          <div key={s.l} className={`${s.bg} border ${s.b} rounded-2xl p-4`}>
            <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Score trend */}
        <div className="lg:col-span-2 bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={14} className="text-gray-500" /> Score Trend
            </h2>
            <span className="text-xs text-gray-600">Avg per quiz</span>
          </div>
          <TrendChart batchId={batchId} />
        </div>

        {/* Subject radar */}
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <BarChart3 size={14} className="text-gray-500" /> Subject Breakdown
          </h2>
          <SubjectRadar batchId={batchId} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Student leaderboard */}
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Award size={14} className="text-gray-500" /> Student Rankings
            <span className="text-xs text-gray-600 ml-auto font-normal">
              {batch?.name}
            </span>
          </h2>
          <StudentLeaderboard batchId={batchId} />
          {(batch?.students.length ?? 0) === 0 && (
            <p className="text-xs text-gray-600 text-center py-6">
              No students in this batch yet
            </p>
          )}
        </div>

        {/* Activity heatmap */}
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Users size={14} className="text-gray-500" /> Submission Activity
            (35 days)
          </h2>
          <ActivityHeatmap />

          {/* At-risk students */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-3">
              <AlertTriangle size={12} /> Needs Attention
            </h3>
            {batch?.students
              .filter((s) => avg(s.scores) < 60)
              .slice(0, 3)
              .map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 mb-2">
                  <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold text-gray-400">
                      {s.avatar}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 flex-1 truncate">
                    {s.name}
                  </span>
                  <span className="text-xs font-bold text-red-400">
                    {avg(s.scores)}%
                  </span>
                </div>
              ))}
            {(batch?.students.filter((s) => avg(s.scores) < 60).length ?? 0) ===
              0 && (
              <p className="text-xs text-emerald-500">
                All students performing well ✓
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
