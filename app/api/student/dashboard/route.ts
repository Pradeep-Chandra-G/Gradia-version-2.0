import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser, unauthorized, forbidden, ok } from "@/lib/api-utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT") return forbidden();

  // Get student's active batches
  const batchEnrollments = await prisma.batchStudent.findMany({
    where: { studentId: user.id, status: "ACTIVE" },
    include: {
      batch: { select: { id: true, name: true, subject: true, color: true } },
    },
  });
  const batchIds = batchEnrollments.map((e) => e.batchId);

  // Get all quizzes accessible to this student (via their active batches)
  const now = new Date();

  const [assignedQuizzes, attempts] = await Promise.all([
    prisma.quiz.findMany({
      where: {
        status: "PUBLISHED",
        batches: { some: { batchId: { in: batchIds } } },
      },
      select: {
        id: true,
        title: true,
        subject: true,
        difficulty: true,
        beginWindow: true,
        endWindow: true,
        totalTimeLimit: true,
        passScore: true,
        correctPoints: true,
        wrongPoints: true,
        sections: { select: { questions: { select: { id: true } } } },
      },
    }),
    prisma.attempt.findMany({
      where: { userId: user.id, status: "SUBMITTED" },
      select: {
        id: true,
        quizId: true,
        totalScore: true,
        maxScore: true,
        percentageScore: true,
        passed: true,
        submittedAt: true,
        timeSpent: true,
      },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  const attemptedQuizIds = new Set(attempts.map((a) => a.quizId));
  const upcomingQuizzes = assignedQuizzes.filter(
    (q) => !attemptedQuizIds.has(q.id) && (!q.endWindow || q.endWindow > now),
  );
  const completedQuizzes = assignedQuizzes.filter((q) =>
    attemptedQuizIds.has(q.id),
  );

  const latestAttempt = attempts[0] ?? null;
  const averageScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + (a.percentageScore ?? 0), 0) /
            attempts.length,
        )
      : 0;

  return ok({
    student: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    },
    stats: {
      totalBatches: batchIds.length,
      totalAssigned: assignedQuizzes.length,
      completed: completedQuizzes.length,
      upcoming: upcomingQuizzes.length,
      averageScore,
      latestScore: latestAttempt?.percentageScore ?? null,
    },
    batches: batchEnrollments.map((e) => e.batch),
    upcomingQuizzes: upcomingQuizzes.slice(0, 5).map((q) => ({
      id: q.id,
      title: q.title,
      subject: q.subject,
      difficulty: q.difficulty,
      beginWindow: q.beginWindow,
      endWindow: q.endWindow,
      totalQuestions: q.sections.reduce(
        (s, sec) => s + sec.questions.length,
        0,
      ),
      totalTimeLimit: q.totalTimeLimit,
    })),
    recentAttempts: attempts.slice(0, 5),
  });
}
