import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

// GET /api/instructor/results/[quizId]
export async function GET(
  _req: Request,
  { params }: { params: { quizId: string } },
) {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const quiz = await prisma.quiz.findFirst({
    where: { id: params.quizId, createdBy: user.id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              options: { orderBy: { order: "asc" } },
              answers: {
                include: {
                  attempt: {
                    include: {
                      user: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      attempts: {
        where: { status: "SUBMITTED" },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          answers: { include: { question: true } },
        },
        orderBy: { completedAt: "desc" },
      },
      batches: { include: { batch: { select: { id: true, name: true } } } },
    },
  });

  if (!quiz)
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const totalQs = quiz.sections.reduce((acc, s) => acc + s.questions.length, 0);
  const maxScore = totalQs * (quiz.correctPoints ?? 1);

  const submissions = quiz.attempts.map((a) => ({
    id: a.id,
    studentId: a.user.id,
    studentName: `${a.user.firstName} ${a.user.lastName}`.trim(),
    studentEmail: a.user.email,
    studentAvatar:
      `${a.user.firstName[0] ?? ""}${a.user.lastName[0] ?? ""}`.toUpperCase(),
    score: a.totalScore ?? 0,
    maxScore: a.maxScore ?? maxScore,
    percentage: a.percentageScore ?? 0,
    passed: a.passed ?? false,
    completedAt: a.completedAt?.toISOString() ?? "",
    timeSpent: a.timeSpent ?? 0,
    answers: a.answers.map((ans) => ({
      questionId: ans.questionId,
      questionText: ans.question.questionText,
      isCorrect: ans.isCorrect,
      pointsEarned: ans.pointsEarned,
    })),
  }));

  // Per-question stats
  const questionStats = quiz.sections.flatMap((s) =>
    s.questions.map((q) => {
      const questionAnswers = q.answers;
      const correctCount = questionAnswers.filter((a) => a.isCorrect).length;
      const totalCount = questionAnswers.length;
      return {
        questionId: q.id,
        questionText: q.questionText,
        sectionTitle: s.title,
        totalAnswers: totalCount,
        correctCount,
        correctRate:
          totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0,
        options: q.options.map((o) => {
          const selectedCount = questionAnswers.filter((a) =>
            Array.isArray(a.selectedOptions)
              ? (a.selectedOptions as string[]).includes(o.id)
              : a.optionId === o.id,
          ).length;
          return {
            id: o.id,
            optionText: o.optionText,
            isCorrect: o.isCorrect,
            selectedCount,
            selectRate:
              totalCount > 0
                ? Math.round((selectedCount / totalCount) * 100)
                : 0,
          };
        }),
      };
    }),
  );

  const scores = quiz.attempts
    .map((a) => a.percentageScore)
    .filter((s): s is number => s != null);
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, c) => a + c, 0) / scores.length)
      : 0;
  const passCount = quiz.attempts.filter((a) => a.passed).length;

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      status: quiz.status.toLowerCase(),
      totalAttempts: quiz.attempts.length,
      avgScore,
      passRate:
        quiz.attempts.length > 0
          ? Math.round((passCount / quiz.attempts.length) * 100)
          : 0,
      maxScore,
      batches: quiz.batches.map((qb) => qb.batch.name),
    },
    submissions,
    questionStats,
  });
}
