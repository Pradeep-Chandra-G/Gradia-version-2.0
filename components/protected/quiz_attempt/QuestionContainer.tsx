"use client";

import { QuestionSeed } from "@/data/quizQuestions";
import { Check, CircleCheck, CopyCheck, Eraser, X } from "lucide-react";

type Props = {
  question: QuestionSeed;
  selectedOption: number | null;
  selectedOptions: number[];
  onSingleChange: (optionId: number | null) => void;
  onMultiChange: (optionIds: number[]) => void;
};

export default function QuestionContainer({
  question,
  selectedOption,
  selectedOptions,
  onSingleChange,
  onMultiChange,
}: Props) {
  const { question_id, questionText, options, questionType, points } = question;

  const handleRadioChange = (id: number) => {
    // Toggle off if clicking the same option
    onSingleChange(selectedOption === id ? null : id);
  };

  const handleCheckboxChange = (id: number) => {
    if (selectedOptions.includes(id)) {
      onMultiChange(selectedOptions.filter((o) => o !== id));
    } else {
      onMultiChange([...selectedOptions, id]);
    }
  };

  const handleClear = () => {
    onSingleChange(null);
    onMultiChange([]);
  };

  const renderOptions = () => {
    const displayOptions =
      questionType === "TRUE_FALSE"
        ? [
            { optionId: 1, optionText: "True" },
            { optionId: 2, optionText: "False" },
          ]
        : options;

    return displayOptions?.map((option) => {
      const isSelected =
        questionType === "MCQ"
          ? selectedOptions.includes(option.optionId)
          : selectedOption === option.optionId;

      return (
        <div
          key={option.optionId}
          onClick={() =>
            questionType === "MCQ"
              ? handleCheckboxChange(option.optionId)
              : handleRadioChange(option.optionId)
          }
          className={`cursor-pointer border p-3 rounded-md flex items-center gap-4 transition-colors
            ${isSelected ? "border-amber-300 bg-amber-300/20" : "border-white/30 hover:border-amber-300 hover:bg-amber-300/10"}`}
        >
          <input
            type={questionType === "MCQ" ? "checkbox" : "radio"}
            className="h-4 w-4 rounded-md accent-amber-300"
            checked={isSelected}
            onChange={() =>
              questionType === "MCQ"
                ? handleCheckboxChange(option.optionId)
                : handleRadioChange(option.optionId)
            }
            onClick={(e) => e.stopPropagation()}
          />
          <span>{option.optionText}</span>
        </div>
      );
    });
  };

  return (
    <div className="bg-neutral-900 p-6 rounded-lg flex flex-col">
      <div className="flex flex-row items-center justify-between mb-4">
        <span className="px-4 py-2 bg-blue-600/10 rounded-lg text-blue-600 font-bold">
          Question {question_id}
        </span>
        <div className="flex flex-row items-center justify-between gap-6">
          <span className="text-sm text-neutral-500">
            {questionType === "SINGLE_OPTION" ? (
              <div className="flex flex-row items-center gap-1">
                <CircleCheck size={16} color="lime" /> <p>Single Choice</p>
              </div>
            ) : questionType === "MCQ" ? (
              <div className="flex flex-row items-center gap-1">
                <CopyCheck size={16} color="orange" /> <p>Multiple Choice</p>
              </div>
            ) : (
              <div className="flex flex-row items-center gap-1">
                <div className="items-center flex flex-row">
                  <Check size={16} color="lime" />
                  <X size={16} color="red" />
                </div>
                True or False
              </div>
            )}
          </span>
          <span className="text-sm text-[#00ff00] flex items-center justify-center">
            +{points} points
          </span>
        </div>
      </div>

      <h2 className="text-xl mb-4">{questionText}</h2>

      <div className="flex flex-col gap-3">{renderOptions()}</div>

      <button
        onClick={handleClear}
        className="mt-4 self-start px-4 py-2 bg-red-600/80 text-white rounded-md hover:bg-red-600 transition hover:cursor-pointer flex items-center gap-2"
      >
        <Eraser size={20} />
        Clear Selection
      </button>
    </div>
  );
}
