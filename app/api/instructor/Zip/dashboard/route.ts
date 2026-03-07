import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

// GET /api/instructor/dashboard
export async function GET() {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();

  const [batches, quizzes] = await Promise.all([
    prisma.batch.findMany({
      where: { instructors: { some: { instructorId: user.id } } },
      include: {
        students: { where: { status: "ACTIVE" } },
      },
    }),
    prisma.quiz.findMany({
      where: { createdBy: user.id },
      include: {
        attempts: {
          where: { status: "SUBMITTED" },
          select: {
            percentageScore: true,
            passed: true,
            completedAt: true,
            userId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalStudents = new Set(
    batches.flatMap((b) => b.students.map((s) => s.studentId)),
  ).size;

  const publishedQuizzes = quizzes.filter((q) => q.status === "PUBLISHED");
  const upcomingQuizzes = quizzes.filter(
    (q) => q.status === "PUBLISHED" && q.beginWindow && q.beginWindow > now,
  );

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

  // Recent quizzes for the dashboard table (last 5)
  const recentQuizzes = quizzes.slice(0, 5).map((q) => {
    const qScores = q.attempts
      .map((a) => a.percentageScore)
      .filter((s): s is number => s != null);
    const qAvg =
      qScores.length > 0
        ? Math.round(qScores.reduce((a, c) => a + c, 0) / qScores.length)
        : 0;
    return {
      id: q.id,
      title: q.title,
      subject: q.subject,
      status: q.status.toLowerCase(),
      attempts: q.attempts.length,
      avgScore: qAvg,
      createdAt: q.createdAt.toISOString().split("T")[0],
      beginWindow: q.beginWindow?.toISOString() ?? null,
      endWindow: q.endWindow?.toISOString() ?? null,
    };
  });

  // Pending student requests across all batches
  const pendingCount = await prisma.batchStudent.count({
    where: {
      batch: { instructors: { some: { instructorId: user.id } } },
      status: { in: ["PENDING_ADMIN", "PENDING_INSTRUCTOR"] },
    },
  });

  return NextResponse.json({
    stats: {
      totalStudents,
      totalBatches: batches.length,
      totalQuizzes: quizzes.length,
      publishedQuizzes: publishedQuizzes.length,
      upcomingQuizzes: upcomingQuizzes.length,
      totalAttempts: allAttempts.length,
      avgScore,
      passRate,
      pendingRequests: pendingCount,
    },
    recentQuizzes,
  });
}
