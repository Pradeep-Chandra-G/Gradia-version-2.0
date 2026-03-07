"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type QuizSummary = {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  status: string;
  questionCount: number;
  attempts: number;
  avgScore: number;
  passRate: number;
  createdAt: string;
  batches: Array<{ id: string; name: string }>;
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  published: "bg-green-100 text-green-700",
  finished: "bg-blue-100 text-blue-700",
};

const DIFF_COLORS: Record<string, string> = {
  EASY: "text-green-600",
  MEDIUM: "text-amber-600",
  HARD: "text-red-600",
};

export default function InstructorQuizzesClient() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [publishing, setPublishing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/instructor/quizzes")
      .then((r) => r.json())
      .then((d) => {
        if (d.quizzes) setQuizzes(d.quizzes);
      })
      .catch(() => toast.error("Failed to load quizzes"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = quizzes.filter((q) => {
    const matchSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || q.status === filter;
    return matchSearch && matchFilter;
  });

  async function handlePublish(id: string) {
    setPublishing(id);
    try {
      const res = await fetch(`/api/instructor/quizzes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to publish");
      setQuizzes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "published" } : q)),
      );
      toast.success("Quiz published!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPublishing(null);
    }
  }

  async function handleClose(id: string) {
    try {
      const res = await fetch(`/api/instructor/quizzes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "FINISHED" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to close quiz");
      setQuizzes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: "finished" } : q)),
      );
      toast.success("Quiz closed.");
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this draft quiz? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/instructor/quizzes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete");
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      toast.success("Quiz deleted.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        Loading quizzes…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/quiz-builder")}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
        >
          + Create Quiz
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Search quizzes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="finished">Finished</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          {quizzes.length === 0
            ? "No quizzes yet. Create your first quiz!"
            : "No quizzes match your filters."}
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
                  Difficulty
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Questions
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Attempts
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Avg Score
                </th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{q.title}</div>
                    <div className="text-xs text-gray-400">
                      {q.batches.map((b) => b.name).join(", ") || "No batch"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{q.subject}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-medium ${DIFF_COLORS[q.difficulty] ?? ""}`}
                    >
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[q.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {q.questionCount}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {q.attempts}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {q.attempts > 0 ? `${q.avgScore}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {q.status === "draft" && (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/dashboard/quiz-builder?id=${q.id}`)
                            }
                            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handlePublish(q.id)}
                            disabled={publishing === q.id}
                            className="px-2 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded disabled:opacity-50"
                          >
                            {publishing === q.id ? "…" : "Publish"}
                          </button>
                          <button
                            onClick={() => handleDelete(q.id)}
                            disabled={deleting === q.id}
                            className="px-2 py-1 text-xs text-red-500 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleting === q.id ? "…" : "Delete"}
                          </button>
                        </>
                      )}
                      {q.status === "published" && (
                        <>
                          <button
                            onClick={() =>
                              router.push(`/dashboard/results/${q.id}`)
                            }
                            className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
                          >
                            Results
                          </button>
                          <button
                            onClick={() => handleClose(q.id)}
                            className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50"
                          >
                            Close
                          </button>
                        </>
                      )}
                      {q.status === "finished" && (
                        <button
                          onClick={() =>
                            router.push(`/dashboard/results/${q.id}`)
                          }
                          className="px-2 py-1 text-xs border border-gray-200 rounded hover:bg-gray-50"
                        >
                          Results
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
