import { useState, useEffect } from "react";

export type StudentAttempt = {
  id: string;
  quizId: string;
  quiz: {
    id: string;
    title: string;
    subject: string;
    difficulty: string;
    passScore: number | null;
    totalTimeLimit: number | null;
  };
  attemptNumber: number;
  totalScore: number | null;
  maxScore: number | null;
  percentageScore: number | null;
  passed: boolean | null;
  timeSpent: number | null;
  submittedAt: string | null;
};

export type StudentAttemptDetail = {
  id: string;
  quizId: string;
  attemptNumber: number;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  timeSpent: number | null;
  totalScore: number | null;
  maxScore: number | null;
  percentageScore: number | null;
  passed: boolean | null;
  showAnswers: boolean;
  quiz: {
    id: string;
    title: string;
    subject: string;
    difficulty: string;
    passScore: number | null;
    correctPoints: number;
    wrongPoints: number;
    sections: {
      id: string;
      title: string;
      order: number;
      questions: {
        id: string;
        questionType: string;
        questionText: string;
        order: number;
        points: number;
        explanation: string | null;
        options: {
          id: string;
          optionText: string;
          isCorrect: boolean;
          order: number;
        }[];
        answer: {
          optionId: string | null;
          selectedOptions: string[] | null;
          textAnswer: string | null;
          isCorrect: boolean | null;
          pointsEarned: number | null;
        } | null;
      }[];
    }[];
  };
};

export function useStudentResults(page = 1, limit = 10) {
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [pagination, setPagination] = useState({
    page,
    limit,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/student/results?page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((json) => {
        setAttempts(json.attempts ?? []);
        setPagination(
          json.pagination ?? { page, limit, total: 0, totalPages: 1 },
        );
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load results");
        setLoading(false);
      });
  }, [page, limit]);

  return { attempts, pagination, loading, error };
}

export function useStudentResultDetail(id: string) {
  const [result, setResult] = useState<StudentAttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/student/results/${id}`)
      .then((r) => r.json())
      .then((json) => {
        setResult(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load result detail");
        setLoading(false);
      });
  }, [id]);

  return { result, loading, error };
}
