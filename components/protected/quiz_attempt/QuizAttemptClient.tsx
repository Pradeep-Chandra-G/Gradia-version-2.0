"use client";

import { QuizSeed, QuestionSeed } from "@/data/quizQuestions";
import { useState, useMemo } from "react";
import SectionContainer from "./SectionContainer";
import QuestionContainer from "./QuestionContainer";
import RightPanel from "./RightPanel";

type Props = {
  quizData: QuizSeed;
};

type AnswerState = {
  [questionId: number]: {
    selectedOption?: number; // for SINGLE_OPTION / TRUE_FALSE
    selectedOptions?: number[]; // for MCQ
    markedForReview: boolean;
  };
};

export default function QuizAttemptClient({ quizData }: Props) {
  const [curSectionId, setCurSectionId] = useState(
    quizData.sections[0]?.section_id,
  );
  const [curQuestionId, setCurQuestionId] = useState<number | null>(null);

  const [answers, setAnswers] = useState<AnswerState>({});

  const curSection = useMemo(
    () => quizData.sections.find((s) => s.section_id === curSectionId),
    [quizData.sections, curSectionId],
  );

  const curQuestion = useMemo(
    () =>
      curSection?.questions.find((q) => q.question_id === curQuestionId) ??
      curSection?.questions[0],
    [curSection, curQuestionId],
  );

  if (!curSection || !curQuestion) return null;

  const curAnswer = answers[curQuestion.question_id] || {
    selectedOption: null,
    selectedOptions: [],
    markedForReview: false,
  };

  const saveAnswer = (newAnswer: typeof curAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [curQuestion.question_id]: newAnswer,
    }));
  };

  const handlePrevious = () => {
    const idx = curSection.questions.findIndex(
      (q) => q.question_id === curQuestion.question_id,
    );
    if (idx > 0) {
      setCurQuestionId(curSection.questions[idx - 1].question_id);
    }
  };

  const handleNext = () => {
    const idx = curSection.questions.findIndex(
      (q) => q.question_id === curQuestion.question_id,
    );
    if (idx < curSection.questions.length - 1) {
      setCurQuestionId(curSection.questions[idx + 1].question_id);
    }
  };

  const toggleMarkForReview = () => {
    saveAnswer({
      ...curAnswer,
      markedForReview: !curAnswer.markedForReview,
    });
  };

  return (
    <div className="flex flex-1 min-h-0 w-full">
      {/* LEFT PANEL */}
      <div className="flex flex-col w-3/4 min-h-0 border-r border-white/30 p-2 relative">
        <SectionContainer
          sections={quizData.sections}
          curSectionId={curSectionId}
          setCurSectionId={setCurSectionId}
        />

        {/* Scrollable question area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 pb-28">
          <QuestionContainer
            question={{
              ...curQuestion,
              // Pass saved selections to QuestionContainer
              options: curQuestion.options?.map((opt) => ({
                ...opt,
                isSelected:
                  curQuestion.questionType === "MCQ"
                    ? curAnswer.selectedOptions?.includes(opt.optionId)
                    : curAnswer.selectedOption === opt.optionId,
              })),
            }}
          />
        </div>

        {/* Sticky action bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-md p-4 flex justify-between gap-4 border-t border-white/30">
          <button
            onClick={handlePrevious}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md"
          >
            Previous
          </button>

          <button
            onClick={toggleMarkForReview}
            className={`px-4 py-2 rounded-md ${
              curAnswer.markedForReview
                ? "bg-amber-500 text-black"
                : "bg-neutral-800 text-white hover:bg-amber-500 hover:text-black"
            }`}
          >
            {curAnswer.markedForReview
              ? "Marked for Review"
              : "Mark for Review"}
          </button>

          <button
            onClick={() => saveAnswer(curAnswer)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md"
          >
            Save
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md"
          >
            Next
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/4 min-h-0">
        <RightPanel
          questions={curSection.questions}
          curQuestionId={curQuestion.question_id}
          setCurQuestionId={setCurQuestionId}
          answers={answers} // Pass answer state to show marked/review highlights
        />
      </div>
    </div>
  );
}
