import { NextResponse } from "next/server";
import { getCurrentUser, unauthorized, badRequest } from "@/lib/api-utils";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body");
  }

  const code = (body.code ?? "").trim().toUpperCase();
  if (!code) return badRequest("Code is required");

  // ── 1. Check for a Batch join code ──────────────────────────────────────
  const batch = await prisma.batch.findUnique({
    where: { joinCode: code },
    select: {
      id: true,
      name: true,
      subject: true,
      orgId: true,
    },
  });

  if (batch) {
    // Check if student is already enrolled
    const existing = await prisma.batchStudent.findUnique({
      where: { batchId_studentId: { batchId: batch.id, studentId: user.id } },
    });

    if (existing) {
      if (existing.status === "ACTIVE") {
        return NextResponse.json({
          type: "batch",
          name: batch.name,
          message: "You are already enrolled in this batch.",
          redirectTo: "/dashboard/quizzes",
        });
      }
      // Already requested — just redirect
      return NextResponse.json({
        type: "batch",
        name: batch.name,
        message: "Your enrollment request is pending approval.",
        redirectTo: "/dashboard",
      });
    }

    // Create enrollment request (pending admin approval)
    await prisma.batchStudent.create({
      data: {
        batchId: batch.id,
        studentId: user.id,
        status: "PENDING_ADMIN",
      },
    });

    return NextResponse.json({
      type: "batch",
      name: `${batch.name} (${batch.subject})`,
      message: "Join request submitted! Waiting for admin approval.",
      redirectTo: "/dashboard",
    });
  }

  // ── 2. Check for a Quiz join code ────────────────────────────────────────
  const quiz = await prisma.quiz.findUnique({
    where: { joinCode: code },
    select: {
      id: true,
      title: true,
      status: true,
    },
  });

  if (quiz) {
    if (quiz.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "This quiz is not currently available." },
        { status: 403 },
      );
    }

    // Add a direct invitation for this student if not already invited
    await prisma.quizInvitation.upsert({
      where: { quizId_userId: { quizId: quiz.id, userId: user.id } },
      update: {},
      create: { quizId: quiz.id, userId: user.id },
    });

    return NextResponse.json({
      type: "quiz",
      name: quiz.title,
      redirectTo: `/dashboard/quizzes/${quiz.id}`,
    });
  }

  // ── 3. No match ──────────────────────────────────────────────────────────
  return NextResponse.json(
    {
      error:
        "That code doesn't exist or has expired. Double-check with your instructor.",
    },
    { status: 404 },
  );
}
