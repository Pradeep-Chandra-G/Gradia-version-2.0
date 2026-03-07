"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Student = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: string;
};

type PendingRequest = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  requestedAt: string;
  adminStatus: "awaiting_admin" | "admin_approved";
};

type Batch = {
  id: string;
  name: string;
  subject: string;
  description: string | null;
  color: string;
  joinCode: string;
  createdAt: string;
  quizCount: number;
  avgScore: number;
  students: Student[];
  pendingRequests: PendingRequest[];
};

const COLOR_MAP: Record<string, string> = {
  amber: "bg-amber-100 text-amber-800 border-amber-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-green-100 text-green-800 border-green-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
  red: "bg-red-100 text-red-800 border-red-200",
};

export default function InstructorBatchesClient() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Batch | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    description: "",
    color: "amber",
  });
  const [creating, setCreating] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/instructor/batches")
      .then((r) => r.json())
      .then((d) => {
        if (d.batches) setBatches(d.batches);
      })
      .catch(() => toast.error("Failed to load batches"))
      .finally(() => setLoading(false));
  }, []);

  async function createBatch() {
    if (!form.name.trim() || !form.subject.trim()) {
      toast.error("Name and subject are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/instructor/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create batch");
      setBatches((prev) => [data.batch, ...prev]);
      setShowCreate(false);
      setForm({ name: "", subject: "", description: "", color: "amber" });
      toast.success("Batch created!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleApprove(
    batchId: string,
    batchStudentId: string,
    action: "approve" | "reject",
  ) {
    setApproving(batchStudentId);
    try {
      const res = await fetch(`/api/instructor/batches/${batchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, batchStudentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      // Refresh the selected batch detail
      const detailRes = await fetch(`/api/instructor/batches/${batchId}`);
      const detailData = await detailRes.json();
      if (detailData.batch) {
        setSelected(detailData.batch);
        setBatches((prev) =>
          prev.map((b) =>
            b.id === batchId ? { ...b, ...detailData.batch } : b,
          ),
        );
      }
      toast.success(
        action === "approve" ? "Student approved!" : "Student rejected.",
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setApproving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        Loading batches…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {batches.length} batch{batches.length !== 1 ? "es" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
        >
          + Create Batch
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">New Batch</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Name *
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. CS101 Morning"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Subject *
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Description
            </label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Color
            </label>
            <div className="flex gap-2">
              {Object.keys(COLOR_MAP).map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-6 h-6 rounded-full border-2 ${
                    form.color === c ? "border-gray-800" : "border-transparent"
                  } ${COLOR_MAP[c].split(" ")[0]}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={createBatch}
              disabled={creating}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create"}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Batch grid */}
      {batches.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No batches yet. Create your first batch!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {batches.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelected(b)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      COLOR_MAP[b.color] ?? COLOR_MAP.amber
                    }`}
                  >
                    {b.subject}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-2">{b.name}</h3>
                  {b.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {b.description}
                    </p>
                  )}
                </div>
                {b.pendingRequests.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                    {b.pendingRequests.length}
                  </span>
                )}
              </div>
              <div className="flex gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3 mt-3">
                <span>{b.students.length} students</span>
                <span>{b.quizCount} quizzes</span>
                {b.avgScore > 0 && <span>{b.avgScore}% avg</span>}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Join code:{" "}
                <span className="font-mono font-medium text-gray-600">
                  {b.joinCode}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selected.name}
                </h2>
                <p className="text-sm text-gray-500">{selected.subject}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-2 text-sm text-gray-500">
              Join code:{" "}
              <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                {selected.joinCode}
              </span>
            </div>

            {/* Pending requests */}
            {selected.pendingRequests.length > 0 && (
              <div className="mb-5">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Pending Requests ({selected.pendingRequests.length})
                </h3>
                <div className="space-y-2">
                  {selected.pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-800 text-xs font-bold flex items-center justify-center">
                          {req.studentAvatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {req.studentName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {req.studentEmail}
                          </p>
                        </div>
                      </div>
                      {req.adminStatus === "awaiting_admin" ? (
                        <span className="text-xs text-amber-600 font-medium">
                          Awaiting admin
                        </span>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              handleApprove(selected.id, req.id, "approve")
                            }
                            disabled={approving === req.id}
                            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs disabled:opacity-50"
                          >
                            {approving === req.id ? "…" : "Approve"}
                          </button>
                          <button
                            onClick={() =>
                              handleApprove(selected.id, req.id, "reject")
                            }
                            disabled={approving === req.id}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Students */}
            <h3 className="font-semibold text-gray-700 mb-2">
              Students ({selected.students.length})
            </h3>
            {selected.students.length === 0 ? (
              <p className="text-sm text-gray-400">No active students yet.</p>
            ) : (
              <div className="space-y-2">
                {selected.students.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center">
                      {s.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-400">{s.email}</p>
                    </div>
                    <p className="text-xs text-gray-400">Joined {s.joinedAt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
