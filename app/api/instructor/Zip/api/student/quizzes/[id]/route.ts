import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  getCurrentUser,
  unauthorized,
  forbidden,
  notFound,
  ok,
} from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

// GET /api/student/quizzes/[id] — quiz detail + student's attempt status
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT" && user.role !== "ADMIN") return forbidden();

  const { id: quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      sections: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          timeLimit: true,
          _count: { select: { questions: true } },
        },
      },
    },
  });

  if (!quiz) return notFound("Quiz not found");
  if (quiz.status !== "PUBLISHED") return notFound("Quiz not found");

  // Get latest attempt for this student
  const latestAttempt = await prisma.attempt.findFirst({
    where: { userId: user.id, quizId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      percentageScore: true,
      passed: true,
    },
  });

  return ok({
    quiz: {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      totalQuestions: quiz.totalQuestions,
      totalTimeLimit: quiz.totalTimeLimit,
      beginWindow: quiz.beginWindow,
      endWindow: quiz.endWindow,
      passScore: quiz.passScore,
      correctPoints: quiz.correctPoints,
      wrongPoints: quiz.wrongPoints,
      showResultsImmediately: quiz.showResultsImmediately,
      sections: quiz.sections.map((s) => ({
        id: s.id,
        title: s.title,
        timeLimit: s.timeLimit,
        questionCount: s._count.questions,
      })),
      attemptStatus: latestAttempt?.status ?? "NOT_STARTED",
      attemptId: latestAttempt?.id ?? null,
      percentageScore: latestAttempt?.percentageScore ?? null,
      passed: latestAttempt?.passed ?? null,
    },
  });
}
