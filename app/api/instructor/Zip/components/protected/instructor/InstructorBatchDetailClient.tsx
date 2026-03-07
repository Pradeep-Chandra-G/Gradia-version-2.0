"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Trash2,
  UserPlus,
  Mail,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  BarChart3,
  BookOpen,
  X,
  Loader2,
  Check,
  Ban,
} from "lucide-react";
import {
  mockBatches,
  type Batch,
  type Student,
  type PendingRequest,
} from "@/data/instructorData";

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// ── Invite Modal ────────────────────────────────────────────────────────────
function InviteModal({
  batchName,
  onClose,
  onInvite,
}: {
  batchName: string;
  onClose: () => void;
  onInvite: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handle = async () => {
    if (!email.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    onInvite(email.trim());
    setSent(true);
    setSending(false);
    setTimeout(onClose, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-neutral-900 border border-white/10 rounded-2xl p-7 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-white transition"
        >
          <X size={17} />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-400/15 border border-blue-400/25 flex items-center justify-center">
            <UserPlus size={16} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Invite Student</h2>
            <p className="text-xs text-gray-500">to {batchName}</p>
          </div>
        </div>

        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 mb-4 flex items-start gap-2">
          <Shield size={13} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300">
            Invites require{" "}
            <span className="font-semibold">admin approval</span> before the
            student can join. You&apos;ll be notified once approved.
          </p>
        </div>

        <label className="text-xs text-gray-400 mb-1.5 block">
          Student Email
        </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle()}
          placeholder="student@university.edu"
          type="email"
          className="w-full bg-neutral-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition mb-4"
          autoFocus
        />

        <button
          onClick={handle}
          disabled={!email.trim() || sending || sent}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
            sent
              ? "bg-emerald-500 text-white"
              : "bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-40"
          }`}
        >
          {sent ? (
            <>
              <Check size={14} /> Request Sent!
            </>
          ) : sending ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Sending…
            </>
          ) : (
            <>
              <Mail size={14} /> Send Invite
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Confirm Remove Modal ────────────────────────────────────────────────────
function ConfirmRemoveModal({
  student,
  onClose,
  onConfirm,
}: {
  student: Student;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [removing, setRemoving] = useState(false);
  const handle = async () => {
    setRemoving(true);
    await new Promise((r) => setTimeout(r, 500));
    onConfirm();
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
            <Trash2 size={15} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Remove Student</h2>
            <p className="text-xs text-gray-500">{student.name}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          This will remove them from the batch. Their submitted quiz results
          will remain. This action can be undone by re-inviting.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={removing}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-400 disabled:opacity-50 transition"
          >
            {removing ? "Removing…" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Student Row ─────────────────────────────────────────────────────────────
function StudentRow({
  student,
  onRemove,
}: {
  student: Student;
  onRemove: () => void;
}) {
  const studentAvg = avg(student.scores);
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 group hover:bg-neutral-800/30 rounded-xl px-3 transition -mx-3">
      <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-gray-300">
          {student.avatar}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {student.name}
        </p>
        <p className="text-xs text-gray-500 truncate">{student.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {student.status === "suspended" && (
          <span className="text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
            Suspended
          </span>
        )}
        <div
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            studentAvg >= 75
              ? "bg-emerald-500/15 text-emerald-400"
              : studentAvg >= 50
                ? "bg-amber-500/15 text-amber-400"
                : "bg-red-500/15 text-red-400"
          }`}
        >
          {studentAvg}%
        </div>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Pending Request Row ─────────────────────────────────────────────────────
function PendingRow({
  req,
  onAddStudent,
  onDecline,
}: {
  req: PendingRequest;
  onAddStudent: (reqId: string) => void;
  onDecline: (reqId: string) => void;
}) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    await new Promise((r) => setTimeout(r, 500));
    onAddStudent(req.id);
  };

  return (
    <div
      className={`flex items-center gap-3 py-3 border-b border-white/5 last:border-0 rounded-xl px-3 -mx-3 transition ${
        req.adminStatus === "admin_rejected" ? "opacity-50" : ""
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-gray-300">
          {req.studentAvatar}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {req.studentName}
        </p>
        <p className="text-xs text-gray-500 truncate">{req.studentEmail}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {req.adminStatus === "awaiting_admin" && (
          <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
            <Shield size={9} /> Admin Pending
          </span>
        )}
        {req.adminStatus === "admin_rejected" && (
          <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
            <XCircle size={9} /> Admin Rejected
          </span>
        )}
        {req.adminStatus === "admin_approved" && (
          <>
            <button
              onClick={() => onDecline(req.id)}
              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition"
            >
              <X size={13} />
            </button>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-50 transition"
            >
              {adding ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Check size={11} />
              )}
              Add
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Score mini sparkline ────────────────────────────────────────────────────
function ScoreTrend({ scores }: { scores: number[] }) {
  if (!scores.length) return null;
  const max = Math.max(...scores, 1);
  const W = 60;
  const H = 24;
  const pts = scores
    .map((v, i) => `${(i / (scores.length - 1)) * W},${H - (v / max) * H}`)
    .join(" ");
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function InstructorBatchDetailClient({
  batchId,
}: {
  batchId: string;
}) {
  const initial = mockBatches.find((b) => b.id === batchId) ?? mockBatches[0];
  const [batch, setBatch] = useState<Batch>(initial);
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Student | null>(null);
  const [showPending, setShowPending] = useState(true);

  const filtered = batch.students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const pendingVisible = batch.pendingRequests.filter(
    (r) => r.adminStatus !== "admin_rejected" || showPending,
  );
  const approvedCount = batch.pendingRequests.filter(
    (r) => r.adminStatus === "admin_approved",
  ).length;

  const removeStudent = (id: string) => {
    setBatch((b) => ({
      ...b,
      students: b.students.filter((s) => s.id !== id),
    }));
  };

  const addStudent = (reqId: string) => {
    const req = batch.pendingRequests.find((r) => r.id === reqId);
    if (!req) return;
    const newStudent: Student = {
      id: `s-${reqId}`,
      name: req.studentName,
      avatar: req.studentAvatar,
      email: req.studentEmail,
      joinedAt: new Date().toISOString().split("T")[0],
      status: "active",
      scores: [],
    };
    setBatch((b) => ({
      ...b,
      students: [...b.students, newStudent],
      pendingRequests: b.pendingRequests.filter((r) => r.id !== reqId),
    }));
  };

  const declineRequest = (reqId: string) => {
    setBatch((b) => ({
      ...b,
      pendingRequests: b.pendingRequests.filter((r) => r.id !== reqId),
    }));
  };

  const handleInvite = (email: string) => {
    const newReq: PendingRequest = {
      id: `pr-${Date.now()}`,
      studentName: email.split("@")[0],
      studentEmail: email,
      studentAvatar: email.slice(0, 2).toUpperCase(),
      requestedAt: new Date().toISOString().split("T")[0],
      adminStatus: "awaiting_admin",
    };
    setBatch((b) => ({
      ...b,
      pendingRequests: [newReq, ...b.pendingRequests],
    }));
  };

  const batchAvg = avg(batch.students.flatMap((s) => s.scores));
  const topStudent = [...batch.students].sort(
    (a, b) => avg(b.scores) - avg(a.scores),
  )[0];

  return (
    <div className="p-6 md:p-8 text-white min-h-full">
      {/* Back */}
      <Link
        href="/dashboard/instructor/batches"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition mb-6"
      >
        <ArrowLeft size={14} /> Back to Batches
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{batch.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {batch.subject} · Created {batch.createdAt}
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 text-black text-sm font-bold rounded-xl hover:bg-amber-300 transition active:scale-[0.97]"
        >
          <UserPlus size={14} /> Invite Student
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { l: "Students", v: batch.students.length, c: "text-white" },
          {
            l: "Avg Score",
            v: `${batchAvg}%`,
            c:
              batchAvg >= 75
                ? "text-emerald-400"
                : batchAvg >= 50
                  ? "text-amber-400"
                  : "text-red-400",
          },
          {
            l: "Top Student",
            v: topStudent?.name ?? "—",
            c: "text-amber-400",
            small: true,
          },
          {
            l: "Pending",
            v: approvedCount,
            c: approvedCount > 0 ? "text-emerald-400" : "text-gray-500",
          },
        ].map((s) => (
          <div
            key={s.l}
            className="bg-neutral-900 border border-white/8 rounded-2xl p-4"
          >
            <div
              className={`${s.small ? "text-sm font-bold" : "text-xl font-black"} ${s.c}`}
            >
              {s.v}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Students list */}
        <div className="lg:col-span-2 bg-neutral-900 border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users size={14} className="text-gray-500" /> Students (
              {batch.students.length})
            </h2>
            <div className="relative">
              <Search
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="bg-neutral-800 border border-white/8 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition w-36"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <Users size={28} className="text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {batch.students.length === 0 ? "No students yet" : "No matches"}
              </p>
            </div>
          ) : (
            <div>
              {filtered.map((s) => (
                <StudentRow
                  key={s.id}
                  student={s}
                  onRemove={() => setRemoveTarget(s)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right col: pending + score overview */}
        <div className="flex flex-col gap-4">
          {/* Pending requests */}
          <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus size={14} className="text-gray-500" /> Requests (
                {batch.pendingRequests.length})
              </h2>
              <button
                onClick={() => setShowPending((p) => !p)}
                className="text-gray-500 hover:text-white transition"
              >
                {showPending ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )}
              </button>
            </div>

            {approvedCount > 0 && (
              <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-2.5 mb-3 text-xs text-emerald-300">
                <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                {approvedCount} student{approvedCount > 1 ? "s" : ""} approved —
                click Add to confirm
              </div>
            )}

            {batch.pendingRequests.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-4">
                No pending requests
              </p>
            ) : (
              <div>
                {batch.pendingRequests
                  .filter(
                    (r) => showPending || r.adminStatus !== "admin_rejected",
                  )
                  .map((req) => (
                    <PendingRow
                      key={req.id}
                      req={req}
                      onAddStudent={addStudent}
                      onDecline={declineRequest}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Score breakdown */}
          <div className="bg-neutral-900 border border-white/8 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-gray-500" /> Score Overview
            </h2>
            <div className="flex flex-col gap-3">
              {[...batch.students]
                .sort((a, b) => avg(b.scores) - avg(a.scores))
                .slice(0, 6)
                .map((s) => {
                  const sa = avg(s.scores);
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
                        <span className="text-[8px] font-bold text-gray-400">
                          {s.avatar}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300 truncate mb-1">
                          {s.name.split(" ")[0]}
                        </p>
                        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              sa >= 75
                                ? "bg-emerald-500"
                                : sa >= 50
                                  ? "bg-amber-400"
                                  : "bg-red-500"
                            }`}
                            style={{ width: `${sa}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold shrink-0 ${
                          sa >= 75
                            ? "text-emerald-400"
                            : sa >= 50
                              ? "text-amber-400"
                              : "text-red-400"
                        }`}
                      >
                        {sa}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {showInvite && (
        <InviteModal
          batchName={batch.name}
          onClose={() => setShowInvite(false)}
          onInvite={handleInvite}
        />
      )}
      {removeTarget && (
        <ConfirmRemoveModal
          student={removeTarget}
          onClose={() => setRemoveTarget(null)}
          onConfirm={() => removeStudent(removeTarget.id)}
        />
      )}
    </div>
  );
}
