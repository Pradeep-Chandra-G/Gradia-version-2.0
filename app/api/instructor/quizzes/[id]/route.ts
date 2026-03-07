import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

// GET /api/instructor/quizzes/[id]
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const quiz = await prisma.quiz.findFirst({
    where: { id: params.id, createdBy: user.id },
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
      batches: {
        include: { batch: { select: { id: true, name: true, subject: true } } },
      },
    },
  });

  if (!quiz)
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      status: quiz.status,
      accessType: quiz.accessType,
      totalTimeLimit: quiz.totalTimeLimit,
      beginWindow: quiz.beginWindow?.toISOString() ?? null,
      endWindow: quiz.endWindow?.toISOString() ?? null,
      showResultsImmediately: quiz.showResultsImmediately,
      passScore: quiz.passScore,
      correctPoints: quiz.correctPoints,
      wrongPoints: quiz.wrongPoints,
      createdAt: quiz.createdAt.toISOString(),
      sections: quiz.sections.map((s) => ({
        id: s.id,
        title: s.title,
        order: s.order,
        sectionalTimeLimit: s.sectionalTimeLimit,
        questions: s.questions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          order: q.order,
          points: q.points,
          explanation: q.explanation,
          options: q.options.map((o) => ({
            id: o.id,
            optionText: o.optionText,
            isCorrect: o.isCorrect,
            order: o.order,
          })),
        })),
      })),
      batches: quiz.batches.map((qb) => ({
        id: qb.batch.id,
        name: qb.batch.name,
        subject: qb.batch.subject,
      })),
    },
  });
}

// PATCH /api/instructor/quizzes/[id] — update status (publish/close) or metadata
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.quiz.findFirst({
    where: { id: params.id, createdBy: user.id },
  });
  if (!existing)
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  let body: {
    status?: "DRAFT" | "PUBLISHED" | "FINISHED";
    title?: string;
    description?: string;
    subject?: string;
    difficulty?: string;
    accessType?: string;
    totalTimeLimit?: number | null;
    beginWindow?: string | null;
    endWindow?: string | null;
    showResultsImmediately?: boolean;
    passScore?: number;
    correctPoints?: number;
    wrongPoints?: number;
    batchIds?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Prevent publishing a FINISHED quiz
  if (body.status === "PUBLISHED" && existing.status === "FINISHED") {
    return NextResponse.json(
      { error: "Cannot re-publish a finished quiz" },
      { status: 400 },
    );
  }

  const updated = await prisma.quiz.update({
    where: { id: params.id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
      ...(body.subject !== undefined ? { subject: body.subject.trim() } : {}),
      ...(body.difficulty !== undefined
        ? { difficulty: body.difficulty as any }
        : {}),
      ...(body.accessType !== undefined
        ? { accessType: body.accessType as any }
        : {}),
      ...(body.totalTimeLimit !== undefined
        ? { totalTimeLimit: body.totalTimeLimit }
        : {}),
      ...(body.beginWindow !== undefined
        ? { beginWindow: body.beginWindow ? new Date(body.beginWindow) : null }
        : {}),
      ...(body.endWindow !== undefined
        ? { endWindow: body.endWindow ? new Date(body.endWindow) : null }
        : {}),
      ...(body.showResultsImmediately !== undefined
        ? { showResultsImmediately: body.showResultsImmediately }
        : {}),
      ...(body.passScore !== undefined ? { passScore: body.passScore } : {}),
      ...(body.correctPoints !== undefined
        ? { correctPoints: body.correctPoints }
        : {}),
      ...(body.wrongPoints !== undefined
        ? { wrongPoints: body.wrongPoints }
        : {}),
    },
  });

  // Update batch assignments if provided
  if (body.batchIds !== undefined) {
    await prisma.quizBatch.deleteMany({ where: { quizId: params.id } });
    if (body.batchIds.length > 0) {
      await prisma.quizBatch.createMany({
        data: body.batchIds.map((batchId) => ({ quizId: params.id, batchId })),
        skipDuplicates: true,
      });
    }
  }

  return NextResponse.json({
    quiz: { id: updated.id, title: updated.title, status: updated.status },
  });
}

// DELETE /api/instructor/quizzes/[id] — only DRAFT quizzes
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const existing = await prisma.quiz.findFirst({
    where: { id: params.id, createdBy: user.id },
  });
  if (!existing)
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  if (existing.status !== "DRAFT")
    return NextResponse.json(
      { error: "Only DRAFT quizzes can be deleted" },
      { status: 400 },
    );

  await prisma.quiz.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
