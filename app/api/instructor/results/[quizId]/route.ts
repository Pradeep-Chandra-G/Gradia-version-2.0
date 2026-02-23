import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  getCurrentUser,
  unauthorized,
  forbidden,
  notFound,
  ok,
} from "@/lib/api-utils";

type Params = { params: Promise<{ quizId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { quizId } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      subject: true,
      passScore: true,
      difficulty: true,
      createdBy: true,
      correctPoints: true,
      wrongPoints: true,
      sections: {
        select: {
          id: true,
          title: true,
          order: true,
          questions: {
            select: { id: true, questionText: true, points: true, order: true },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz) return notFound("Quiz not found");
  if (quiz.createdBy !== user.id) return forbidden();

  const attempts = await prisma.attempt.findMany({
    where: { quizId, status: "SUBMITTED" },
    orderBy: { submittedAt: "desc" },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      answers: {
        select: {
          questionId: true,
          optionId: true,
          selectedOptions: true,
          isCorrect: true,
          pointsEarned: true,
          timeSpent: true,
        },
      },
    },
  });

  // Per-question stats
  const questionStats = new Map<
    string,
    { correct: number; total: number; avgTime: number; timeCount: number }
  >();
  for (const attempt of attempts) {
    for (const answer of attempt.answers) {
      const prev = questionStats.get(answer.questionId) ?? {
        correct: 0,
        total: 0,
        avgTime: 0,
        timeCount: 0,
      };
      questionStats.set(answer.questionId, {
        correct: prev.correct + (answer.isCorrect ? 1 : 0),
        total: prev.total + 1,
        avgTime: prev.avgTime + (answer.timeSpent ?? 0),
        timeCount: prev.timeCount + (answer.timeSpent ? 1 : 0),
      });
    }
  }

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
    quiz,
    stats: {
      totalAttempts: attempts.length,
      averageScore: avgScore,
      passRate,
      highestScore: attempts.reduce(
        (max, a) => Math.max(max, a.percentageScore ?? 0),
        0,
      ),
      lowestScore: attempts.reduce(
        (min, a) => Math.min(min, a.percentageScore ?? 100),
        100,
      ),
    },
    questionStats: Array.from(questionStats.entries()).map(
      ([questionId, stats]) => ({
        questionId,
        correctRate:
          stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        totalAnswered: stats.total,
        avgTimeSpent:
          stats.timeCount > 0
            ? Math.round(stats.avgTime / stats.timeCount)
            : null,
      }),
    ),
    attempts: attempts.map((a) => ({
      id: a.id,
      student: a.user,
      attemptNumber: a.attemptNumber,
      totalScore: a.totalScore,
      maxScore: a.maxScore,
      percentageScore: a.percentageScore,
      passed: a.passed,
      timeSpent: a.timeSpent,
      submittedAt: a.submittedAt,
    })),
  });
}
