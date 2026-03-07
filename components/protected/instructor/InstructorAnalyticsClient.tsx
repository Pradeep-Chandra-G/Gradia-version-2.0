"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Overview = {
  totalStudents: number;
  activeStudents: number;
  totalBatches: number;
  totalQuizzes: number;
  publishedQuizzes: number;
  totalAttempts: number;
  avgScore: number;
  passRate: number;
};

type BatchAnalytic = {
  batchId: string;
  batchName: string;
  subject: string;
  color: string;
  studentCount: number;
  quizCount: number;
  avgScore: number;
  passRate: number;
  totalAttempts: number;
};

type QuizAnalytic = {
  quizId: string;
  quizTitle: string;
  subject: string;
  status: string;
  attempts: number;
  avgScore: number;
  passRate: number;
  batches: string[];
};

type MonthlyPoint = {
  month: string;
  attempts: number;
  avgScore: number;
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function InstructorAnalyticsClient() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [batchAnalytics, setBatchAnalytics] = useState<BatchAnalytic[]>([]);
  const [quizAnalytics, setQuizAnalytics] = useState<QuizAnalytic[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/instructor/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.overview) setOverview(d.overview);
        if (d.batchAnalytics) setBatchAnalytics(d.batchAnalytics);
        if (d.quizAnalytics) setQuizAnalytics(d.quizAnalytics);
        if (d.monthlyTrend) setMonthlyTrend(d.monthlyTrend);
      })
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        Loading analytics…
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        No analytics available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Overview of your teaching activity
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={overview.totalStudents} />
        <StatCard
          label="Active Students"
          value={overview.activeStudents}
          sub="last 30 days"
        />
        <StatCard label="Total Batches" value={overview.totalBatches} />
        <StatCard
          label="Total Quizzes"
          value={overview.totalQuizzes}
          sub={`${overview.publishedQuizzes} published`}
        />
        <StatCard label="Total Attempts" value={overview.totalAttempts} />
        <StatCard label="Avg Score" value={`${overview.avgScore}%`} />
        <StatCard label="Pass Rate" value={`${overview.passRate}%`} />
      </div>

      {/* Monthly trend table */}
      {monthlyTrend.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Monthly Trend
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Month
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Attempts
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Avg Score
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-600">Trend</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTrend.map((m) => (
                  <tr key={m.month} className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-700">
                      {m.month}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {m.attempts}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-medium ${
                          m.avgScore >= 70
                            ? "text-green-600"
                            : m.avgScore >= 50
                              ? "text-amber-600"
                              : "text-red-500"
                        }`}
                      >
                        {m.attempts > 0 ? `${m.avgScore}%` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {m.attempts > 0 && (
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-amber-400 h-2 rounded-full"
                            style={{ width: `${m.avgScore}%` }}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batch analytics */}
      {batchAnalytics.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">By Batch</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Batch
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Subject
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Students
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Quizzes
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Attempts
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Avg Score
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Pass Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {batchAnalytics.map((b) => (
                  <tr
                    key={b.batchId}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {b.batchName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.subject}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {b.studentCount}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {b.quizCount}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {b.totalAttempts}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.totalAttempts > 0 ? (
                        <span
                          className={
                            b.avgScore >= 70
                              ? "text-green-600 font-medium"
                              : "text-red-500 font-medium"
                          }
                        >
                          {b.avgScore}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {b.totalAttempts > 0 ? (
                        <span
                          className={
                            b.passRate >= 60
                              ? "text-green-600 font-medium"
                              : "text-red-500 font-medium"
                          }
                        >
                          {b.passRate}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quiz analytics */}
      {quizAnalytics.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">By Quiz</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Quiz
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Subject
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Attempts
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Avg Score
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">
                    Pass Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {quizAnalytics.map((q) => (
                  <tr
                    key={q.quizId}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {q.quizTitle}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{q.subject}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          q.status === "published"
                            ? "bg-green-100 text-green-700"
                            : q.status === "finished"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {q.attempts}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {q.attempts > 0 ? (
                        <span
                          className={
                            q.avgScore >= 70
                              ? "text-green-600 font-medium"
                              : "text-red-500 font-medium"
                          }
                        >
                          {q.avgScore}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {q.attempts > 0 ? (
                        <span
                          className={
                            q.passRate >= 60
                              ? "text-green-600 font-medium"
                              : "text-red-500 font-medium"
                          }
                        >
                          {q.passRate}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
