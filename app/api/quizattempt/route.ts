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

// POST /api/quiz_attempt — start a new attempt
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT" && user.role !== "ADMIN") return forbidden();

  const body = await req.json();
  const { quizId } = body;
  if (!quizId) return badRequest("quizId is required");

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
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
  });

  if (!quiz) return notFound("Quiz not found");
  if (quiz.status !== "PUBLISHED") return badRequest("Quiz is not available");

  const now = new Date();
  if (quiz.beginWindow && quiz.beginWindow > now)
    return badRequest("Quiz has not started yet");
  if (quiz.endWindow && quiz.endWindow < now)
    return badRequest("Quiz deadline has passed");

  // Check if student has already submitted this quiz
  const existing = await prisma.attempt.findFirst({
    where: { userId: user.id, quizId, status: "SUBMITTED" },
  });
  if (existing) return badRequest("You have already submitted this quiz");

  // Find or create IN_PROGRESS attempt
  const inProgress = await prisma.attempt.findFirst({
    where: { userId: user.id, quizId, status: "IN_PROGRESS" },
  });
  if (inProgress) {
    return ok({ attemptId: inProgress.id, quiz, resuming: true });
  }

  const attemptCount = await prisma.attempt.count({
    where: { userId: user.id, quizId },
  });

  const attempt = await prisma.attempt.create({
    data: {
      userId: user.id,
      quizId,
      attemptNumber: attemptCount + 1,
      status: "IN_PROGRESS",
    },
  });

  return ok({ attemptId: attempt.id, quiz, resuming: false });
}
