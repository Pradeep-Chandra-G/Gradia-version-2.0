import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser, unauthorized, forbidden, ok } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const quizId = searchParams.get("quizId");
  const skip = (page - 1) * limit;

  const where = {
    quiz: { createdBy: user.id },
    status: "SUBMITTED" as const,
    ...(quizId && { quizId }),
  };

  const [attempts, total] = await Promise.all([
    prisma.attempt.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        quiz: {
          select: { id: true, title: true, subject: true, passScore: true },
        },
      },
    }),
    prisma.attempt.count({ where }),
  ]);

  return ok({
    attempts: attempts.map((a) => ({
      id: a.id,
      student: a.user,
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
