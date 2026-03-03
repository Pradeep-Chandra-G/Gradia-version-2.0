import { useState, useEffect } from "react";

export type StudentAnalyticsData = {
  overview: {
    totalAttempts: number;
    passedAttempts: number;
    passRate: number;
    averageScore: number;
    averageTimeSpent: number;
    activeDays: number;
  };
  scoreTrend: {
    date: string;
    quizTitle: string;
    subject: string;
    percentageScore: number;
    passed: boolean;
  }[];
  subjectPerformance: {
    subject: string;
    averageScore: number;
    totalAttempts: number;
    passRate: number;
  }[];
};

export function useStudentAnalytics(days = 30) {
  const [data, setData] = useState<StudentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/student/analytics?days=${days}`)
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load analytics");
        setLoading(false);
      });
  }, [days]);

  return { data, loading, error };
}
