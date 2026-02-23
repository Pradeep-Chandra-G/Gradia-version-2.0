import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser, unauthorized, forbidden, ok } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT") return forbidden();

  const { searchParams } = new URL(req.url);
  const range = parseInt(searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);

  const attempts = await prisma.attempt.findMany({
    where: {
      userId: user.id,
      status: "SUBMITTED",
      submittedAt: { gte: since },
    },
    orderBy: { submittedAt: "asc" },
    include: {
      quiz: { select: { title: true, subject: true } },
    },
  });

  // Score trend over time
  const scoreTrend = attempts.map((a) => ({
    date: a.submittedAt,
    quizTitle: a.quiz.title,
    subject: a.quiz.subject,
    percentageScore: a.percentageScore ?? 0,
    passed: a.passed,
  }));

  // Per-subject performance
  const subjectMap = new Map<
    string,
    { total: number; count: number; passed: number }
  >();
  for (const a of attempts) {
    const sub = a.quiz.subject;
    const prev = subjectMap.get(sub) ?? { total: 0, count: 0, passed: 0 };
    subjectMap.set(sub, {
      total: prev.total + (a.percentageScore ?? 0),
      count: prev.count + 1,
      passed: prev.passed + (a.passed ? 1 : 0),
    });
  }
  const subjectPerformance = Array.from(subjectMap.entries()).map(
    ([subject, stats]) => ({
      subject,
      averageScore: Math.round(stats.total / stats.count),
      totalAttempts: stats.count,
      passRate: Math.round((stats.passed / stats.count) * 100),
    }),
  );

  // Streak & consistency
  const uniqueDays = new Set(
    attempts
      .filter((a) => a.submittedAt)
      .map((a) => a.submittedAt!.toISOString().split("T")[0]),
  );

  // Overall stats
  const allAttempts = await prisma.attempt.count({
    where: { userId: user.id, status: "SUBMITTED" },
  });
  const passedAttempts = await prisma.attempt.count({
    where: { userId: user.id, status: "SUBMITTED", passed: true },
  });
  const avgResult = await prisma.attempt.aggregate({
    where: { userId: user.id, status: "SUBMITTED" },
    _avg: { percentageScore: true, timeSpent: true },
  });

  return ok({
    overview: {
      totalAttempts: allAttempts,
      passedAttempts,
      passRate:
        allAttempts > 0 ? Math.round((passedAttempts / allAttempts) * 100) : 0,
      averageScore: Math.round(avgResult._avg.percentageScore ?? 0),
      averageTimeSpent: Math.round(avgResult._avg.timeSpent ?? 0),
      activeDays: uniqueDays.size,
    },
    scoreTrend,
    subjectPerformance,
  });
}
