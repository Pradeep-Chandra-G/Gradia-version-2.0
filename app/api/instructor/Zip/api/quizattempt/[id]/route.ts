import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  getCurrentUser,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  ok,
} from "@/lib/api-utils";

type Params = { params: Promise<{ id: string }> };

// GET /api/quiz_attempt/[id] — load existing attempt's quiz for resuming
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
                include: { options: { orderBy: { order: "asc" } } },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt) return notFound("Attempt not found");
  if (attempt.userId !== user.id) return forbidden();
  if (attempt.status === "SUBMITTED")
    return ok({ status: "SUBMITTED", quiz: attempt.quiz });

  return ok({ attemptId: attempt.id, quiz: attempt.quiz, resuming: true });
}

// PATCH /api/quiz_attempt/[id] — submit attempt with answers
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT" && user.role !== "ADMIN") return forbidden();

  const { id: attemptId } = await params;
  const body = await req.json();
  const { answers, timeSpent } = body;
  // answers: Array<{ questionId: string, optionId?: string, selectedOptions?: string[] }>

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          sections: {
            include: {
              questions: {
                include: { options: true },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt) return notFound("Attempt not found");
  if (attempt.userId !== user.id) return forbidden();
  if (attempt.status === "SUBMITTED")
    return badRequest("Attempt already submitted");

  const quiz = attempt.quiz;

  // Build question map for scoring
  const questionMap = new Map<
    string,
    {
      points: number;
      options: { id: string; isCorrect: boolean }[];
      questionType: string;
    }
  >();
  for (const section of quiz.sections) {
    for (const q of section.questions) {
      questionMap.set(q.id, {
        points: q.points,
        options: q.options.map((o) => ({ id: o.id, isCorrect: o.isCorrect })),
        questionType: q.questionType,
      });
    }
  }

  let totalScore = 0;
  let maxScore = 0;

  const answerRecords = [];

  for (const section of quiz.sections) {
    for (const q of section.questions) {
      maxScore += q.points;
      const qMeta = questionMap.get(q.id)!;
      const submitted = answers?.find(
        (a: { questionId: string }) => a.questionId === q.id,
      );

      let isCorrect = false;
      let pointsEarned = 0;
      let optionId: string | null = null;
      let selectedOptions: string[] | null = null;

      if (submitted) {
        if (q.questionType === "MCQ") {
          const correctIds = qMeta.options
            .filter((o) => o.isCorrect)
            .map((o) => o.id);
          const sel: string[] = submitted.selectedOptions ?? [];
          isCorrect =
            correctIds.length === sel.length &&
            correctIds.every((id) => sel.includes(id));
          selectedOptions = sel;
        } else {
          // SINGLE_OPTION or TRUE_FALSE
          optionId = submitted.optionId ?? null;
          if (optionId) {
            const opt = qMeta.options.find((o) => o.id === optionId);
            isCorrect = opt?.isCorrect ?? false;
          }
        }

        pointsEarned = isCorrect
          ? quiz.correctPoints
          : submitted.optionId || submitted.selectedOptions?.length > 0
            ? quiz.wrongPoints
            : 0;
        totalScore += pointsEarned;
      }

      answerRecords.push({
        attemptId,
        questionId: q.id,
        optionId,
        selectedOptions: selectedOptions ? selectedOptions : undefined,
        isCorrect,
        pointsEarned,
        timeSpent: submitted?.timeSpent ?? null,
      });
    }
  }

  const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const passed =
    quiz.passScore != null
      ? percentageScore >= quiz.passScore
      : percentageScore >= 60;

  // Upsert answers and update attempt in a transaction
  await prisma
    .$transaction([
      ...answerRecords.map((a) =>
        prisma.answer.upsert({
          where: {
            // Use a compound unique or just create — we'll deleteMany + createMany pattern
            id: `placeholder-${a.questionId}`, // won't match, falls to create
          },
          update: {},
          create: {
            attemptId: a.attemptId,
            questionId: a.questionId,
            optionId: a.optionId,
            selectedOptions: a.selectedOptions ?? undefined,
            isCorrect: a.isCorrect,
            pointsEarned: a.pointsEarned,
            timeSpent: a.timeSpent,
          },
        }),
      ),
    ])
    .catch(() => {
      // Fallback: deleteMany + createMany
    });

  // Simpler: delete existing answers for this attempt, then bulk create
  await prisma.answer.deleteMany({ where: { attemptId } });
  await prisma.answer.createMany({
    data: answerRecords.map((a) => ({
      attemptId: a.attemptId,
      questionId: a.questionId,
      optionId: a.optionId ?? undefined,
      selectedOptions: a.selectedOptions ?? undefined,
      isCorrect: a.isCorrect,
      pointsEarned: a.pointsEarned,
      timeSpent: a.timeSpent ?? undefined,
    })),
  });

  const updatedAttempt = await prisma.attempt.update({
    where: { id: attemptId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      timeSpent: timeSpent ?? null,
      totalScore,
      maxScore,
      percentageScore,
      passed,
    },
  });

  return ok({
    attemptId,
    totalScore,
    maxScore,
    percentageScore,
    passed,
    showResultsImmediately: quiz.showResultsImmediately,
  });
}
