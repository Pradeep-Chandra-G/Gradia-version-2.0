"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Submission = {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  quizId: string;
  quizTitle: string;
  quizSubject: string;
  batchName: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number;
};

type QuizSummary = {
  quizId: string;
  quizTitle: string;
  quizSubject: string;
  status: string;
  totalAttempts: number;
  avgScore: number;
  passRate: number;
  batches: string[];
};

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function InstructorResultsClient() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [quizSummaries, setQuizSummaries] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"submissions" | "summary">("summary");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/instructor/results")
      .then((r) => r.json())
      .then((d) => {
        if (d.submissions) setSubmissions(d.submissions);
        if (d.quizSummaries) setQuizSummaries(d.quizSummaries);
      })
      .catch(() => toast.error("Failed to load results"))
      .finally(() => setLoading(false));
  }, []);

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.quizTitle.toLowerCase().includes(search.toLowerCase()) ||
      s.quizSubject.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSummaries = quizSummaries.filter(
    (q) =>
      q.quizTitle.toLowerCase().includes(search.toLowerCase()) ||
      q.quizSubject.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-400">Loading results…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Results</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {submissions.length} total submission{submissions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* View toggle + search */}
      <div className="flex gap-3">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              view === "summary"
                ? "bg-amber-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setView("summary")}
          >
            By Quiz
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              view === "submissions"
                ? "bg-amber-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setView("submissions")}
          >
            All Submissions
          </button>
        </div>
        <input
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* By Quiz */}
      {view === "summary" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredSummaries.length === 0 ? (
            <div className="py-20 text-center text-gray-400">No results yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Quiz</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Batches</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Attempts</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Avg Score</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummaries.map((q) => (
                  <tr key={q.quizId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{q.quizTitle}</td>
                    <td className="px-4 py-3 text-gray-600">{q.quizSubject}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{q.batches.join(", ") || "—"}</td>
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
                    <td className="px-4 py-3 text-right text-gray-600">{q.totalAttempts}</td>
                    <td className="px-4 py-3 text-right">
                      {q.totalAttempts > 0 ? (
                        <span
                          className={`font-medium ${
                            q.avgScore >= 70 ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {q.avgScore}%
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {q.totalAttempts > 0 ? (
                        <span
                          className={`font-medium ${
                            q.passRate >= 60 ? "text-green-600" : "text-red-500"
                          }`}
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
          )}
        </div>
      )}

      {/* All Submissions */}
      {view === "submissions" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="py-20 text-center text-gray-400">No submissions yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Quiz</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Batch</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Score</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">%</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Passed</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Time</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center">
                          {s.studentAvatar}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{s.studentName}</p>
                          <p className="text-xs text-gray-400">{s.studentEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.quizTitle}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.batchName}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {s.score}/{s.maxScore}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-medium ${
                          s.percentage >= 70 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {s.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          s.passed
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {s.passed ? "Pass" : "Fail"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      {fmt(s.timeSpent)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs">
                      {new Date(s.completedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}