"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  TrendingUp,
  Target,
  Award,
  BookOpen,
  BarChart3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Analytics = {
  summary: {
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    passRate: number;
    totalTimeSpent: number;
  };
  scoreHistory: {
    date: string;
    score: number;
    passed: boolean;
    quizTitle: string;
  }[];
  subjectPerformance: {
    subject: string;
    attempts: number;
    average: number;
    passRate: number;
  }[];
  recentTrend: number; // positive = improving
};

function MiniBar({
  value,
  max = 100,
  color = "bg-amber-400",
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  return (
    <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

function ScoreChart({ history }: { history: Analytics["scoreHistory"] }) {
  if (history.length < 2)
    return (
      <div className="h-32 flex items-center justify-center text-gray-600 text-sm">
        Complete more quizzes to see your trend
      </div>
    );

  const max = 100;
  const width = 600;
  const height = 120;
  const padding = { top: 10, bottom: 20, left: 30, right: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = history.slice(-20).map((h, i, arr) => {
    const x = padding.left + (i / (arr.length - 1)) * chartW;
    const y = padding.top + chartH - (h.score / max) * chartH;
    return { x, y, ...h };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: 120 }}
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padding.top + chartH - (v / max) * chartH;
          return (
            <g key={v}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#262626"
                strokeWidth="1"
              />
              <text
                x={padding.left - 4}
                y={y + 4}
                fill="#6b7280"
                fontSize="8"
                textAnchor="end"
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Area */}
        <path d={areaD} fill="url(#scoreGrad)" opacity="0.3" />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={p.passed ? "#10b981" : "#ef4444"}
            stroke="#0a0a0a"
            strokeWidth="1.5"
          />
        ))}

        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function formatTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AnalyticsClient() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/analytics")
      .then((r) => r.json())
      .then((d) => setData(d.analytics ?? d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-amber-400" size={28} />
      </div>
    );
  }

  if (!data) return null;

  const summary = data.summary ?? {
    totalAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    passRate: 0,
    totalTimeSpent: 0,
  };

  const scoreHistory = data.scoreHistory ?? [];
  const subjectPerformance = data.subjectPerformance ?? [];
  const improving = data.recentTrend >= 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Your performance overview
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Avg Score",
            value: `${Math.round(summary.averageScore)}%`,
            icon: <Target size={16} />,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
          },
          {
            label: "Pass Rate",
            value: `${Math.round(summary.passRate)}%`,
            icon: <CheckCircle2 size={16} />,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20",
          },
          {
            label: "Best Score",
            value: `${Math.round(summary.highestScore)}%`,
            icon: <Award size={16} />,
            color: "text-violet-400",
            bg: "bg-violet-400/10",
            border: "border-violet-400/20",
          },
          {
            label: "Total Quizzes",
            value: String(summary.totalAttempts),
            icon: <BookOpen size={16} />,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
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

      {/* Score history chart */}
      <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-bold">Score History</h2>
            <p className="text-xs text-gray-500">
              Last {Math.min(20, scoreHistory.length)} attempts
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${improving ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
          >
            <TrendingUp size={12} className={improving ? "" : "rotate-180"} />
            {improving ? "Improving" : "Declining"}
          </div>
        </div>
        <ScoreChart history={scoreHistory} />
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Passed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Failed
          </span>
        </div>
      </div>

      {/* Subject performance */}
      {subjectPerformance.length > 0 && (
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <div className="mb-4">
            <h2 className="text-white font-bold">Performance by Subject</h2>
            <p className="text-xs text-gray-500">Average scores per subject</p>
          </div>
          <div className="flex flex-col gap-4">
            {subjectPerformance.map((s) => (
              <div key={s.subject} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-medium">{s.subject}</span>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      {s.attempts} attempt{s.attempts !== 1 ? "s" : ""}
                    </span>
                    <span
                      className={`font-bold ${s.average >= 60 ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {Math.round(s.average)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MiniBar
                    value={s.average}
                    color={s.average >= 60 ? "bg-emerald-500" : "bg-red-500"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time stats */}
      {summary.totalTimeSpent > 0 && (
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-white font-bold">
              {formatTime(summary.totalTimeSpent)}
            </p>
            <p className="text-xs text-gray-500">Total time spent on quizzes</p>
          </div>
        </div>
      )}
    </div>
  );
}
