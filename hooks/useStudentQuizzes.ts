import { useState, useEffect } from "react";

export type StudentQuiz = {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  beginWindow: string | null;
  endWindow: string | null;
  totalTimeLimit: number | null;
  totalQuestions: number;
  maxScore: number;
  passScore: number | null;
  status: "upcoming" | "active" | "completed" | "missed";
  batches: { id: string; name: string; color: string }[];
  lastAttempt: {
    id: string;
    status: string;
    totalScore: number | null;
    maxScore: number | null;
    percentageScore: number | null;
    passed: boolean | null;
    submittedAt: string | null;
    attemptNumber: number;
  } | null;
};

export function useStudentQuizzes(filter: string = "all") {
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/student/quizzes?filter=${filter}`)
      .then((r) => r.json())
      .then((json) => {
        setQuizzes(json.quizzes ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load quizzes");
        setLoading(false);
      });
  }, [filter]);

  return { quizzes, loading, error };
}
