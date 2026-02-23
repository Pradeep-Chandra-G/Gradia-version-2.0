"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Save,
  Send,
  Eye,
  Circle,
  CheckSquare,
  ToggleLeft,
  AlertCircle,
  Layers,
  Clock,
  BookOpen,
  Settings,
} from "lucide-react";
import { mockBatches } from "@/data/instructorData";

// ── Types (local) ───────────────────────────────────────────────────────────
type QType = "SINGLE_OPTION" | "MCQ" | "TRUE_FALSE";
type Option = { id: string; text: string; isCorrect: boolean };
type Question = {
  id: string;
  type: QType;
  text: string;
  options: Option[];
  points: number;
  explanation: string;
};
type Section = { id: string; title: string; questions: Question[] };

const UID = () => Math.random().toString(36).slice(2, 9);

function defaultOptions(type: QType): Option[] {
  if (type === "TRUE_FALSE")
    return [
      { id: UID(), text: "True", isCorrect: true },
      { id: UID(), text: "False", isCorrect: false },
    ];
  return [
    { id: UID(), text: "", isCorrect: true },
    { id: UID(), text: "", isCorrect: false },
    { id: UID(), text: "", isCorrect: false },
    { id: UID(), text: "", isCorrect: false },
  ];
}

const QTYPE_META: Record<
  QType,
  { label: string; icon: React.ElementType; desc: string }
> = {
  SINGLE_OPTION: {
    label: "Single Choice",
    icon: Circle,
    desc: "One correct answer",
  },
  MCQ: {
    label: "Multiple Choice",
    icon: CheckSquare,
    desc: "Multiple correct answers",
  },
  TRUE_FALSE: {
    label: "True / False",
    icon: ToggleLeft,
    desc: "True or false",
  },
};

// ── Option Editor ────────────────────────────────────────────────────────────
function OptionEditor({
  option,
  qtype,
  onUpdate,
  onDelete,
  canDelete,
}: {
  option: Option;
  qtype: QType;
  onUpdate: (id: string, patch: Partial<Option>) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}) {
  const isLocked = qtype === "TRUE_FALSE";

  return (
    <div
      className={`flex items-center gap-2.5 group p-2 rounded-xl border transition ${
        option.isCorrect
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-white/5 bg-neutral-800/30"
      }`}
    >
      <button
        onClick={() =>
          !isLocked && onUpdate(option.id, { isCorrect: !option.isCorrect })
        }
        title={
          qtype === "SINGLE_OPTION"
            ? "Mark as correct (only one allowed)"
            : "Toggle correct"
        }
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
          option.isCorrect
            ? "border-emerald-400 bg-emerald-400"
            : "border-gray-600 hover:border-emerald-400"
        } ${isLocked ? "cursor-default" : "cursor-pointer"}`}
      >
        {option.isCorrect && <Check size={10} className="text-black" />}
      </button>

      <input
        value={option.text}
        onChange={(e) =>
          !isLocked && onUpdate(option.id, { text: e.target.value })
        }
        disabled={isLocked}
        placeholder={`Option ${isLocked ? option.text : "text…"}`}
        className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none disabled:cursor-default"
      />

      {!isLocked && canDelete && (
        <button
          onClick={() => onDelete(option.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-600 hover:text-red-400 transition shrink-0"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

// ── Question Editor ──────────────────────────────────────────────────────────
function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
}: {
  question: Question;
  index: number;
  onUpdate: (patch: Partial<Question>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const updateOption = (optId: string, patch: Partial<Option>) => {
    let opts = question.options.map((o) =>
      o.id === optId ? { ...o, ...patch } : o,
    );
    // For SINGLE_OPTION: uncheck all others when one is checked
    if (patch.isCorrect && question.type === "SINGLE_OPTION") {
      opts = opts.map((o) => (o.id === optId ? o : { ...o, isCorrect: false }));
    }
    onUpdate({ options: opts });
  };

  const deleteOption = (optId: string) => {
    if (question.options.length <= 2) return;
    onUpdate({ options: question.options.filter((o) => o.id !== optId) });
  };

  const addOption = () => {
    if (question.options.length >= 6) return;
    onUpdate({
      options: [...question.options, { id: UID(), text: "", isCorrect: false }],
    });
  };

  const changeType = (t: QType) => {
    onUpdate({ type: t, options: defaultOptions(t) });
  };

  const hasError =
    !question.text.trim() ||
    question.options.some(
      (o) => o.text.trim() === "" && question.type !== "TRUE_FALSE",
    ) ||
    !question.options.some((o) => o.isCorrect);

  return (
    <div
      className={`bg-neutral-900 border rounded-2xl overflow-hidden transition-all ${
        hasError ? "border-amber-500/30" : "border-white/8"
      }`}
    >
      {/* Question header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <span className="text-xs text-gray-600 font-mono w-6 shrink-0">
          Q{index + 1}
        </span>
        <span className="flex-1 text-sm text-white truncate">
          {question.text.trim() || (
            <span className="text-gray-600 italic">Untitled question…</span>
          )}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {hasError && <AlertCircle size={13} className="text-amber-400" />}
          <span className="text-xs text-gray-600 bg-neutral-800 px-2 py-0.5 rounded-full">
            {question.points}pt
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition"
          >
            <Trash2 size={13} />
          </button>
          {expanded ? (
            <ChevronUp size={14} className="text-gray-500" />
          ) : (
            <ChevronDown size={14} className="text-gray-500" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4 flex flex-col gap-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {(
              Object.entries(QTYPE_META) as [
                QType,
                (typeof QTYPE_META)[QType],
              ][]
            ).map(([t, m]) => (
              <button
                key={t}
                onClick={() => changeType(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                  question.type === t
                    ? "bg-amber-400/15 border-amber-400/40 text-amber-300"
                    : "border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/15"
                }`}
              >
                <m.icon size={12} /> {m.label}
              </button>
            ))}
          </div>

          {/* Question text */}
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">
              Question *
            </label>
            <textarea
              value={question.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="Enter your question here…"
              rows={2}
              className="w-full bg-neutral-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/40 transition resize-none"
            />
          </div>

          {/* Options */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">
              Options{" "}
              {question.type === "SINGLE_OPTION"
                ? "(pick one correct)"
                : question.type === "MCQ"
                  ? "(select all correct)"
                  : ""}
            </label>
            <div className="flex flex-col gap-2">
              {question.options.map((opt) => (
                <OptionEditor
                  key={opt.id}
                  option={opt}
                  qtype={question.type}
                  onUpdate={updateOption}
                  onDelete={deleteOption}
                  canDelete={question.options.length > 2}
                />
              ))}
              {question.type !== "TRUE_FALSE" &&
                question.options.length < 6 && (
                  <button
                    onClick={addOption}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-amber-400 transition py-1.5"
                  >
                    <Plus size={12} /> Add option
                  </button>
                )}
            </div>
          </div>

          {/* Points + Explanation */}
          <div className="flex gap-3">
            <div className="w-28">
              <label className="text-xs text-gray-500 mb-1.5 block">
                Points
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={question.points}
                onChange={(e) =>
                  onUpdate({ points: parseInt(e.target.value) || 1 })
                }
                className="w-full bg-neutral-800 border border-white/8 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/40 transition"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1.5 block">
                Explanation (shown after)
              </label>
              <input
                value={question.explanation}
                onChange={(e) => onUpdate({ explanation: e.target.value })}
                placeholder="Why is this the correct answer?"
                className="w-full bg-neutral-800 border border-white/8 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/40 transition"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section Editor ───────────────────────────────────────────────────────────
function SectionEditor({
  section,
  index,
  onUpdate,
  onDelete,
  canDelete,
}: {
  section: Section;
  index: number;
  onUpdate: (patch: Partial<Section>) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const addQuestion = () => {
    const q: Question = {
      id: UID(),
      type: "SINGLE_OPTION",
      text: "",
      options: defaultOptions("SINGLE_OPTION"),
      points: 4,
      explanation: "",
    };
    onUpdate({ questions: [...section.questions, q] });
  };

  const updateQuestion = (qId: string, patch: Partial<Question>) => {
    onUpdate({
      questions: section.questions.map((q) =>
        q.id === qId ? { ...q, ...patch } : q,
      ),
    });
  };

  const deleteQuestion = (qId: string) => {
    onUpdate({ questions: section.questions.filter((q) => q.id !== qId) });
  };

  const sectionPoints = section.questions.reduce((a, q) => a + q.points, 0);

  return (
    <div className="border border-white/8 rounded-2xl overflow-hidden">
      <div className="bg-neutral-900/60 px-5 py-3.5 flex items-center gap-3 border-b border-white/5">
        <span className="text-xs text-gray-600 font-mono">S{index + 1}</span>
        <input
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Section title…"
          className="flex-1 bg-transparent text-sm font-semibold text-white placeholder-gray-600 focus:outline-none"
        />
        <span className="text-xs text-gray-600 shrink-0">
          {sectionPoints} pts · {section.questions.length} q
        </span>
        {canDelete && (
          <button
            onClick={onDelete}
            className="p-1 text-gray-600 hover:text-red-400 transition shrink-0"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3">
        {section.questions.map((q, qi) => (
          <QuestionEditor
            key={q.id}
            question={q}
            index={qi}
            onUpdate={(patch) => updateQuestion(q.id, patch)}
            onDelete={() => deleteQuestion(q.id)}
          />
        ))}

        <button
          onClick={addQuestion}
          className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/15 text-sm text-gray-500 hover:border-amber-400/40 hover:text-amber-400 transition"
        >
          <Plus size={14} /> Add Question
        </button>
      </div>
    </div>
  );
}

// ── Main Quiz Builder ────────────────────────────────────────────────────────
export default function InstructorQuizBuilderClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [batchId, setBatchId] = useState("");
  const [duration, setDuration] = useState(30);
  const [deadline, setDeadline] = useState("");
  const [sections, setSections] = useState<Section[]>([
    {
      id: UID(),
      title: "Section 1",
      questions: [
        {
          id: UID(),
          type: "SINGLE_OPTION",
          text: "",
          options: defaultOptions("SINGLE_OPTION"),
          points: 4,
          explanation: "",
        },
      ],
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<"build" | "settings">("build");

  const totalQuestions = sections.reduce((a, s) => a + s.questions.length, 0);
  const totalPoints = sections.reduce(
    (a, s) => a + s.questions.reduce((b, q) => b + q.points, 0),
    0,
  );

  const hasErrors =
    !title.trim() ||
    sections.some((s) =>
      s.questions.some(
        (q) =>
          !q.text.trim() ||
          !q.options.some((o) => o.isCorrect) ||
          q.options.some(
            (o) => o.text.trim() === "" && q.type !== "TRUE_FALSE",
          ),
      ),
    );

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: UID(),
        title: `Section ${prev.length + 1}`,
        questions: [
          {
            id: UID(),
            type: "SINGLE_OPTION",
            text: "",
            options: defaultOptions("SINGLE_OPTION"),
            points: 4,
            explanation: "",
          },
        ],
      },
    ]);
  };

  const updateSection = (sId: string, patch: Partial<Section>) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sId ? { ...s, ...patch } : s)),
    );
  };

  const deleteSection = (sId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sId));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    // In real app: POST to API
    router.push("/dashboard/instructor/quizzes");
  };

  const handlePublish = async () => {
    if (hasErrors) return;
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 900));
    setPublishing(false);
    router.push("/dashboard/instructor/quizzes");
  };

  return (
    <div className="text-white min-h-full flex flex-col">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-white/8 px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-white transition shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title…"
            className="bg-transparent text-base font-bold text-white placeholder-gray-600 focus:outline-none w-full truncate"
          />
          <div className="text-xs text-gray-600 mt-0.5">
            {totalQuestions} questions · {totalPoints} pts
            {batchId &&
              ` · ${mockBatches.find((b) => b.id === batchId)?.name ?? ""}`}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/20 transition disabled:opacity-50"
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                <Save size={13} /> Save Draft
              </>
            )}
          </button>
          <button
            onClick={handlePublish}
            disabled={hasErrors || publishing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-400 disabled:opacity-40 transition"
          >
            {publishing ? (
              "Publishing…"
            ) : (
              <>
                <Send size={13} /> Publish
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-56 shrink-0 border-r border-white/8 p-4 flex flex-col gap-1">
          {[
            { id: "build", label: "Builder", icon: BookOpen },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition ${
                activeTab === t.id
                  ? "bg-amber-400/15 border border-amber-400/30 text-amber-300"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}

          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="text-xs text-gray-600 space-y-1.5">
              <div className="flex justify-between">
                <span>Sections</span>
                <span className="text-white">{sections.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Questions</span>
                <span className="text-white">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Total pts</span>
                <span className="text-amber-400">{totalPoints}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="text-white">{duration}m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "build" && (
            <div className="max-w-3xl mx-auto flex flex-col gap-4">
              {sections.map((s, si) => (
                <SectionEditor
                  key={s.id}
                  section={s}
                  index={si}
                  onUpdate={(patch) => updateSection(s.id, patch)}
                  onDelete={() => deleteSection(s.id)}
                  canDelete={sections.length > 1}
                />
              ))}

              <button
                onClick={addSection}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-white/10 text-sm text-gray-500 hover:border-amber-400/30 hover:text-amber-400 transition"
              >
                <Plus size={15} /> Add Section
              </button>

              {hasErrors && title.trim() && (
                <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  Some questions have issues — every question needs text, at
                  least one correct answer, and all option fields filled.
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-md mx-auto">
              <div className="bg-neutral-900 border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
                <h2 className="text-sm font-bold text-white">Quiz Settings</h2>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">
                    Subject
                  </label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Java"
                    className="w-full bg-neutral-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/40 transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">
                    Assign to Batch
                  </label>
                  <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="w-full bg-neutral-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/40 transition"
                  >
                    <option value="">— No batch —</option>
                    {mockBatches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.subject})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                    <Clock size={11} /> Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={duration}
                    onChange={(e) =>
                      setDuration(parseInt(e.target.value) || 30)
                    }
                    className="w-full bg-neutral-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/40 transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">
                    Deadline (optional)
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-neutral-800 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/40 transition"
                  />
                </div>

                <div className="border-t border-white/5 pt-4">
                  <div className="text-xs text-gray-600 space-y-1.5">
                    <div className="flex justify-between">
                      <span>Total questions</span>
                      <span className="text-white">{totalQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total points</span>
                      <span className="text-amber-400">{totalPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sections</span>
                      <span className="text-white">{sections.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
