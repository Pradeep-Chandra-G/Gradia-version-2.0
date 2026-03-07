import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

// GET /api/instructor/results
export async function GET() {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const quizzes = await prisma.quiz.findMany({
    where: { createdBy: user.id },
    include: {
      attempts: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { completedAt: "desc" },
      },
      sections: { include: { questions: true } },
      batches: { include: { batch: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Flatten to a submissions-style list
  const submissions = quizzes.flatMap((q) =>
    q.attempts
      .filter((a) => a.status === "SUBMITTED")
      .map((a) => {
        const totalQs = q.sections.reduce(
          (acc, s) => acc + s.questions.length,
          0,
        );
        return {
          id: a.id,
          studentId: a.user.id,
          studentName: `${a.user.firstName} ${a.user.lastName}`.trim(),
          studentEmail: a.user.email,
          studentAvatar:
            `${a.user.firstName[0] ?? ""}${a.user.lastName[0] ?? ""}`.toUpperCase(),
          quizId: q.id,
          quizTitle: q.title,
          quizSubject: q.subject,
          batchName: q.batches[0]?.batch.name ?? "—",
          score: a.totalScore ?? 0,
          maxScore: a.maxScore ?? totalQs * (q.correctPoints ?? 1),
          percentage: a.percentageScore ?? 0,
          passed: a.passed ?? false,
          completedAt:
            a.completedAt?.toISOString() ?? a.startedAt?.toISOString() ?? "",
          timeSpent: a.timeSpent ?? 0,
        };
      }),
  );

  // Per-quiz summary
  const quizSummaries = quizzes.map((q) => {
    const submitted = q.attempts.filter((a) => a.status === "SUBMITTED");
    const scores = submitted
      .map((a) => a.percentageScore)
      .filter((s): s is number => s != null);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, c) => a + c, 0) / scores.length)
        : 0;
    const passCount = submitted.filter((a) => a.passed).length;
    return {
      quizId: q.id,
      quizTitle: q.title,
      quizSubject: q.subject,
      status: q.status.toLowerCase(),
      totalAttempts: submitted.length,
      avgScore,
      passRate:
        submitted.length > 0
          ? Math.round((passCount / submitted.length) * 100)
          : 0,
      batches: q.batches.map((qb) => qb.batch.name),
    };
  });

  return NextResponse.json({ submissions, quizSummaries });
}
