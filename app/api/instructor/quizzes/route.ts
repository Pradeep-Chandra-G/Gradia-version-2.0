import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  getCurrentUser,
  unauthorized,
  forbidden,
  badRequest,
  ok,
} from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const quizzes = await prisma.quiz.findMany({
    where: { createdBy: user.id },
    include: {
      sections: {
        include: {
          questions: { select: { id: true, points: true } },
        },
      },
      attempts: {
        where: { status: "SUBMITTED" },
        select: { id: true, passed: true, percentageScore: true },
      },
      batches: {
        include: { batch: { select: { id: true, name: true, color: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return ok({
    quizzes: quizzes.map((q) => ({
      id: q.id,
      title: q.title,
      subject: q.subject,
      difficulty: q.difficulty,
      status: q.status,
      accessType: q.accessType,
      totalTimeLimit: q.totalTimeLimit,
      passScore: q.passScore,
      beginWindow: q.beginWindow,
      endWindow: q.endWindow,
      createdAt: q.createdAt,
      publishedAt: q.publishedAt,
      joinCode: q.joinCode,
      totalQuestions: q.sections.reduce(
        (s, sec) => s + sec.questions.length,
        0,
      ),
      maxScore: q.sections.reduce(
        (s, sec) => s + sec.questions.reduce((qs, qu) => qs + qu.points, 0),
        0,
      ),
      attemptCount: q.attempts.length,
      passRate:
        q.attempts.length > 0
          ? Math.round(
              (q.attempts.filter((a) => a.passed).length / q.attempts.length) *
                100,
            )
          : 0,
      batches: q.batches.map((qb) => qb.batch),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();
  if (!user.orgId) return badRequest("Instructor must belong to an org");

  const body = await req.json();
  const {
    title,
    description,
    subject,
    difficulty,
    accessType,
    totalTimeLimit,
    beginWindow,
    endWindow,
    showResultsImmediately,
    passScore,
    correctPoints,
    wrongPoints,
    generateJoinCode,
    batchIds,
  } = body;

  if (!title) return badRequest("title is required");

  const quiz = await prisma.quiz.create({
    data: {
      title,
      description: description ?? null,
      subject: subject ?? "General",
      difficulty: difficulty ?? "MEDIUM",
      accessType: accessType ?? "BATCH_ONLY",
      totalTimeLimit: totalTimeLimit ?? null,
      beginWindow: beginWindow ? new Date(beginWindow) : null,
      endWindow: endWindow ? new Date(endWindow) : null,
      showResultsImmediately: showResultsImmediately ?? true,
      passScore: passScore ?? null,
      correctPoints: correctPoints ?? 4,
      wrongPoints: wrongPoints ?? -1,
      joinCode: generateJoinCode ? nanoid(8).toUpperCase() : null,
      orgId: user.orgId!,
      createdBy: user.id,
      status: "DRAFT",
      batches: batchIds?.length
        ? { create: batchIds.map((batchId: string) => ({ batchId })) }
        : undefined,
    },
  });

  return ok({ quiz });
}
