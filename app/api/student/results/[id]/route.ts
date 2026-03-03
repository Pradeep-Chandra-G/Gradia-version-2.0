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

// GET /api/student/results/[id] — detailed result for a single attempt
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT" && user.role !== "ADMIN") return forbidden();

  const { id: attemptId } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          sections: {
            orderBy: { order: "asc" },
            include: {
              questions: {
                orderBy: { order: "asc" },
                include: {
                  options: { orderBy: { order: "asc" } },
                },
              },
            },
          },
        },
      },
      answers: true,
    },
  });

  if (!attempt) return notFound("Result not found");
  // Admin can see any, student can only see their own
  if (user.role !== "ADMIN" && attempt.userId !== user.id) return forbidden();
  if (attempt.status !== "SUBMITTED") return notFound("Result not found");

  const showAnswers = attempt.quiz.showResultsImmediately;

  // Build answer map
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  const sections = attempt.quiz.sections.map((section) => ({
    id: section.id,
    title: section.title,
    answers: section.questions.map((q) => {
      const ans = answerMap.get(q.id);
      const correctOptions = q.options
        .filter((o) => o.isCorrect)
        .map((o) => o.id);
      const optionTexts = Object.fromEntries(
        q.options.map((o) => [o.id, o.text]),
      );

      return {
        questionId: q.id,
        questionText: q.text,
        questionType: q.questionType,
        pointsAvailable: q.points,
        pointsEarned: ans?.pointsEarned ?? 0,
        isCorrect: ans?.isCorrect ?? false,
        selectedOption: ans?.optionId ?? null,
        selectedOptions: ans?.selectedOptions ?? null,
        correctOptions: showAnswers ? correctOptions : [],
        optionTexts: showAnswers ? optionTexts : {},
      };
    }),
  }));

  return ok({
    result: {
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz.title,
      subject: attempt.quiz.subject,
      totalScore: attempt.totalScore ?? 0,
      maxScore: attempt.maxScore ?? 0,
      percentageScore: attempt.percentageScore ?? 0,
      passed: attempt.passed ?? false,
      submittedAt: attempt.submittedAt,
      timeSpent: attempt.timeSpent,
      attemptNumber: attempt.attemptNumber,
      showAnswers,
      sections,
    },
  });
}
