import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

// GET /api/instructor/analytics
export async function GET() {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Get all batches where this instructor teaches
  const batches = await prisma.batch.findMany({
    where: {
      instructors: { some: { instructorId: user.id } },
    },
    include: {
      students: { where: { status: "ACTIVE" } },
      quizzes: {
        include: {
          quiz: {
            include: {
              attempts: {
                where: { status: "SUBMITTED" },
                select: {
                  percentageScore: true,
                  passed: true,
                  timeSpent: true,
                  completedAt: true,
                  userId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Get all quizzes created by this instructor
  const quizzes = await prisma.quiz.findMany({
    where: { createdBy: user.id },
    include: {
      sections: { include: { questions: true } },
      attempts: {
        where: { status: "SUBMITTED" },
        select: {
          percentageScore: true,
          passed: true,
          timeSpent: true,
          completedAt: true,
          userId: true,
        },
      },
      batches: { include: { batch: { select: { id: true, name: true } } } },
    },
  });

  const allAttempts = quizzes.flatMap((q) => q.attempts);
  const scores = allAttempts
    .map((a) => a.percentageScore)
    .filter((s): s is number => s != null);
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, c) => a + c, 0) / scores.length)
      : 0;
  const passCount = allAttempts.filter((a) => a.passed).length;
  const passRate =
    allAttempts.length > 0
      ? Math.round((passCount / allAttempts.length) * 100)
      : 0;

  // Total unique students across all batches
  const allStudentIds = new Set(
    batches.flatMap((b) => b.students.map((s) => s.studentId)),
  );
  const totalStudents = allStudentIds.size;

  // Active students (those with at least one attempt in the last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentAttempts = allAttempts.filter(
    (a) => a.completedAt && a.completedAt > thirtyDaysAgo,
  );
  const activeStudentIds = new Set(recentAttempts.map((a) => a.userId));
  const activeStudents = activeStudentIds.size;

  // Per-batch analytics
  const batchAnalytics = batches.map((b) => {
    const batchAttempts = b.quizzes.flatMap((qb) => qb.quiz.attempts);
    const batchScores = batchAttempts
      .map((a) => a.percentageScore)
      .filter((s): s is number => s != null);
    const batchAvgScore =
      batchScores.length > 0
        ? Math.round(
            batchScores.reduce((a, c) => a + c, 0) / batchScores.length,
          )
        : 0;
    const batchPassCount = batchAttempts.filter((a) => a.passed).length;
    return {
      batchId: b.id,
      batchName: b.name,
      subject: b.subject,
      color: b.color,
      studentCount: b.students.length,
      quizCount: b.quizzes.length,
      avgScore: batchAvgScore,
      passRate:
        batchAttempts.length > 0
          ? Math.round((batchPassCount / batchAttempts.length) * 100)
          : 0,
      totalAttempts: batchAttempts.length,
    };
  });

  // Per-quiz analytics
  const quizAnalytics = quizzes.map((q) => {
    const qScores = q.attempts
      .map((a) => a.percentageScore)
      .filter((s): s is number => s != null);
    const qAvg =
      qScores.length > 0
        ? Math.round(qScores.reduce((a, c) => a + c, 0) / qScores.length)
        : 0;
    const qPass = q.attempts.filter((a) => a.passed).length;
    return {
      quizId: q.id,
      quizTitle: q.title,
      subject: q.subject,
      status: q.status.toLowerCase(),
      attempts: q.attempts.length,
      avgScore: qAvg,
      passRate:
        q.attempts.length > 0
          ? Math.round((qPass / q.attempts.length) * 100)
          : 0,
      batches: q.batches.map((qb) => qb.batch.name),
    };
  });

  // Monthly trend — last 6 months
  const monthlyTrend: Array<{
    month: string;
    attempts: number;
    avgScore: number;
  }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const monthAttempts = allAttempts.filter(
      (a) =>
        a.completedAt &&
        a.completedAt >= monthStart &&
        a.completedAt <= monthEnd,
    );
    const mScores = monthAttempts
      .map((a) => a.percentageScore)
      .filter((s): s is number => s != null);
    monthlyTrend.push({
      month: monthStart.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      }),
      attempts: monthAttempts.length,
      avgScore:
        mScores.length > 0
          ? Math.round(mScores.reduce((a, c) => a + c, 0) / mScores.length)
          : 0,
    });
  }

  return NextResponse.json({
    overview: {
      totalStudents,
      activeStudents,
      totalBatches: batches.length,
      totalQuizzes: quizzes.length,
      publishedQuizzes: quizzes.filter((q) => q.status === "PUBLISHED").length,
      totalAttempts: allAttempts.length,
      avgScore,
      passRate,
    },
    batchAnalytics,
    quizAnalytics,
    monthlyTrend,
  });
}
