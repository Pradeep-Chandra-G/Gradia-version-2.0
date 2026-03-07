"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users,
  Building2,
  BookOpen,
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  ChevronRight,
  Globe,
  Zap,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type EventKind =
  | "signin"
  | "org_created"
  | "quiz_published"
  | "quiz_taken"
  | "user_registered";

type LiveEvent = {
  id: string;
  kind: EventKind;
  actor: string;
  detail: string;
  time: Date;
};

// ── Event config ──────────────────────────────────────────────────────────
const EVENT_CONFIG: Record<
  EventKind,
  { label: string; color: string; dot: string; icon: string }
> = {
  signin: {
    label: "User signed in",
    color: "text-blue-400",
    dot: "bg-blue-400",
    icon: "→",
  },
  org_created: {
    label: "Org created",
    color: "text-violet-400",
    dot: "bg-violet-400",
    icon: "+",
  },
  quiz_published: {
    label: "Quiz published",
    color: "text-amber-400",
    dot: "bg-amber-400",
    icon: "◎",
  },
  quiz_taken: {
    label: "Quiz attempt started",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
    icon: "▶",
  },
  user_registered: {
    label: "New user registered",
    color: "text-pink-400",
    dot: "bg-pink-400",
    icon: "✦",
  },
};

const SEED_EVENTS: LiveEvent[] = [
  {
    id: "e1",
    kind: "quiz_taken",
    actor: "Arjun Sharma",
    detail: "started Java Basics Test",
    time: new Date(Date.now() - 12000),
  },
  {
    id: "e2",
    kind: "signin",
    actor: "Priya Nair",
    detail: "signed in from Mumbai",
    time: new Date(Date.now() - 35000),
  },
  {
    id: "e3",
    kind: "quiz_published",
    actor: "Dr. Aris",
    detail: "published OS Memory Management",
    time: new Date(Date.now() - 68000),
  },
  {
    id: "e4",
    kind: "user_registered",
    actor: "Rohan Das",
    detail: "joined CSE-2026-A batch",
    time: new Date(Date.now() - 120000),
  },
  {
    id: "e5",
    kind: "org_created",
    actor: "Admin",
    detail: "created BITS Pilani org",
    time: new Date(Date.now() - 200000),
  },
  {
    id: "e6",
    kind: "quiz_taken",
    actor: "Karan Mehta",
    detail: "submitted DBMS Mid Term",
    time: new Date(Date.now() - 310000),
  },
  {
    id: "e7",
    kind: "signin",
    actor: "Sneha Iyer",
    detail: "signed in from Delhi",
    time: new Date(Date.now() - 400000),
  },
];

const SYNTHETIC_ACTORS = [
  "Dev Patel",
  "Isha Kulkarni",
  "Ananya Roy",
  "Vikram Singh",
  "Meera Joshi",
  "Rahul Gupta",
];
const SYNTHETIC_EVENTS: Array<{
  kind: EventKind;
  detailFn: (a: string) => string;
}> = [
  {
    kind: "signin",
    detailFn: (a) =>
      `signed in from ${["Chennai", "Pune", "Hyderabad", "Bangalore"][Math.floor(Math.random() * 4)]}`,
  },
  {
    kind: "quiz_taken",
    detailFn: (a) =>
      `started ${["Java Streams", "DBMS Transactions", "OS Deadlocks", "Advanced OOP"][Math.floor(Math.random() * 4)]}`,
  },
  {
    kind: "user_registered",
    detailFn: (a) =>
      `joined ${["CSE-2026-B", "CSE-2025-A", "MBA-2026"][Math.floor(Math.random() * 3)]} batch`,
  },
  {
    kind: "quiz_published",
    detailFn: (a) =>
      `published ${["Data Structures Quiz", "Network Security Test", "Algorithm Final"][Math.floor(Math.random() * 3)]}`,
  },
];

// ── Platform-wide stats ───────────────────────────────────────────────────
const platformStats = {
  totalUsers: 1240,
  activeOrgs: 18,
  quizzesLive: 34,
  attemptsToday: 287,
  avgScore: 74,
  passRate: 81,
};

// ── Monthly activity chart data ───────────────────────────────────────────
const monthlyData = [
  { month: "Sep", quizzes: 18, users: 210 },
  { month: "Oct", quizzes: 24, users: 310 },
  { month: "Nov", quizzes: 31, users: 480 },
  { month: "Dec", quizzes: 20, users: 390 },
  { month: "Jan", quizzes: 38, users: 620 },
  { month: "Feb", quizzes: 34, users: 720 },
];

// ── Top orgs ──────────────────────────────────────────────────────────────
const topOrgs = [
  { name: "BITS Pilani", students: 420, avgScore: 79, quizzes: 12 },
  { name: "IIT Bombay", students: 380, avgScore: 83, quizzes: 9 },
  { name: "NIT Trichy", students: 260, avgScore: 75, quizzes: 8 },
  { name: "VIT Vellore", students: 180, avgScore: 71, quizzes: 5 },
];

// ── Helpers ───────────────────────────────────────────────────────────────
function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

// ── Dual-line chart (quizzes vs users) ────────────────────────────────────
function DualLineChart() {
  const W = 400,
    H = 100,
    PAD = 16;
  const maxQ = Math.max(...monthlyData.map((d) => d.quizzes));
  const maxU = Math.max(...monthlyData.map((d) => d.users));
  const xs = monthlyData.map(
    (_, i) => PAD + (i / (monthlyData.length - 1)) * (W - PAD * 2),
  );
  const qY = (v: number) => H - PAD - (v / maxQ) * (H - PAD * 2);
  const uY = (v: number) => H - PAD - (v / maxU) * (H - PAD * 2);

  const qPts = monthlyData.map((d, i) => `${xs[i]},${qY(d.quizzes)}`).join(" ");
  const uPts = monthlyData.map((d, i) => `${xs[i]},${uY(d.users)}`).join(" ");
  const qArea =
    `M${xs[0]},${H} ` +
    monthlyData.map((d, i) => `L${xs[i]},${qY(d.quizzes)}`).join(" ") +
    ` L${xs[xs.length - 1]},${H} Z`;
  const uArea =
    `M${xs[0]},${H} ` +
    monthlyData.map((d, i) => `L${xs[i]},${uY(d.users)}`).join(" ") +
    ` L${xs[xs.length - 1]},${H} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28">
        <defs>
          <linearGradient id="qg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ug" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={uArea} fill="url(#ug)" />
        <path d={qArea} fill="url(#qg)" />
        <polyline
          points={uPts}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={qPts}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* dots on last point */}
        <circle
          cx={xs[xs.length - 1]}
          cy={qY(monthlyData[monthlyData.length - 1].quizzes)}
          r="3"
          fill="#f59e0b"
        />
        <circle
          cx={xs[xs.length - 1]}
          cy={uY(monthlyData[monthlyData.length - 1].users)}
          r="3"
          fill="#6366f1"
        />
      </svg>
      <div className="flex justify-between px-4 mt-1">
        {monthlyData.map((d) => (
          <span key={d.month} className="text-[9px] text-gray-600">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Live activity feed ────────────────────────────────────────────────────
function LiveActivityFeed() {
  const [events, setEvents] = useState<LiveEvent[]>(SEED_EVENTS);
  const [paused, setPaused] = useState(false);
  const [pulse, setPulse] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      const template =
        SYNTHETIC_EVENTS[Math.floor(Math.random() * SYNTHETIC_EVENTS.length)];
      const actor =
        SYNTHETIC_ACTORS[Math.floor(Math.random() * SYNTHETIC_ACTORS.length)];
      const newEvt: LiveEvent = {
        id: uid(),
        kind: template.kind,
        actor,
        detail: template.detailFn(actor),
        time: new Date(),
      };
      setEvents((prev) => [newEvt, ...prev].slice(0, 30));
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="bg-neutral-900 border border-white/8 rounded-2xl flex flex-col"
      style={{ height: 480 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${paused ? "bg-gray-500" : "bg-emerald-400"} ${!paused && "animate-pulse"}`}
          />
          <h2 className="text-white font-bold text-sm">Live Activity</h2>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
              pulse
                ? "bg-emerald-400/20 text-emerald-300"
                : "bg-neutral-800 text-gray-500"
            }`}
          >
            {events.length} events
          </span>
        </div>
        <button
          onClick={() => setPaused((p) => !p)}
          className={`text-[10px] font-semibold px-3 py-1 rounded-full border transition-colors ${
            paused
              ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
              : "border-white/10 bg-neutral-800 text-gray-400 hover:text-white"
          }`}
        >
          {paused ? "▶ Resume" : "⏸ Pause"}
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 py-2 border-b border-white/5">
        {(
          Object.entries(EVENT_CONFIG) as [
            EventKind,
            (typeof EVENT_CONFIG)[EventKind],
          ][]
        ).map(([k, v]) => (
          <span
            key={k}
            className="flex items-center gap-1.5 text-[9px] text-gray-500"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
            {v.label}
          </span>
        ))}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto no-scrollbar min-h-0">
        {events.map((evt, i) => {
          const cfg = EVENT_CONFIG[evt.kind];
          return (
            <div
              key={evt.id}
              className={`flex items-start gap-3 px-5 py-3 border-b border-white/3 transition-colors ${
                i === 0 && !paused ? "bg-white/3" : ""
              }`}
            >
              {/* dot */}
              <div className="mt-1.5 shrink-0">
                <div
                  className={`w-2 h-2 rounded-full ${cfg.dot} ${i === 0 && !paused ? "animate-pulse" : ""}`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-white leading-tight">
                  <span className="font-semibold">{evt.actor}</span>{" "}
                  <span className="text-gray-400">{evt.detail}</span>
                </p>
                <p className={`text-[10px] mt-0.5 ${cfg.color}`}>{cfg.label}</p>
              </div>

              <span className="text-[10px] text-gray-600 shrink-0 mt-0.5">
                {timeAgo(evt.time)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Org bar ───────────────────────────────────────────────────────────────
function OrgBar({
  org,
  maxStudents,
}: {
  org: (typeof topOrgs)[0];
  maxStudents: number;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    setTimeout(() => setW((org.students / maxStudents) * 100), 150);
  }, [org.students, maxStudents]);
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
        <Building2 size={14} className="text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-white font-medium truncate">
            {org.name}
          </span>
          <span className="text-xs text-gray-400 ml-2 shrink-0">
            {org.students} students
          </span>
        </div>
        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500/70 transition-all duration-700 ease-out"
            style={{ width: `${w}%` }}
          />
        </div>
      </div>
      <span
        className={`text-xs font-bold shrink-0 ${org.avgScore >= 80 ? "text-emerald-400" : "text-amber-400"}`}
      >
        {org.avgScore}%
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function AdminDashboard({ firstName }: { firstName: string }) {
  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto no-scrollbar">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">Platform Overview</p>
          <h1 className="text-4xl font-black text-white tracking-tight">
            {firstName} <span className="text-violet-400">::</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gradia Admin Console ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-xl px-4 py-2">
          <Shield size={16} className="text-violet-400" />
          <span className="text-violet-300 font-bold text-sm">Super Admin</span>
        </div>
      </div>

      {/* ── Stat strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: "Total Users",
            value: platformStats.totalUsers.toLocaleString(),
            icon: <Users size={16} />,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
          },
          {
            label: "Active Orgs",
            value: platformStats.activeOrgs,
            icon: <Building2 size={16} />,
            color: "text-violet-400",
            bg: "bg-violet-400/10",
            border: "border-violet-400/20",
          },
          {
            label: "Live Quizzes",
            value: platformStats.quizzesLive,
            icon: <BookOpen size={16} />,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
          },
          {
            label: "Attempts Today",
            value: platformStats.attemptsToday,
            icon: <Activity size={16} />,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20",
          },
          {
            label: "Platform Avg",
            value: `${platformStats.avgScore}%`,
            icon: <TrendingUp size={16} />,
            color: "text-cyan-400",
            bg: "bg-cyan-400/10",
            border: "border-cyan-400/20",
          },
          {
            label: "Pass Rate",
            value: `${platformStats.passRate}%`,
            icon: <Zap size={16} />,
            color: "text-pink-400",
            bg: "bg-pink-400/10",
            border: "border-pink-400/20",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border ${s.border} ${s.bg} p-4 flex flex-col gap-2`}
          >
            <div className={s.color}>{s.icon}</div>
            <div className="text-xl font-black text-white">{s.value}</div>
            <div className="text-[10px] text-gray-500 leading-tight">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main grid: chart + live feed ── */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Left col: charts + orgs */}
        <div className="md:col-span-3 flex flex-col gap-4">
          {/* Platform growth chart */}
          <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-white font-bold">Platform Growth</h2>
                <p className="text-xs text-gray-500">
                  Quizzes published vs user signups
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-0.5 bg-amber-400 rounded inline-block" />
                  Quizzes
                </span>
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-3 h-0.5 bg-indigo-400 rounded inline-block" />
                  Users
                </span>
              </div>
            </div>
            <DualLineChart />
          </div>

          {/* Top orgs */}
          <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Top Organisations</h2>
              <span className="text-xs text-gray-500">
                By student count · avg score
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {topOrgs.map((o) => (
                <OrgBar
                  key={o.name}
                  org={o}
                  maxStudents={Math.max(...topOrgs.map((x) => x.students))}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right col: live feed */}
        <div className="md:col-span-2 flex flex-col">
          <LiveActivityFeed />
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Manage Orgs",
            href: "/dashboard/admin/organisations",
            icon: <Building2 size={18} />,
            color: "hover:border-violet-500/40 hover:bg-violet-500/5",
          },
          {
            label: "Manage Batches",
            href: "/dashboard/admin/batches",
            icon: <Users size={18} />,
            color: "hover:border-blue-500/40 hover:bg-blue-500/5",
          },
          {
            label: "All Quizzes",
            href: "/dashboard/admin/quizzes",
            icon: <BookOpen size={18} />,
            color: "hover:border-amber-500/40 hover:bg-amber-500/5",
          },
          {
            label: "Analytics",
            href: "/dashboard/admin/analytics",
            icon: <Globe size={18} />,
            color: "hover:border-emerald-500/40 hover:bg-emerald-500/5",
          },
        ].map((a) => (
          <a
            key={a.label}
            href={a.href}
            className={`flex items-center gap-3 bg-neutral-900 border border-white/8 rounded-2xl p-4 text-sm font-medium text-gray-300 transition-all duration-150 ${a.color} hover:text-white`}
          >
            <span className="text-gray-500">{a.icon}</span>
            {a.label}
            <ChevronRight size={14} className="ml-auto text-gray-600" />
          </a>
        ))}
      </div>
    </div>
  );
}
