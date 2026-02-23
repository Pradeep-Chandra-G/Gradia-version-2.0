import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser, unauthorized, forbidden, ok } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { searchParams } = new URL(req.url);
  const range = parseInt(searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);

  // Quizzes created by this instructor
  const quizIds = (
    await prisma.quiz.findMany({
      where: { createdBy: user.id },
      select: { id: true },
    })
  ).map((q) => q.id);

  const [attempts, batchCount, studentCount] = await Promise.all([
    prisma.attempt.findMany({
      where: {
        quizId: { in: quizIds },
        status: "SUBMITTED",
        submittedAt: { gte: since },
      },
      include: {
        quiz: { select: { title: true, subject: true } },
        user: { select: { id: true } },
      },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.batchInstructor.count({ where: { instructorId: user.id } }),
    prisma.batchStudent.count({
      where: {
        status: "ACTIVE",
        batch: { instructors: { some: { instructorId: user.id } } },
      },
    }),
  ]);

  // Daily attempt counts
  const dailyMap = new Map<string, { count: number; totalScore: number }>();
  for (const a of attempts) {
    const day = a.submittedAt!.toISOString().split("T")[0];
    const prev = dailyMap.get(day) ?? { count: 0, totalScore: 0 };
    dailyMap.set(day, {
      count: prev.count + 1,
      totalScore: prev.totalScore + (a.percentageScore ?? 0),
    });
  }
  const dailyActivity = Array.from(dailyMap.entries()).map(([date, stats]) => ({
    date,
    attempts: stats.count,
    averageScore: Math.round(stats.totalScore / stats.count),
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

  // Top/bottom performing quizzes
  const quizPerf = new Map<
    string,
    { title: string; total: number; count: number; passed: number }
  >();
  for (const a of attempts) {
    const prev = quizPerf.get(a.quizId) ?? {
      title: a.quiz.title,
      total: 0,
      count: 0,
      passed: 0,
    };
    quizPerf.set(a.quizId, {
      title: prev.title,
      total: prev.total + (a.percentageScore ?? 0),
      count: prev.count + 1,
      passed: prev.passed + (a.passed ? 1 : 0),
    });
  }
  const quizPerformance = Array.from(quizPerf.entries())
    .map(([id, stats]) => ({
      quizId: id,
      title: stats.title,
      averageScore: Math.round(stats.total / stats.count),
      totalAttempts: stats.count,
      passRate: Math.round((stats.passed / stats.count) * 100),
    }))
    .sort((a, b) => b.totalAttempts - a.totalAttempts);

  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((s, a) => s + (a.percentageScore ?? 0), 0) /
            attempts.length,
        )
      : 0;
  const passRate =
    attempts.length > 0
      ? Math.round(
          (attempts.filter((a) => a.passed).length / attempts.length) * 100,
        )
      : 0;

  return ok({
    overview: {
      totalBatches: batchCount,
      totalStudents: studentCount,
      totalAttempts: attempts.length,
      averageScore: avgScore,
      passRate,
    },
    dailyActivity,
    subjectPerformance,
    quizPerformance,
  });
}
