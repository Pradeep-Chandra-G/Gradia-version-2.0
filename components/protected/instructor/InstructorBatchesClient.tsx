"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  X,
  Shield,
  BookOpen,
} from "lucide-react";
import {
  mockBatches,
  type Batch,
  type PendingRequest,
} from "@/data/instructorData";

function avg(arr: number[]) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

const COLOR_MAP: Record<
  string,
  { bg: string; border: string; text: string; bar: string }
> = {
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/25",
    text: "text-amber-400",
    bar: "bg-amber-400",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    text: "text-blue-400",
    bar: "bg-blue-400",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/25",
    text: "text-violet-400",
    bar: "bg-violet-400",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    text: "text-emerald-400",
    bar: "bg-emerald-400",
  },
};

function RequestStatus({ status }: { status: PendingRequest["adminStatus"] }) {
  if (status === "awaiting_admin")
    return (
      <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full whitespace-nowrap">
        <Clock size={9} /> Awaiting Admin
      </span>
    );
  if (status === "admin_approved")
    return (
      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full whitespace-nowrap">
        <CheckCircle2 size={9} /> Approved
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full whitespace-nowrap">
      <XCircle size={9} /> Rejected
    </span>
  );
}

function CreateBatchModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (
    data: Omit<
      Batch,
      "id" | "students" | "pendingRequests" | "quizCount" | "avgScore"
    >,
  ) => void;
}) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState("amber");
  const [saving, setSaving] = useState(false);
  const colors = ["amber", "blue", "violet", "emerald"];

  const handle = async () => {
    if (!name.trim() || !subject.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    onCreate({
      name: name.trim(),
      subject: subject.trim(),
      description: desc.trim(),
      color,
      createdAt: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-neutral-900 border border-white/10 rounded-2xl p-7 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-white transition"
        >
          <X size={17} />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
            <Layers size={17} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">New Batch</h2>
            <p className="text-xs text-gray-500">Set up a new student cohort</p>
          </div>
        </div>
        <div className="flex flex-col gap-3.5">
          {[
            {
              label: "Batch Name *",
              val: name,
              set: setName,
              ph: "e.g. CSE-2026-A",
            },
            {
              label: "Subject *",
              val: subject,
              set: setSubject,
              ph: "e.g. Java & Spring Boot",
            },
          ].map((f) => (
            <div key={f.label}>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">
                {f.label}
              </label>
              <input
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.ph}
                className="w-full bg-neutral-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-400 font-medium mb-1.5 block">
              Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Brief description…"
              rows={2}
              className="w-full bg-neutral-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 transition resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium mb-2 block">
              Color
            </label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg transition-all border-2 ${
                    c === "amber"
                      ? "bg-amber-400"
                      : c === "blue"
                        ? "bg-blue-400"
                        : c === "violet"
                          ? "bg-violet-400"
                          : "bg-emerald-400"
                  } ${color === c ? "border-white scale-110" : "border-transparent"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handle}
            disabled={!name.trim() || !subject.trim() || saving}
            className="flex-1 py-2.5 rounded-xl bg-amber-400 text-black text-sm font-bold hover:bg-amber-300 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            {saving ? (
              "Creating…"
            ) : (
              <>
                <Plus size={13} /> Create
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function BatchCard({ batch }: { batch: Batch }) {
  const c = COLOR_MAP[batch.color] ?? COLOR_MAP.amber;
  const approved = batch.pendingRequests.filter(
    (r) => r.adminStatus === "admin_approved",
  ).length;
  const awaiting = batch.pendingRequests.filter(
    (r) => r.adminStatus === "awaiting_admin",
  ).length;
  const batchAvg = avg(batch.students.flatMap((s) => s.scores));

  return (
    <Link href={`/dashboard/instructor/batches/${batch.id}`}>
      <div className="group relative bg-neutral-900 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all duration-200 cursor-pointer overflow-hidden h-full flex flex-col">
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar}`} />

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center shrink-0`}
            >
              <Layers size={15} className={c.text} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm leading-tight">
                {batch.name}
              </h3>
              <p className="text-xs text-gray-500">{batch.subject}</p>
            </div>
          </div>
          <ChevronRight
            size={15}
            className="text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all mt-1 shrink-0"
          />
        </div>

        <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-1">
          {batch.description}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { val: batch.students.length, label: "Students", icon: Users },
            { val: batch.quizCount, label: "Quizzes", icon: BookOpen },
            {
              val: `${batchAvg}%`,
              label: "Avg",
              icon: null,
              color:
                batchAvg >= 75
                  ? "text-emerald-400"
                  : batchAvg >= 50
                    ? "text-amber-400"
                    : "text-red-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-neutral-800/40 rounded-xl p-2 text-center"
            >
              <div className={`text-sm font-bold ${s.color ?? "text-white"}`}>
                {s.val}
              </div>
              <div className="text-[9px] text-gray-600 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          {approved > 0 && (
            <div className="flex items-center gap-1.5 bg-emerald-500/8 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300">
              <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
              {approved} admin-approved — ready to add
            </div>
          )}
          {awaiting > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/8 border border-amber-500/20 rounded-lg px-2.5 py-1.5 text-xs text-amber-300">
              <Shield size={11} className="text-amber-400 shrink-0" />
              {awaiting} waiting for admin approval
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          <div className="flex -space-x-1.5">
            {batch.students.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="w-5 h-5 rounded-full bg-neutral-700 border border-neutral-900 flex items-center justify-center"
              >
                <span className="text-[7px] font-bold text-gray-300">
                  {s.avatar}
                </span>
              </div>
            ))}
          </div>
          <span className="text-[10px] text-gray-600 ml-auto">
            {batch.createdAt}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function InstructorBatchesClient() {
  const [batches, setBatches] = useState<Batch[]>(mockBatches);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  console.log("This is instructor Batches client");

  const filtered = useMemo(
    () =>
      batches.filter(
        (b) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.subject.toLowerCase().includes(search.toLowerCase()),
      ),
    [batches, search],
  );

  const totalStudents = batches.reduce((a, b) => a + b.students.length, 0);
  const totalApproved = batches.reduce(
    (a, b) =>
      a +
      b.pendingRequests.filter((r) => r.adminStatus === "admin_approved")
        .length,
    0,
  );
  const totalAwaiting = batches.reduce(
    (a, b) =>
      a +
      b.pendingRequests.filter((r) => r.adminStatus === "awaiting_admin")
        .length,
    0,
  );

  return (
    <div className="p-6 md:p-8 text-white min-h-full">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Batches</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage cohorts and enrollment requests
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 text-black text-sm font-bold rounded-xl hover:bg-amber-300 transition active:scale-[0.97]"
        >
          <Plus size={14} /> New Batch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          {
            l: "Batches",
            v: batches.length,
            icon: Layers,
            c: "text-amber-400",
            bg: "bg-amber-500/10",
            b: "border-amber-500/15",
          },
          {
            l: "Students",
            v: totalStudents,
            icon: Users,
            c: "text-blue-400",
            bg: "bg-blue-500/10",
            b: "border-blue-500/15",
          },
          {
            l: "Ready to Add",
            v: totalApproved,
            icon: CheckCircle2,
            c: "text-emerald-400",
            bg: "bg-emerald-500/10",
            b: "border-emerald-500/15",
          },
          {
            l: "Awaiting Admin",
            v: totalAwaiting,
            icon: Shield,
            c: "text-amber-400",
            bg: "bg-amber-500/10",
            b: "border-amber-500/15",
          },
        ].map((s) => (
          <div
            key={s.l}
            className={`${s.bg} border ${s.b} rounded-2xl p-4 flex items-center gap-3`}
          >
            <s.icon size={16} className={s.c} />
            <div>
              <div className={`text-xl font-black ${s.c}`}>{s.v}</div>
              <div className="text-[10px] text-gray-500">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {totalAwaiting > 0 && (
        <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 mb-5">
          <Shield size={15} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300">
            <span className="font-semibold">
              {totalAwaiting} enrollment request{totalAwaiting > 1 ? "s" : ""}{" "}
              need admin approval.
            </span>{" "}
            You&apos;ll be notified when they&apos;re approved — then you can
            confirm adding the student to the batch.
          </p>
        </div>
      )}

      <div className="relative mb-5">
        <Search
          size={13}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search batches…"
          className="w-full md:w-64 bg-neutral-900 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Layers size={36} className="text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm">No batches found</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-3 text-amber-400 text-sm hover:underline flex items-center gap-1"
          >
            <Plus size={12} /> Create your first batch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <BatchCard key={b.id} batch={b} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateBatchModal
          onClose={() => setShowCreate(false)}
          onCreate={(d) => {
            setBatches((p) => [
              {
                ...d,
                id: `b${Date.now()}`,
                students: [],
                pendingRequests: [],
                quizCount: 0,
                avgScore: 0,
              },
              ...p,
            ]);
          }}
        />
      )}
    </div>
  );
}
