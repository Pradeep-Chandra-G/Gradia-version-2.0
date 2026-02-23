import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser, unauthorized, forbidden, ok } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT") return forbidden();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const skip = (page - 1) * limit;

  const [attempts, total] = await Promise.all([
    prisma.attempt.findMany({
      where: { userId: user.id, status: "SUBMITTED" },
      orderBy: { submittedAt: "desc" },
      skip,
      take: limit,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            subject: true,
            difficulty: true,
            passScore: true,
            totalTimeLimit: true,
          },
        },
      },
    }),
    prisma.attempt.count({ where: { userId: user.id, status: "SUBMITTED" } }),
  ]);

  return ok({
    attempts: attempts.map((a) => ({
      id: a.id,
      quizId: a.quizId,
      quiz: a.quiz,
      attemptNumber: a.attemptNumber,
      totalScore: a.totalScore,
      maxScore: a.maxScore,
      percentageScore: a.percentageScore,
      passed: a.passed,
      timeSpent: a.timeSpent,
      submittedAt: a.submittedAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
