import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

// GET /api/instructor/quizzes
export async function GET() {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const quizzes = await prisma.quiz.findMany({
    where: {
      orgId: user.orgId ?? undefined,
      createdBy: user.id,
    },
    include: {
      sections: {
        include: {
          questions: {
            include: { options: true },
          },
        },
      },
      batches: {
        include: { batch: { select: { id: true, name: true, subject: true } } },
      },
      attempts: {
        select: {
          percentageScore: true,
          passed: true,
          status: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = quizzes.map((q) => {
    const scores = q.attempts
      .map((a) => a.percentageScore)
      .filter((s): s is number => s != null);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, c) => a + c, 0) / scores.length)
        : 0;
    const questionCount = q.sections.reduce(
      (acc, s) => acc + s.questions.length,
      0,
    );
    const passCount = q.attempts.filter((a) => a.passed).length;

    return {
      id: q.id,
      title: q.title,
      description: q.description,
      subject: q.subject,
      difficulty: q.difficulty,
      status: q.status.toLowerCase(),
      accessType: q.accessType,
      totalTimeLimit: q.totalTimeLimit,
      beginWindow: q.beginWindow?.toISOString() ?? null,
      endWindow: q.endWindow?.toISOString() ?? null,
      showResultsImmediately: q.showResultsImmediately,
      passScore: q.passScore,
      correctPoints: q.correctPoints,
      wrongPoints: q.wrongPoints,
      createdAt: q.createdAt.toISOString(),
      questionCount,
      sectionCount: q.sections.length,
      attempts: q.attempts.length,
      avgScore,
      passRate:
        q.attempts.length > 0
          ? Math.round((passCount / q.attempts.length) * 100)
          : 0,
      batches: q.batches.map((qb) => ({
        id: qb.batch.id,
        name: qb.batch.name,
        subject: qb.batch.subject,
      })),
    };
  });

  return NextResponse.json({ quizzes: result });
}

// POST /api/instructor/quizzes — full quiz create (from quiz builder)
export async function POST(req: Request) {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!user.orgId)
    return NextResponse.json(
      { error: "Instructor is not assigned to an organisation" },
      { status: 400 },
    );

  let body: {
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
    sections?: Array<{
      title: string;
      order: number;
      sectionalTimeLimit?: number | null;
      questions: Array<{
        questionText: string;
        questionType: string;
        order: number;
        points?: number;
        explanation?: string;
        options: Array<{
          optionText: string;
          isCorrect: boolean;
          order: number;
        }>;
      }>;
    }>;
    publish?: boolean; // if true, set status = PUBLISHED
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.title?.trim())
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!body.subject?.trim())
    return NextResponse.json({ error: "subject is required" }, { status: 400 });
  if (!body.sections || body.sections.length === 0)
    return NextResponse.json(
      { error: "At least one section with questions is required" },
      { status: 400 },
    );

  const quizStatus = body.publish ? "PUBLISHED" : "DRAFT";

  const quiz = await prisma.quiz.create({
    data: {
      title: body.title.trim(),
      description: body.description?.trim() ?? null,
      subject: body.subject.trim(),
      difficulty: (body.difficulty as any) ?? "MEDIUM",
      accessType: (body.accessType as any) ?? "BATCH_ONLY",
      totalTimeLimit: body.totalTimeLimit ?? null,
      beginWindow: body.beginWindow ? new Date(body.beginWindow) : null,
      endWindow: body.endWindow ? new Date(body.endWindow) : null,
      showResultsImmediately: body.showResultsImmediately ?? true,
      passScore: body.passScore ?? 50,
      correctPoints: body.correctPoints ?? 1,
      wrongPoints: body.wrongPoints ?? 0,
      status: quizStatus,
      orgId: user.orgId,
      createdBy: user.id,
      sections: {
        create: body.sections.map((section) => ({
          title: section.title,
          order: section.order,
          sectionalTimeLimit: section.sectionalTimeLimit ?? null,
          questions: {
            create: section.questions.map((q) => ({
              questionText: q.questionText,
              questionType: (q.questionType as any) ?? "MCQ",
              order: q.order,
              points: q.points ?? body.correctPoints ?? 1,
              explanation: q.explanation ?? null,
              options: {
                create: q.options.map((opt) => ({
                  optionText: opt.optionText,
                  isCorrect: opt.isCorrect,
                  order: opt.order,
                })),
              },
            })),
          },
        })),
      },
    },
    include: {
      sections: { include: { questions: { include: { options: true } } } },
    },
  });

  // Link to batches
  if (body.batchIds && body.batchIds.length > 0) {
    await prisma.quizBatch.createMany({
      data: body.batchIds.map((batchId) => ({ quizId: quiz.id, batchId })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json(
    { quiz: { id: quiz.id, title: quiz.title, status: quiz.status } },
    { status: 201 },
  );
}
