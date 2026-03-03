import { useState, useEffect } from "react";

export type StudentDashboardData = {
  student: { id: string; name: string; email: string };
  stats: {
    totalBatches: number;
    totalAssigned: number;
    completed: number;
    upcoming: number;
    averageScore: number;
    latestScore: number | null;
  };
  batches: { id: string; name: string; subject: string; color: string }[];
  upcomingQuizzes: {
    id: string;
    title: string;
    subject: string;
    difficulty: string;
    beginWindow: string | null;
    endWindow: string | null;
    totalQuestions: number;
    totalTimeLimit: number | null;
  }[];
  recentAttempts: {
    id: string;
    quizId: string;
    totalScore: number | null;
    maxScore: number | null;
    percentageScore: number | null;
    passed: boolean | null;
    submittedAt: string | null;
    timeSpent: number | null;
  }[];
};

export function useStudentDashboard() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/student/dashboard")
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load dashboard data");
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
