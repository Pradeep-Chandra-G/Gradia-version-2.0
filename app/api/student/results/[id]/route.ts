import { prisma } from "@/app/lib/prisma";

import {
  getCurrentUser,
  unauthorized,
  forbidden,
  notFound,
  ok,
} from "@/lib/api-utils";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT") return forbidden();

  const { id } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { id },
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
                  answers: { where: { attemptId: id } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt) return notFound("Attempt not found");
  if (attempt.userId !== user.id) return forbidden();

  // Only show answers if results are available
  const showAnswers = attempt.quiz.showResultsImmediately;

  return ok({
    id: attempt.id,
    quizId: attempt.quizId,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    timeSpent: attempt.timeSpent,
    totalScore: attempt.totalScore,
    maxScore: attempt.maxScore,
    percentageScore: attempt.percentageScore,
    passed: attempt.passed,
    quiz: {
      id: attempt.quiz.id,
      title: attempt.quiz.title,
      subject: attempt.quiz.subject,
      difficulty: attempt.quiz.difficulty,
      passScore: attempt.quiz.passScore,
      correctPoints: attempt.quiz.correctPoints,
      wrongPoints: attempt.quiz.wrongPoints,
      sections: showAnswers
        ? attempt.quiz.sections.map((section) => ({
            id: section.id,
            title: section.title,
            order: section.order,
            questions: section.questions.map((q) => {
              const answer = q.answers[0];
              return {
                id: q.id,
                questionType: q.questionType,
                questionText: q.questionText,
                order: q.order,
                points: q.points,
                explanation: q.explanation,
                options: q.options.map((o) => ({
                  id: o.id,
                  optionText: o.optionText,
                  isCorrect: o.isCorrect,
                  order: o.order,
                })),
                answer: answer
                  ? {
                      optionId: answer.optionId,
                      selectedOptions: answer.selectedOptions,
                      textAnswer: answer.textAnswer,
                      isCorrect: answer.isCorrect,
                      pointsEarned: answer.pointsEarned,
                    }
                  : null,
              };
            }),
          }))
        : [],
    },
    showAnswers,
  });
}
