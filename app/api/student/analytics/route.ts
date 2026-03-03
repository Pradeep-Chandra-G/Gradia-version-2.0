import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser, unauthorized, forbidden, ok } from "@/lib/api-utils";

// GET /api/student/analytics
export async function GET(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT" && user.role !== "ADMIN") return forbidden();

  const attempts = await prisma.attempt.findMany({
    where: { userId: user.id, status: "SUBMITTED" },
    orderBy: { submittedAt: "asc" },
    select: {
      id: true,
      totalScore: true,
      maxScore: true,
      percentageScore: true,
      passed: true,
      submittedAt: true,
      timeSpent: true,
      quiz: {
        select: {
          title: true,
          subject: true,
        },
      },
    },
  });

  const total = attempts.length;
  const averageScore =
    total > 0
      ? attempts.reduce((s, a) => s + (a.percentageScore ?? 0), 0) / total
      : 0;
  const highestScore =
    total > 0 ? Math.max(...attempts.map((a) => a.percentageScore ?? 0)) : 0;
  const passRate =
    total > 0 ? (attempts.filter((a) => a.passed).length / total) * 100 : 0;
  const totalTimeSpent = attempts.reduce((s, a) => s + (a.timeSpent ?? 0), 0);

  const scoreHistory = attempts.map((a) => ({
    date: a.submittedAt?.toISOString() ?? new Date().toISOString(),
    score: Math.round(a.percentageScore ?? 0),
    passed: a.passed ?? false,
    quizTitle: a.quiz.title,
  }));

  // Subject performance
  const subjectMap = new Map<string, { scores: number[]; passed: number }>();
  for (const a of attempts) {
    const subj = a.quiz.subject ?? "General";
    if (!subjectMap.has(subj)) subjectMap.set(subj, { scores: [], passed: 0 });
    const entry = subjectMap.get(subj)!;
    entry.scores.push(a.percentageScore ?? 0);
    if (a.passed) entry.passed++;
  }

  const subjectPerformance = Array.from(subjectMap.entries())
    .map(([subject, data]) => ({
      subject,
      attempts: data.scores.length,
      average: data.scores.reduce((s, v) => s + v, 0) / data.scores.length,
      passRate: (data.passed / data.scores.length) * 100,
    }))
    .sort((a, b) => b.attempts - a.attempts);

  // Recent trend: compare last 5 vs previous 5
  let recentTrend = 0;
  if (scoreHistory.length >= 4) {
    const recent = scoreHistory.slice(-5);
    const previous = scoreHistory.slice(-10, -5);
    if (previous.length > 0) {
      const recentAvg = recent.reduce((s, h) => s + h.score, 0) / recent.length;
      const prevAvg =
        previous.reduce((s, h) => s + h.score, 0) / previous.length;
      recentTrend = Math.round(recentAvg - prevAvg);
    }
  }

  return NextResponse.json({
    summary: {
      totalAttempts: total,
      averageScore,
      highestScore,
      passRate,
      totalTimeSpent,
    },
    scoreHistory,
    subjectPerformance,
    recentTrend,
  });
}
