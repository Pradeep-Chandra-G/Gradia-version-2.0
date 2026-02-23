"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
} from "lucide-react";

// ── Mock completed attempts ───────────────────────────────────────────────
export const mockResults = [
  {
    id: "r1",
    quizId: "2",
    title: "Spring Boot Fundamentals",
    course: "Java",
    instructor: "Prof. Sarah",
    date: "2026-02-18",
    duration: 38,
    score: 82,
    maxScore: 100,
    pct: 82,
    passed: true,
    breakdown: [
      {
        q: "@SpringBootApplication annotation",
        correct: true,
        earned: 4,
        max: 4,
        explanation:
          "@SpringBootApplication combines @Configuration, @EnableAutoConfiguration, and @ComponentScan.",
      },
      {
        q: "Valid Spring Boot starters",
        correct: true,
        earned: 4,
        max: 4,
        explanation:
          "spring-boot-starter-orm does not exist. The correct one is spring-boot-starter-data-jpa.",
      },
      {
        q: "Spring Boot requires XML config",
        correct: true,
        earned: 4,
        max: 4,
        explanation: "Spring Boot uses auto-configuration — no XML needed.",
      },
      {
        q: "@GetMapping annotation",
        correct: false,
        earned: 0,
        max: 4,
        explanation:
          "@GetMapping is shorthand for @RequestMapping(method = RequestMethod.GET).",
      },
      {
        q: "@Autowired annotation purpose",
        correct: true,
        earned: 4,
        max: 4,
        explanation:
          "@Autowired tells Spring to inject the matching bean automatically.",
      },
    ],
  },
  {
    id: "r2",
    quizId: "3",
    title: "DBMS Mid Term",
    course: "DBMS",
    instructor: "Dr. Elena",
    date: "2026-02-12",
    duration: 110,
    score: 67,
    maxScore: 100,
    pct: 67,
    passed: true,
    breakdown: [
      {
        q: "Relational algebra duplicate removal",
        correct: true,
        earned: 3,
        max: 3,
        explanation:
          "Projection removes duplicates when projecting onto a subset of attributes.",
      },
      {
        q: "Foreign key must ref primary key",
        correct: false,
        earned: 0,
        max: 3,
        explanation:
          "A foreign key can reference any column with a UNIQUE constraint.",
      },
      {
        q: "SQL clauses used with GROUP BY",
        correct: true,
        earned: 3,
        max: 3,
        explanation: "HAVING, WHERE, ORDER BY can all be used with GROUP BY.",
      },
      {
        q: "Result of NATURAL JOIN",
        correct: true,
        earned: 3,
        max: 3,
        explanation:
          "NATURAL JOIN automatically joins on all matching column names.",
      },
      {
        q: "Normal form for transitive deps",
        correct: false,
        earned: 0,
        max: 3,
        explanation: "3NF removes transitive dependencies.",
      },
    ],
  },
  {
    id: "r3",
    quizId: "5",
    title: "Advanced Java OOP",
    course: "Java",
    instructor: "Prof. Rahul",
    date: "2026-02-05",
    duration: 68,
    score: 91,
    maxScore: 100,
    pct: 91,
    passed: true,
    breakdown: [
      {
        q: "Inheritance concept",
        correct: true,
        earned: 5,
        max: 5,
        explanation:
          "Inheritance allows a class to acquire properties of another class.",
      },
      {
        q: "Polymorphism types",
        correct: true,
        earned: 5,
        max: 5,
        explanation:
          "Compile-time (overloading) and runtime (overriding) are the two types.",
      },
      {
        q: "Abstraction purpose",
        correct: true,
        earned: 5,
        max: 5,
        explanation:
          "Abstraction hides implementation details, exposing only the interface.",
      },
      {
        q: "Encapsulation benefit",
        correct: false,
        earned: 0,
        max: 5,
        explanation:
          "Encapsulation bundles data and methods, controlling access via modifiers.",
      },
      {
        q: "SOLID principles",
        correct: true,
        earned: 5,
        max: 5,
        explanation:
          "SOLID: Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion.",
      },
    ],
  },
  {
    id: "r4",
    quizId: "10",
    title: "OS Scheduling Algorithms",
    course: "OS",
    instructor: "Dr. Kumar",
    date: "2026-01-30",
    duration: 52,
    score: 74,
    maxScore: 100,
    pct: 74,
    passed: true,
    breakdown: [
      {
        q: "FCFS characteristics",
        correct: true,
        earned: 4,
        max: 4,
        explanation:
          "FCFS is non-preemptive and simple but can cause convoy effect.",
      },
      {
        q: "SJF scheduling type",
        correct: false,
        earned: 0,
        max: 4,
        explanation: "SJF can be both preemptive (SRTF) and non-preemptive.",
      },
      {
        q: "Priority scheduling starvation",
        correct: true,
        earned: 4,
        max: 4,
        explanation:
          "Low priority processes may starve. Aging is used to prevent this.",
      },
      {
        q: "Round Robin time quantum",
        correct: true,
        earned: 4,
        max: 4,
        explanation:
          "A smaller quantum means more context switches but better responsiveness.",
      },
      {
        q: "Turnaround time formula",
        correct: false,
        earned: 0,
        max: 4,
        explanation: "Turnaround = Completion time – Arrival time.",
      },
    ],
  },
  {
    id: "r5",
    quizId: "6",
    title: "DBMS Normalization Quiz",
    course: "DBMS",
    instructor: "Dr. Elena",
    date: "2026-01-22",
    duration: 37,
    score: 88,
    maxScore: 100,
    pct: 88,
    passed: true,
    breakdown: [
      {
        q: "1NF requirement",
        correct: true,
        earned: 4,
        max: 4,
        explanation: "1NF requires atomic values and no repeating groups.",
      },
      {
        q: "2NF and partial deps",
        correct: true,
        earned: 4,
        max: 4,
        explanation: "2NF removes partial dependencies on the primary key.",
      },
      {
        q: "3NF transitive deps",
        correct: true,
        earned: 4,
        max: 4,
        explanation:
          "3NF removes transitive dependencies between non-key attributes.",
      },
      {
        q: "BCNF definition",
        correct: false,
        earned: 0,
        max: 4,
        explanation: "In BCNF, every determinant must be a candidate key.",
      },
      {
        q: "Functional dependency",
        correct: true,
        earned: 4,
        max: 4,
        explanation: "X → Y means knowing X uniquely determines Y.",
      },
    ],
  },
  {
    id: "r6",
    quizId: "8",
    title: "Java Collections Deep Dive",
    course: "Java",
    instructor: "Prof. Sarah",
    date: "2025-12-28",
    duration: 45,
    score: 55,
    maxScore: 100,
    pct: 55,
    passed: false,
    breakdown: [
      {
        q: "ArrayList vs LinkedList",
        correct: false,
        earned: 0,
        max: 4,
        explanation:
          "ArrayList is O(1) for get, LinkedList is O(1) for add/remove at ends.",
      },
      {
        q: "HashMap collision",
        correct: false,
        earned: 0,
        max: 4,
        explanation:
          "HashMap uses chaining or open addressing to handle collisions.",
      },
      {
        q: "Set allows duplicates",
        correct: true,
        earned: 4,
        max: 4,
        explanation: "Set does not allow duplicate elements by contract.",
      },
      {
        q: "Iterator usage",
        correct: true,
        earned: 4,
        max: 4,
        explanation:
          "Iterator allows sequential traversal and safe removal during iteration.",
      },
      {
        q: "Generics purpose",
        correct: false,
        earned: 0,
        max: 4,
        explanation:
          "Generics provide compile-time type safety and eliminate casts.",
      },
    ],
  },
];

const COURSES = ["All", "Java", "DBMS", "OS"];

function ScoreRing({ pct, passed }: { pct: number; passed: boolean }) {
  const r = 20,
    circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0">
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="#262626"
        strokeWidth="5"
      />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke={passed ? "#10b981" : "#ef4444"}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text
        x="26"
        y="30"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill={passed ? "#10b981" : "#ef4444"}
      >
        {pct}%
      </text>
    </svg>
  );
}

export default function ResultsClient({ firstName }: { firstName: string }) {
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "score" | "course">("date");
  const [filterPass, setFilterPass] = useState<"all" | "passed" | "failed">(
    "all",
  );

  const filtered = useMemo(() => {
    let d = [...mockResults];
    if (search.trim())
      d = d.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));
    if (course !== "All") d = d.filter((r) => r.course === course);
    if (filterPass === "passed") d = d.filter((r) => r.passed);
    if (filterPass === "failed") d = d.filter((r) => !r.passed);
    d.sort((a, b) => {
      if (sortBy === "date")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "score") return b.pct - a.pct;
      if (sortBy === "course") return a.course.localeCompare(b.course);
      return 0;
    });
    return d;
  }, [search, course, sortBy, filterPass]);

  const avgScore = Math.round(
    mockResults.reduce((s, r) => s + r.pct, 0) / mockResults.length,
  );
  const passed = mockResults.filter((r) => r.passed).length;
  const best = [...mockResults].sort((a, b) => b.pct - a.pct)[0];
  const trend = mockResults[0].pct - mockResults[1].pct;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto no-scrollbar">
      {/* Header */}
      <div>
        <p className="text-gray-500 text-sm mb-1">Your performance history</p>
        <h1 className="text-4xl font-black text-white tracking-tight">
          Results
        </h1>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Average Score",
            value: `${avgScore}%`,
            sub:
              trend >= 0
                ? `↑ ${trend}% vs prev`
                : `↓ ${Math.abs(trend)}% vs prev`,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
          },
          {
            label: "Passed",
            value: `${passed}/${mockResults.length}`,
            sub: "quizzes",
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20",
          },
          {
            label: "Best Score",
            value: `${best.pct}%`,
            sub: best.title.split(" ").slice(0, 2).join(" "),
            color: "text-blue-400",
            bg: "bg-blue-400/10",
            border: "border-blue-400/20",
          },
          {
            label: "Total Time",
            value: `${Math.round(mockResults.reduce((s, r) => s + r.duration, 0) / 60)}h`,
            sub: "spent in exams",
            color: "text-violet-400",
            bg: "bg-violet-400/10",
            border: "border-violet-400/20",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-2xl border ${s.border} ${s.bg} p-4`}
          >
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            <div className="text-[10px] text-gray-600 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quizzes…"
            className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/40"
          />
        </div>

        {/* Course filter */}
        <div className="flex bg-neutral-900 border border-white/10 rounded-xl p-1 gap-1">
          {COURSES.map((c) => (
            <button
              key={c}
              onClick={() => setCourse(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${course === c ? "bg-neutral-700 text-white" : "text-gray-500 hover:text-white"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Pass filter */}
        <div className="flex bg-neutral-900 border border-white/10 rounded-xl p-1 gap-1">
          {(["all", "passed", "failed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterPass(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${filterPass === f ? "bg-neutral-700 text-white" : "text-gray-500 hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex bg-neutral-900 border border-white/10 rounded-xl p-1 gap-1">
          {(["date", "score", "course"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize ${sortBy === s ? "bg-neutral-700 text-white" : "text-gray-500 hover:text-white"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results list */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-600">
            No results match your filters.
          </div>
        )}
        {filtered.map((r) => (
          <Link
            key={r.id}
            href={`/dashboard/results/${r.id}`}
            className="group bg-neutral-900 border border-white/8 rounded-2xl p-5 flex items-center gap-5 hover:border-white/20 transition-all"
          >
            <ScoreRing pct={r.pct} passed={r.passed} />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-white font-semibold group-hover:text-amber-300 transition-colors truncate">
                  {r.title}
                </h3>
                <span
                  className={`shrink-0 text-[10px] font-bold border rounded-full px-2 py-0.5 ${
                    r.passed
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/10 border-red-500/30 text-red-400"
                  }`}
                >
                  {r.passed ? "PASSED" : "FAILED"}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>{r.course}</span>
                <span>·</span>
                <span>{r.instructor}</span>
                <span>·</span>
                <Clock size={11} className="inline" />
                <span>{r.duration} min</span>
                <span>·</span>
                <span>
                  {new Date(r.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
                </span>
              </div>

              {/* Mini question dots */}
              <div className="flex gap-1 mt-3">
                {r.breakdown.map((b, i) => (
                  <div
                    key={i}
                    title={b.q}
                    className={`w-2 h-2 rounded-full ${b.correct ? "bg-emerald-500" : "bg-red-500"}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0">
              <span className="text-xs">View</span>
              <ChevronRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
