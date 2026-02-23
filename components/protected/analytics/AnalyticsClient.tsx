"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react";

// ── Data ──────────────────────────────────────────────────────────────────
const scoreHistory = [
  { label: "Dec '25", score: 55, classAvg: 68 },
  { label: "Jan '26", score: 67, classAvg: 70 },
  { label: "Jan '26", score: 74, classAvg: 71 },
  { label: "Jan '26", score: 71, classAvg: 69 },
  { label: "Feb '26", score: 82, classAvg: 73 },
  { label: "Feb '26", score: 88, classAvg: 75 },
  { label: "Feb '26", score: 91, classAvg: 74 },
];

const subjectData = [
  { subject: "Java", avg: 88, attempts: 6, best: 91, worst: 55 },
  { subject: "DBMS", avg: 77, attempts: 4, best: 88, worst: 67 },
  { subject: "OS", avg: 72, attempts: 3, best: 74, worst: 70 },
];

const weekActivity = [
  3, 0, 1, 2, 0, 4, 1, 0, 2, 3, 1, 0, 2, 0, 1, 3, 2, 0, 1, 4, 2, 3, 0, 1, 2, 0,
  1, 3, 2, 1,
];

const SUBJECT_COLORS: Record<string, string> = {
  Java: "#f59e0b",
  DBMS: "#6366f1",
  OS: "#10b981",
};

// ── SVG line chart (score vs class avg) ───────────────────────────────────
function LineChart() {
  const W = 500,
    H = 120,
    PAD = 20;
  const scores = scoreHistory.map((d) => d.score);
  const avgs = scoreHistory.map((d) => d.classAvg);
  const allVals = [...scores, ...avgs];
  const minV = Math.min(...allVals) - 8;
  const maxV = Math.max(...allVals) + 8;

  const x = (i: number) =>
    PAD + (i / (scoreHistory.length - 1)) * (W - PAD * 2);
  const y = (v: number) =>
    H - PAD - ((v - minV) / (maxV - minV)) * (H - PAD * 2);

  const sPts = scores.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const aPts = avgs.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const sArea =
    `M${x(0)},${H} ` +
    scores.map((v, i) => `L${x(i)},${y(v)}`).join(" ") +
    ` L${x(scores.length - 1)},${H} Z`;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36">
        <defs>
          <linearGradient id="sg2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <clipPath id="reveal">
            <rect
              x="0"
              y="0"
              height={H}
              width={mounted ? W : 0}
              style={{ transition: "width 1.2s ease-out" }}
            />
          </clipPath>
        </defs>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD}
            y1={y(minV + (maxV - minV) * f)}
            x2={W - PAD}
            y2={y(minV + (maxV - minV) * f)}
            stroke="#262626"
            strokeWidth="1"
          />
        ))}
        {/* Area */}
        <path d={sArea} fill="url(#sg2)" clipPath="url(#reveal)" />
        {/* Class avg line */}
        <polyline
          points={aPts}
          fill="none"
          stroke="#6366f1"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
          clipPath="url(#reveal)"
        />
        {/* Score line */}
        <polyline
          points={sPts}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath="url(#reveal)"
        />
        {/* Dots */}
        {scores.map((v, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r="3.5"
            fill="#f59e0b"
            clipPath="url(#reveal)"
          />
        ))}
      </svg>
      {/* X labels */}
      <div className="flex justify-between px-5 mt-1">
        {scoreHistory.map((d, i) => (
          <span key={i} className="text-[9px] text-gray-600">
            {d.label}
          </span>
        ))}
      </div>
      {/* Legend */}
      <div className="flex gap-5 mt-2 px-1">
        <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span className="w-3 h-0.5 bg-amber-400 rounded inline-block" /> Your
          score
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <span
            className="w-3 h-0.5 bg-indigo-400 rounded inline-block"
            style={{ borderTop: "1px dashed" }}
          />{" "}
          Class avg
        </span>
      </div>
    </div>
  );
}

// ── Radar-style subject breakdown (SVG polygon) ────────────────────────────
function SubjectRadar() {
  const size = 160;
  const cx = size / 2,
    cy = size / 2;
  const r = 60;
  const labels = subjectData.map((d) => d.subject);
  const n = labels.length;

  const angle = (i: number) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const pt = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => setMounted(true), 200);
  }, []);

  const spokes = subjectData.map((d, i) => {
    const actual = mounted ? (d.avg / 100) * r : 0;
    const p = pt(i, actual);
    return { ...p, color: SUBJECT_COLORS[d.subject] };
  });

  const polyPts = spokes.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Rings */}
        {[0.33, 0.66, 1].map((f) => (
          <polygon
            key={f}
            points={Array.from({ length: n }, (_, i) => {
              const p = pt(i, r * f);
              return `${p.x},${p.y}`;
            }).join(" ")}
            fill="none"
            stroke="#262626"
            strokeWidth="1"
          />
        ))}
        {/* Spokes */}
        {Array.from({ length: n }, (_, i) => {
          const p = pt(i, r);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="#2a2a2a"
              strokeWidth="1"
            />
          );
        })}
        {/* Data polygon */}
        <polygon
          points={polyPts}
          fill="rgba(245,158,11,0.15)"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{ transition: "all 0.8s ease-out" }}
        />
        {/* Dots */}
        {spokes.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={p.color}
            style={{ transition: "all 0.8s ease-out" }}
          />
        ))}
        {/* Labels */}
        {subjectData.map((d, i) => {
          const p = pt(i, r + 14);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="700"
              fill={SUBJECT_COLORS[d.subject]}
            >
              {d.subject}
            </text>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex flex-col gap-2 w-full">
        {subjectData.map((d) => (
          <div
            key={d.subject}
            className="flex items-center justify-between text-xs"
          >
            <span className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: SUBJECT_COLORS[d.subject] }}
              />
              <span className="text-gray-400">{d.subject}</span>
            </span>
            <span className="font-bold text-white">{d.avg}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Activity heatmap ──────────────────────────────────────────────────────
function ActivityHeatmap() {
  const maxAct = Math.max(...weekActivity);
  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">Quiz attempts — last 30 days</p>
      <div className="flex gap-1.5 flex-wrap">
        {weekActivity.map((v, i) => {
          const opacity = v === 0 ? 0.06 : 0.2 + (v / maxAct) * 0.8;
          return (
            <div
              key={i}
              title={`Day ${i + 1}: ${v} attempt${v !== 1 ? "s" : ""}`}
              className="w-7 h-7 rounded-md cursor-default transition-transform hover:scale-110"
              style={{ backgroundColor: `rgba(245, 158, 11, ${opacity})` }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-gray-600">Less</span>
        {[0.06, 0.3, 0.55, 0.8, 1].map((o) => (
          <div
            key={o}
            className="w-3.5 h-3.5 rounded-sm"
            style={{ backgroundColor: `rgba(245,158,11,${o})` }}
          />
        ))}
        <span className="text-[10px] text-gray-600">More</span>
      </div>
    </div>
  );
}

// ── Per-subject stat cards ────────────────────────────────────────────────
function SubjectCards() {
  const [anim, setAnim] = useState(false);
  useEffect(() => {
    setTimeout(() => setAnim(true), 100);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {subjectData.map((d) => {
        const color = SUBJECT_COLORS[d.subject];
        const trend = d.best - d.worst;
        return (
          <div
            key={d.subject}
            className="bg-neutral-900 border border-white/8 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">{d.subject}</h3>
              <span className="text-xs text-gray-500">
                {d.attempts} quizzes
              </span>
            </div>
            <div className="text-3xl font-black mb-3" style={{ color }}>
              {d.avg}%
            </div>
            {/* Bar */}
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: anim ? `${d.avg}%` : "0%",
                  backgroundColor: color,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                Best <span className="text-white font-semibold">{d.best}%</span>
              </span>
              <span>
                Worst{" "}
                <span className="text-white font-semibold">{d.worst}%</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function AnalyticsClient() {
  const latest = scoreHistory[scoreHistory.length - 1];
  const prev = scoreHistory[scoreHistory.length - 2];
  const trendV = latest.score - prev.score;
  const vsClass = latest.score - latest.classAvg;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto no-scrollbar">
      {/* Header */}
      <div>
        <p className="text-gray-500 text-sm mb-1">Your performance insights</p>
        <h1 className="text-4xl font-black text-white tracking-tight">
          Analytics
        </h1>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Latest Score",
            value: `${latest.score}%`,
            icon: <Target size={16} />,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
            sub:
              trendV >= 0
                ? `↑ ${trendV}% vs last`
                : `↓ ${Math.abs(trendV)}% vs last`,
          },
          {
            label: "vs Class Avg",
            value: `${vsClass > 0 ? "+" : ""}${vsClass}%`,
            icon: <Zap size={16} />,
            color: vsClass >= 0 ? "text-emerald-400" : "text-red-400",
            bg: vsClass >= 0 ? "bg-emerald-400/10" : "bg-red-400/10",
            border:
              vsClass >= 0 ? "border-emerald-400/20" : "border-red-400/20",
            sub: "relative to peers",
          },
          {
            label: "Best Subject",
            value: "Java",
            icon: <TrendingUp size={16} />,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
            sub: "88% average",
          },
          {
            label: "Improvement",
            value: `+${scoreHistory[scoreHistory.length - 1].score - scoreHistory[0].score}%`,
            icon: <TrendingUp size={16} />,
            color: "text-violet-400",
            bg: "bg-violet-400/10",
            border: "border-violet-400/20",
            sub: "since first quiz",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border ${s.border} ${s.bg} p-4`}
          >
            <div className={s.color}>{s.icon}</div>
            <div className={`text-2xl font-black mt-2 ${s.color}`}>
              {s.value}
            </div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            <div className="text-[10px] text-gray-600 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Line chart + Radar */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-1">Score Trend</h2>
          <p className="text-xs text-gray-500 mb-4">
            Your score vs class average over time
          </p>
          <LineChart />
        </div>
        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <h2 className="text-white font-bold mb-1">Subject Breakdown</h2>
          <p className="text-xs text-gray-500 mb-4">
            Average score per subject
          </p>
          <SubjectRadar />
        </div>
      </div>

      {/* Per-subject cards */}
      <div>
        <h2 className="text-white font-bold mb-4">Subject Performance</h2>
        <SubjectCards />
      </div>

      {/* Activity heatmap */}
      <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
        <h2 className="text-white font-bold mb-1">Activity</h2>
        <ActivityHeatmap />
      </div>
    </div>
  );
}
