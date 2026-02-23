import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser, unauthorized, forbidden, ok } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT") return forbidden();

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "all"; // all | upcoming | completed | missed

  // Get active batch IDs for this student
  const batchEnrollments = await prisma.batchStudent.findMany({
    where: { studentId: user.id, status: "ACTIVE" },
    select: { batchId: true },
  });
  const batchIds = batchEnrollments.map((e) => e.batchId);

  const now = new Date();

  // Get all published quizzes for these batches
  const quizzes = await prisma.quiz.findMany({
    where: {
      status: "PUBLISHED",
      batches: { some: { batchId: { in: batchIds } } },
    },
    include: {
      sections: {
        include: {
          questions: { select: { id: true, points: true } },
        },
      },
      attempts: {
        where: { userId: user.id },
        orderBy: { attemptNumber: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          totalScore: true,
          maxScore: true,
          percentageScore: true,
          passed: true,
          submittedAt: true,
          attemptNumber: true,
        },
      },
      batches: {
        include: { batch: { select: { id: true, name: true, color: true } } },
      },
    },
    orderBy: { beginWindow: "asc" },
  });

  // Enrich and filter quizzes
  const enriched = quizzes.map((q) => {
    const lastAttempt = q.attempts[0] ?? null;
    const totalQuestions = q.sections.reduce(
      (s, sec) => s + sec.questions.length,
      0,
    );
    const maxScore = q.sections.reduce(
      (s, sec) => s + sec.questions.reduce((qs, qu) => qs + qu.points, 0),
      0,
    );

    let quizStatus: "upcoming" | "active" | "completed" | "missed" = "upcoming";
    if (lastAttempt?.status === "SUBMITTED") {
      quizStatus = "completed";
    } else if (q.endWindow && q.endWindow < now) {
      quizStatus = "missed";
    } else if (!q.beginWindow || q.beginWindow <= now) {
      quizStatus = "active";
    }

    return {
      id: q.id,
      title: q.title,
      subject: q.subject,
      difficulty: q.difficulty,
      beginWindow: q.beginWindow,
      endWindow: q.endWindow,
      totalTimeLimit: q.totalTimeLimit,
      totalQuestions,
      maxScore,
      passScore: q.passScore,
      status: quizStatus,
      batches: q.batches.map((b) => b.batch),
      lastAttempt,
    };
  });

  const filtered =
    filter === "all" ? enriched : enriched.filter((q) => q.status === filter);

  return ok({ quizzes: filtered });
}
