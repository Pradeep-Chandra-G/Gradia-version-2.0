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

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
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
      batches: {
        include: { batch: { select: { id: true, name: true, color: true } } },
      },
      attempts: {
        where: { status: "SUBMITTED" },
        select: {
          id: true,
          passed: true,
          percentageScore: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!quiz) return notFound("Quiz not found");
  if (quiz.createdBy !== user.id) return forbidden();

  return ok({ quiz });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: { createdBy: true, status: true },
  });
  if (!quiz) return notFound("Quiz not found");
  if (quiz.createdBy !== user.id) return forbidden();

  const body = await req.json();
  const { action, batchIds, ...fields } = body;

  // Special actions
  if (action === "publish") {
    if (quiz.status === "PUBLISHED")
      return badRequest("Quiz is already published");
    const updated = await prisma.quiz.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    return ok({ quiz: updated });
  }

  if (action === "unpublish") {
    const updated = await prisma.quiz.update({
      where: { id },
      data: { status: "DRAFT", publishedAt: null },
    });
    return ok({ quiz: updated });
  }

  if (action === "finish") {
    const updated = await prisma.quiz.update({
      where: { id },
      data: { status: "FINISHED" },
    });
    return ok({ quiz: updated });
  }

  // Batch assignment update
  if (batchIds !== undefined) {
    await prisma.quizBatch.deleteMany({ where: { quizId: id } });
    if (batchIds.length > 0) {
      await prisma.quizBatch.createMany({
        data: batchIds.map((batchId: string) => ({ quizId: id, batchId })),
        skipDuplicates: true,
      });
    }
  }

  // General field update
  const updateData: Record<string, unknown> = {};
  const allowed = [
    "title",
    "description",
    "subject",
    "difficulty",
    "accessType",
    "totalTimeLimit",
    "beginWindow",
    "endWindow",
    "showResultsImmediately",
    "passScore",
    "correctPoints",
    "wrongPoints",
  ];
  for (const key of allowed) {
    if (key in fields) {
      if ((key === "beginWindow" || key === "endWindow") && fields[key]) {
        updateData[key] = new Date(fields[key]);
      } else {
        updateData[key] = fields[key];
      }
    }
  }

  if (Object.keys(updateData).length === 0 && batchIds === undefined) {
    return badRequest("No valid fields to update");
  }

  const updated = await prisma.quiz.update({ where: { id }, data: updateData });
  return ok({ quiz: updated });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: { createdBy: true },
  });
  if (!quiz) return notFound("Quiz not found");
  if (quiz.createdBy !== user.id) return forbidden();

  await prisma.quiz.delete({ where: { id } });
  return ok({ success: true });
}
