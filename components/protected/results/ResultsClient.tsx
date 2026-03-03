"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  BarChart3,
  Search,
} from "lucide-react";

type Result = {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: string | null;
  totalScore: number | null;
  maxScore: number | null;
  percentageScore: number | null;
  passed: boolean | null;
  submittedAt: string | null;
  timeSpent: number | null;
  attemptNumber: number;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

function ScoreBar({ pct, passed }: { pct: number; passed: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${passed ? "bg-emerald-500" : "bg-red-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-sm font-bold w-10 text-right ${passed ? "text-emerald-400" : "text-red-400"}`}
      >
        {pct}%
      </span>
    </div>
  );
}

function formatTime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export default function ResultsClient() {
  const [results, setResults] = useState<Result[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchResults = async (p: number) => {
    setLoading(true);
    try {
      const url = new URL("/api/student/results", window.location.origin);
      url.searchParams.set("page", String(p));
      url.searchParams.set("pageSize", "10");
      const res = await fetch(url.toString());
      const data = await res.json();
      setResults(data.results ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(page);
  }, [page]);

  const filtered = search
    ? results.filter(
        (r) =>
          r.quizTitle.toLowerCase().includes(search.toLowerCase()) ||
          (r.subject ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : results;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Results</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination
              ? `${pagination.total} submission${pagination.total !== 1 ? "s" : ""}`
              : "Your quiz history"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by quiz name..."
          className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 transition"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-amber-400" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-600">
          <BarChart3 size={40} className="mb-3 opacity-30" />
          <p className="font-medium">No results yet</p>
          <p className="text-sm mt-1">
            Complete some quizzes to see your results here
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {filtered.map((r) => {
              const pct = Math.round(r.percentageScore ?? 0);
              const passed = r.passed ?? false;
              const date = r.submittedAt
                ? new Date(r.submittedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—";

              return (
                <Link
                  key={r.id}
                  href={`/dashboard/results/${r.id}`}
                  className="bg-neutral-900 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition group flex items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      {passed ? (
                        <CheckCircle2
                          size={14}
                          className="text-emerald-400 shrink-0"
                        />
                      ) : (
                        <XCircle size={14} className="text-red-400 shrink-0" />
                      )}
                      <h3 className="text-white font-bold text-sm truncate group-hover:text-amber-300 transition">
                        {r.quizTitle}
                      </h3>
                      {r.attemptNumber > 1 && (
                        <span className="text-[10px] text-gray-600 bg-neutral-800 rounded-full px-2 py-0.5 shrink-0">
                          Attempt #{r.attemptNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      {r.subject && <span>{r.subject}</span>}
                      {r.subject && <span>·</span>}
                      <span>{date}</span>
                      {r.timeSpent && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatTime(r.timeSpent)}
                          </span>
                        </>
                      )}
                      {r.totalScore != null && r.maxScore != null && (
                        <>
                          <span>·</span>
                          <span>
                            {r.totalScore} / {r.maxScore} pts
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <ScoreBar pct={pct} passed={passed} />
                    <ChevronRight
                      size={14}
                      className="text-gray-600 group-hover:text-amber-400 transition"
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && !search && (
            <div className="flex items-center justify-center gap-2 mt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-30 bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 transition"
              >
                ← Previous
              </button>
              <span className="text-xs text-gray-500">
                {page} / {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="text-xs font-semibold text-gray-400 hover:text-white disabled:opacity-30 bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 transition"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
