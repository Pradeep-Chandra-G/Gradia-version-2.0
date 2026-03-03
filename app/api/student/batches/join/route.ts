import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  getCurrentUser,
  unauthorized,
  forbidden,
  badRequest,
  notFound,
  ok,
} from "@/lib/api-utils";

// POST /api/student/batches/join — join a batch via join code
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT") return forbidden();

  const body = await req.json();
  const { code } = body;
  if (!code) return badRequest("code is required");

  const trimmed = (code as string).trim().toUpperCase();

  // Try batch join code first
  const batch = await prisma.batch.findUnique({
    where: { joinCode: trimmed },
    include: { org: true },
  });

  if (batch) {
    // Check if already enrolled
    const existing = await prisma.batchStudent.findUnique({
      where: { batchId_studentId: { batchId: batch.id, studentId: user.id } },
    });

    if (existing) {
      if (existing.status === "ACTIVE")
        return badRequest("You are already enrolled in this batch");
      if (
        existing.status === "PENDING_ADMIN" ||
        existing.status === "PENDING_INSTRUCTOR"
      ) {
        return badRequest("Your enrollment request is already pending");
      }
      // REJECTED — re-apply
      await prisma.batchStudent.update({
        where: { id: existing.id },
        data: {
          status: "PENDING_ADMIN",
          invitedAt: new Date(),
          enrolledAt: null,
        },
      });
      return ok({
        type: "batch",
        name: batch.name,
        status: "PENDING_ADMIN",
        message: "Re-application submitted. Awaiting admin approval.",
      });
    }

    await prisma.batchStudent.create({
      data: {
        batchId: batch.id,
        studentId: user.id,
        status: "PENDING_ADMIN",
      },
    });

    return ok({
      type: "batch",
      name: batch.name,
      status: "PENDING_ADMIN",
      message: "Request submitted! Awaiting admin approval.",
    });
  }

  // Try quiz join code
  const quiz = await prisma.quiz.findUnique({
    where: { joinCode: trimmed },
  });

  if (quiz) {
    if (quiz.status !== "PUBLISHED")
      return badRequest("This quiz is not currently available");
    return ok({
      type: "quiz",
      name: quiz.title,
      quizId: quiz.id,
      message: "Quiz found! Redirecting...",
    });
  }

  return notFound(
    "Invalid or expired code. Please check with your instructor.",
  );
}
