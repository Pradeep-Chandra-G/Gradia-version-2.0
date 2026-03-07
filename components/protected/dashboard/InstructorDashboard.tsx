"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Stats = {
  totalStudents: number;
  totalBatches: number;
  totalQuizzes: number;
  publishedQuizzes: number;
  upcomingQuizzes: number;
  totalAttempts: number;
  avgScore: number;
  passRate: number;
  pendingRequests: number;
};

type RecentQuiz = {
  id: string;
  title: string;
  subject: string;
  status: string;
  attempts: number;
  avgScore: number;
  createdAt: string;
  beginWindow: string | null;
  endWindow: string | null;
};

function StatCard({
  label,
  value,
  sub,
  color = "amber",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  const colors: Record<string, string> = {
    amber: "text-amber-600",
    green: "text-green-600",
    blue: "text-blue-600",
    red: "text-red-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color] ?? colors.amber}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function InstructorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/instructor/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.stats) setStats(d.stats);
        if (d.recentQuizzes) setRecentQuizzes(d.recentQuizzes);
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        Loading dashboard…
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        Dashboard unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your teaching overview</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/quiz-builder")}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
        >
          + Create Quiz
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={stats.totalStudents}
          color="blue"
        />
        <StatCard
          label="Total Batches"
          value={stats.totalBatches}
          color="amber"
        />
        <StatCard
          label="Quizzes"
          value={stats.totalQuizzes}
          sub={`${stats.publishedQuizzes} published`}
          color="green"
        />
        <StatCard
          label="Avg Score"
          value={`${stats.avgScore}%`}
          color="amber"
        />
        <StatCard
          label="Pass Rate"
          value={`${stats.passRate}%`}
          color="green"
        />
        <StatCard
          label="Total Attempts"
          value={stats.totalAttempts}
          color="blue"
        />
        <StatCard
          label="Upcoming Quizzes"
          value={stats.upcomingQuizzes}
          color="amber"
        />
        {stats.pendingRequests > 0 && (
          <StatCard
            label="Pending Requests"
            value={stats.pendingRequests}
            color="red"
            sub="students awaiting approval"
          />
        )}
      </div>

      {/* Recent quizzes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Quizzes
          </h2>
          <button
            onClick={() => router.push("/dashboard/quizzes")}
            className="text-sm text-amber-600 hover:underline"
          >
            View all →
          </button>
        </div>

        {recentQuizzes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
            No quizzes yet.{" "}
            <button
              onClick={() => router.push("/dashboard/quiz-builder")}
              className="text-amber-600 hover:underline"
            >
              Create your first quiz
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    Title
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
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentQuizzes.map((q) => (
                  <tr
                    key={q.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/quizzes`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {q.title}
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
                    <td className="px-4 py-3 text-right text-gray-400 text-xs">
                      {q.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
