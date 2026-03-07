"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type OptionDraft = {
  id: string; // temporary client-side id
  optionText: string;
  isCorrect: boolean;
  order: number;
};

type QuestionDraft = {
  id: string;
  questionText: string;
  questionType: "MCQ" | "MULTI_SELECT" | "TRUE_FALSE";
  order: number;
  points: number;
  explanation: string;
  options: OptionDraft[];
};

type SectionDraft = {
  id: string;
  title: string;
  order: number;
  sectionalTimeLimit: number | null;
  questions: QuestionDraft[];
};

type QuizSettings = {
  title: string;
  description: string;
  subject: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  accessType: "BATCH_ONLY" | "OPEN";
  totalTimeLimit: number | null;
  beginWindow: string;
  endWindow: string;
  showResultsImmediately: boolean;
  passScore: number;
  correctPoints: number;
  wrongPoints: number;
  batchIds: string[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyOption(order: number): OptionDraft {
  return { id: uid(), optionText: "", isCorrect: false, order };
}

function emptyQuestion(order: number): QuestionDraft {
  return {
    id: uid(),
    questionText: "",
    questionType: "MCQ",
    order,
    points: 1,
    explanation: "",
    options: [emptyOption(1), emptyOption(2), emptyOption(3), emptyOption(4)],
  };
}

function emptySection(order: number): SectionDraft {
  return {
    id: uid(),
    title: `Section ${order}`,
    order,
    sectionalTimeLimit: null,
    questions: [emptyQuestion(1)],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InstructorQuizBuilderClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);

  const [settings, setSettings] = useState<QuizSettings>({
    title: "",
    description: "",
    subject: "",
    difficulty: "MEDIUM",
    accessType: "BATCH_ONLY",
    totalTimeLimit: null,
    beginWindow: "",
    endWindow: "",
    showResultsImmediately: true,
    passScore: 50,
    correctPoints: 1,
    wrongPoints: 0,
    batchIds: [],
  });

  const [sections, setSections] = useState<SectionDraft[]>([emptySection(1)]);

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(forPublish = false): string | null {
    if (!settings.title.trim()) return "Quiz title is required.";
    if (!settings.subject.trim()) return "Subject is required.";
    if (sections.length === 0) return "At least one section is required.";
    for (const section of sections) {
      if (section.questions.length === 0)
        return `Section "${section.title}" has no questions.`;
      for (const q of section.questions) {
        if (!q.questionText.trim())
          return `A question in "${section.title}" has no text.`;
        if (q.options.length < 2)
          return `Question "${q.questionText}" needs at least 2 options.`;
        if (!q.options.some((o) => o.isCorrect))
          return `Question "${q.questionText}" has no correct answer marked.`;
        if (q.options.some((o) => !o.optionText.trim()))
          return `All options in "${q.questionText}" must have text.`;
      }
    }
    if (forPublish) {
      if (
        settings.accessType === "BATCH_ONLY" &&
        settings.batchIds.length === 0
      )
        return "Please assign this quiz to at least one batch before publishing.";
    }
    return null;
  }

  // ── API call ─────────────────────────────────────────────────────────────────

  async function submit(publish: boolean) {
    const error = validate(publish);
    if (error) {
      toast.error(error);
      return;
    }

    publish ? setPublishing(true) : setSaving(true);
    try {
      const payload = {
        ...settings,
        totalTimeLimit: settings.totalTimeLimit || null,
        beginWindow: settings.beginWindow || null,
        endWindow: settings.endWindow || null,
        sections: sections.map((s) => ({
          title: s.title,
          order: s.order,
          sectionalTimeLimit: s.sectionalTimeLimit,
          questions: s.questions.map((q) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            order: q.order,
            points: q.points,
            explanation: q.explanation,
            options: q.options.map((o) => ({
              optionText: o.optionText,
              isCorrect: o.isCorrect,
              order: o.order,
            })),
          })),
        })),
        publish,
      };

      const res = await fetch("/api/instructor/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save quiz");

      toast.success(publish ? "Quiz published!" : "Draft saved!");
      router.push("/dashboard/quizzes");
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }

  // ── Section helpers ───────────────────────────────────────────────────────────

  function addSection() {
    setSections((prev) => {
      const next = [...prev, emptySection(prev.length + 1)];
      setActiveSection(next.length - 1);
      setActiveQuestion(0);
      return next;
    });
  }

  function updateSection(idx: number, patch: Partial<SectionDraft>) {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    );
  }

  function removeSection(idx: number) {
    if (sections.length === 1) {
      toast.error("A quiz needs at least one section.");
      return;
    }
    setSections((prev) =>
      prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i + 1 })),
    );
    setActiveSection((prev) => Math.min(prev, sections.length - 2));
    setActiveQuestion(0);
  }

  // ── Question helpers ──────────────────────────────────────────────────────────

  function addQuestion(sIdx: number) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              questions: [
                ...s.questions,
                emptyQuestion(s.questions.length + 1),
              ],
            }
          : s,
      ),
    );
    setActiveQuestion(sections[sIdx].questions.length);
  }

  function updateQuestion(
    sIdx: number,
    qIdx: number,
    patch: Partial<QuestionDraft>,
  ) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              questions: s.questions.map((q, j) =>
                j === qIdx ? { ...q, ...patch } : q,
              ),
            }
          : s,
      ),
    );
  }

  function removeQuestion(sIdx: number, qIdx: number) {
    if (sections[sIdx].questions.length === 1) {
      toast.error("A section needs at least one question.");
      return;
    }
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              questions: s.questions
                .filter((_, j) => j !== qIdx)
                .map((q, j) => ({ ...q, order: j + 1 })),
            }
          : s,
      ),
    );
    setActiveQuestion((prev) =>
      Math.min(prev, sections[sIdx].questions.length - 2),
    );
  }

  // ── Option helpers ─────────────────────────────────────────────────────────────

  function updateOption(
    sIdx: number,
    qIdx: number,
    oIdx: number,
    patch: Partial<OptionDraft>,
  ) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              questions: s.questions.map((q, j) =>
                j === qIdx
                  ? {
                      ...q,
                      options: q.options.map((o, k) => {
                        if (k !== oIdx) {
                          // For MCQ, deselect others when marking correct
                          if (patch.isCorrect && q.questionType === "MCQ") {
                            return { ...o, isCorrect: false };
                          }
                          return o;
                        }
                        return { ...o, ...patch };
                      }),
                    }
                  : q,
              ),
            }
          : s,
      ),
    );
  }

  function addOption(sIdx: number, qIdx: number) {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              questions: s.questions.map((q, j) =>
                j === qIdx
                  ? {
                      ...q,
                      options: [
                        ...q.options,
                        emptyOption(q.options.length + 1),
                      ],
                    }
                  : q,
              ),
            }
          : s,
      ),
    );
  }

  function removeOption(sIdx: number, qIdx: number, oIdx: number) {
    const q = sections[sIdx].questions[qIdx];
    if (q.options.length <= 2) {
      toast.error("Need at least 2 options.");
      return;
    }
    setSections((prev) =>
      prev.map((s, i) =>
        i === sIdx
          ? {
              ...s,
              questions: s.questions.map((q, j) =>
                j === qIdx
                  ? {
                      ...q,
                      options: q.options
                        .filter((_, k) => k !== oIdx)
                        .map((o, k) => ({ ...o, order: k + 1 })),
                    }
                  : q,
              ),
            }
          : s,
      ),
    );
  }

  // ── Current section & question ─────────────────────────────────────────────────

  const curSection = sections[activeSection];
  const curQuestion = curSection?.questions[activeQuestion];

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/quizzes")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back
          </button>
          <input
            className="text-lg font-semibold text-gray-900 bg-transparent border-b-2 border-transparent focus:border-amber-400 focus:outline-none px-1 min-w-[200px]"
            placeholder="Untitled Quiz"
            value={settings.title}
            onChange={(e) =>
              setSettings((s) => ({ ...s, title: e.target.value }))
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            ⚙ Settings
          </button>
          <button
            onClick={() => submit(false)}
            disabled={saving || publishing}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            onClick={() => submit(true)}
            disabled={saving || publishing}
            className="px-4 py-1.5 text-sm rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-50"
          >
            {publishing ? "Publishing…" : "Publish Quiz"}
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-57px)]">
        {/* ── Left sidebar: sections + questions ────────────────── */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
          {sections.map((section, sIdx) => (
            <div key={section.id} className="border-b border-gray-100">
              {/* Section header */}
              <div
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer ${
                  activeSection === sIdx ? "bg-amber-50" : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setActiveSection(sIdx);
                  setActiveQuestion(0);
                }}
              >
                <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                  {section.title}
                </span>
                {sections.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(sIdx);
                    }}
                    className="text-gray-400 hover:text-red-500 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* Questions in section */}
              {activeSection === sIdx &&
                section.questions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className={`flex items-center gap-2 pl-6 pr-3 py-1.5 cursor-pointer ${
                      activeQuestion === qIdx
                        ? "bg-amber-100"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveQuestion(qIdx)}
                  >
                    <span className="text-xs text-gray-500 w-4">
                      {qIdx + 1}.
                    </span>
                    <span className="flex-1 text-xs text-gray-700 truncate">
                      {q.questionText || "Untitled question"}
                    </span>
                    {section.questions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeQuestion(sIdx, qIdx);
                        }}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              {/* Add question */}
              {activeSection === sIdx && (
                <button
                  onClick={() => addQuestion(sIdx)}
                  className="w-full text-left pl-6 pr-3 py-1.5 text-xs text-amber-600 hover:bg-amber-50"
                >
                  + Add question
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addSection}
            className="w-full text-left px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 border-b border-gray-100"
          >
            + Add section
          </button>
        </div>

        {/* ── Main: question editor ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Section title / settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Section title
              </label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={curSection?.title ?? ""}
                onChange={(e) =>
                  updateSection(activeSection, { title: e.target.value })
                }
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Section time limit (min)
              </label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                value={curSection?.sectionalTimeLimit ?? ""}
                placeholder="No limit"
                onChange={(e) =>
                  updateSection(activeSection, {
                    sectionalTimeLimit: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              />
            </div>
          </div>

          {/* Question editor */}
          {curQuestion && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              {/* Question type & points */}
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Question type
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={curQuestion.questionType}
                    onChange={(e) =>
                      updateQuestion(activeSection, activeQuestion, {
                        questionType: e.target
                          .value as QuestionDraft["questionType"],
                      })
                    }
                  >
                    <option value="MCQ">Multiple Choice (single answer)</option>
                    <option value="MULTI_SELECT">
                      Multiple Select (multi answer)
                    </option>
                    <option value="TRUE_FALSE">True / False</option>
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    value={curQuestion.points}
                    onChange={(e) =>
                      updateQuestion(activeSection, activeQuestion, {
                        points: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Question text */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Question text
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  placeholder="Enter your question here…"
                  value={curQuestion.questionText}
                  onChange={(e) =>
                    updateQuestion(activeSection, activeQuestion, {
                      questionText: e.target.value,
                    })
                  }
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Answer options
                  {curQuestion.questionType === "MCQ" && (
                    <span className="ml-2 text-gray-400">
                      (select one correct)
                    </span>
                  )}
                  {curQuestion.questionType === "MULTI_SELECT" && (
                    <span className="ml-2 text-gray-400">
                      (select all correct)
                    </span>
                  )}
                </label>
                <div className="space-y-2">
                  {curQuestion.options.map((opt, oIdx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      {/* Correct toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          updateOption(activeSection, activeQuestion, oIdx, {
                            isCorrect: !opt.isCorrect,
                          })
                        }
                        className={`w-5 h-5 flex-shrink-0 rounded-full border-2 transition-colors ${
                          opt.isCorrect
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                        title="Mark as correct"
                      />
                      <input
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt.optionText}
                        onChange={(e) =>
                          updateOption(activeSection, activeQuestion, oIdx, {
                            optionText: e.target.value,
                          })
                        }
                      />
                      <button
                        onClick={() =>
                          removeOption(activeSection, activeQuestion, oIdx)
                        }
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addOption(activeSection, activeQuestion)}
                  className="mt-2 text-xs text-amber-600 hover:underline"
                >
                  + Add option
                </button>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Explanation (shown after attempt)
                </label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  placeholder="Optional explanation for the correct answer…"
                  value={curQuestion.explanation}
                  onChange={(e) =>
                    updateQuestion(activeSection, activeQuestion, {
                      explanation: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel: settings drawer ─────────────────────── */}
        {showSettings && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex-shrink-0 p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Quiz Settings</h3>

            <Field label="Subject *">
              <input
                className="input"
                value={settings.subject}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, subject: e.target.value }))
                }
                placeholder="e.g. Mathematics"
              />
            </Field>

            <Field label="Description">
              <textarea
                className="input resize-none"
                rows={2}
                value={settings.description}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, description: e.target.value }))
                }
              />
            </Field>

            <Field label="Difficulty">
              <select
                className="input"
                value={settings.difficulty}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    difficulty: e.target.value as QuizSettings["difficulty"],
                  }))
                }
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </Field>

            <Field label="Access type">
              <select
                className="input"
                value={settings.accessType}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    accessType: e.target.value as QuizSettings["accessType"],
                  }))
                }
              >
                <option value="BATCH_ONLY">Batch Only</option>
                <option value="OPEN">Open (anyone in org)</option>
              </select>
            </Field>

            <Field label="Total time limit (min)">
              <input
                type="number"
                min={0}
                className="input"
                placeholder="No limit"
                value={settings.totalTimeLimit ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    totalTimeLimit: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
              />
            </Field>

            <Field label="Open window (start)">
              <input
                type="datetime-local"
                className="input"
                value={settings.beginWindow}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, beginWindow: e.target.value }))
                }
              />
            </Field>

            <Field label="Close window (end)">
              <input
                type="datetime-local"
                className="input"
                value={settings.endWindow}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, endWindow: e.target.value }))
                }
              />
            </Field>

            <Field label="Pass score (%)">
              <input
                type="number"
                min={0}
                max={100}
                className="input"
                value={settings.passScore}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    passScore: Number(e.target.value),
                  }))
                }
              />
            </Field>

            <Field label="Points per correct answer">
              <input
                type="number"
                min={0}
                className="input"
                value={settings.correctPoints}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    correctPoints: Number(e.target.value),
                  }))
                }
              />
            </Field>

            <Field label="Deduction per wrong answer">
              <input
                type="number"
                min={0}
                className="input"
                value={settings.wrongPoints}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    wrongPoints: Number(e.target.value),
                  }))
                }
              />
            </Field>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showResultsImmediately}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    showResultsImmediately: e.target.checked,
                  }))
                }
                className="rounded text-amber-500"
              />
              Show results immediately after submission
            </label>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">
                Assign to batches (IDs, comma-separated)
              </p>
              <input
                className="input text-xs"
                placeholder="batch-id-1, batch-id-2"
                value={settings.batchIds.join(", ")}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    batchIds: e.target.value
                      .split(",")
                      .map((v) => v.trim())
                      .filter(Boolean),
                  }))
                }
              />
              <p className="text-xs text-gray-400 mt-1">
                Tip: find batch IDs on the Batches page.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Global input style via style tag */}
      <style>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          ring: 2px solid #fbbf24;
          border-color: #fbbf24;
        }
      `}</style>
    </div>
  );
}

// ── Helper component ────────────────────────────────────────────────────────────
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
