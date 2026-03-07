import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

// GET /api/instructor/batches/[id]
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const batch = await prisma.batch.findFirst({
    where: {
      id: params.id,
      orgId: user.orgId ?? undefined,
      instructors: { some: { instructorId: user.id } },
    },
    include: {
      students: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              attempts: {
                where: {
                  quiz: { batches: { some: { batchId: params.id } } },
                },
                select: {
                  quizId: true,
                  percentageScore: true,
                  status: true,
                  completedAt: true,
                  quiz: { select: { title: true } },
                },
              },
            },
          },
        },
      },
      quizzes: {
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              status: true,
              beginWindow: true,
              endWindow: true,
              attempts: {
                select: {
                  percentageScore: true,
                  passed: true,
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!batch)
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });

  const activeStudents = batch.students.filter((s) => s.status === "ACTIVE");
  const pendingAdmin = batch.students.filter(
    (s) => s.status === "PENDING_ADMIN",
  );
  const pendingInstructor = batch.students.filter(
    (s) => s.status === "PENDING_INSTRUCTOR",
  );

  return NextResponse.json({
    batch: {
      id: batch.id,
      name: batch.name,
      subject: batch.subject,
      description: batch.description,
      color: batch.color,
      joinCode: batch.joinCode,
      createdAt: batch.createdAt.toISOString().split("T")[0],
      quizCount: batch.quizzes.length,
      students: activeStudents.map((s) => ({
        id: s.student.id,
        name: `${s.student.firstName} ${s.student.lastName}`.trim(),
        email: s.student.email,
        avatar:
          `${s.student.firstName[0] ?? ""}${s.student.lastName[0] ?? ""}`.toUpperCase(),
        joinedAt:
          s.enrolledAt?.toISOString().split("T")[0] ??
          s.invitedAt.toISOString().split("T")[0],
        status: "active" as const,
        scores: s.student.attempts.map((a) => ({
          quizId: a.quizId,
          quizTitle: a.quiz.title,
          score: a.percentageScore ?? 0,
          passed: a.status === "SUBMITTED",
          completedAt: a.completedAt?.toISOString().split("T")[0],
        })),
      })),
      pendingRequests: [
        ...pendingAdmin.map((s) => ({
          id: s.id,
          studentId: s.student.id,
          studentName: `${s.student.firstName} ${s.student.lastName}`.trim(),
          studentEmail: s.student.email,
          studentAvatar:
            `${s.student.firstName[0] ?? ""}${s.student.lastName[0] ?? ""}`.toUpperCase(),
          requestedAt: s.invitedAt.toISOString().split("T")[0],
          adminStatus: "awaiting_admin" as const,
        })),
        ...pendingInstructor.map((s) => ({
          id: s.id,
          studentId: s.student.id,
          studentName: `${s.student.firstName} ${s.student.lastName}`.trim(),
          studentEmail: s.student.email,
          studentAvatar:
            `${s.student.firstName[0] ?? ""}${s.student.lastName[0] ?? ""}`.toUpperCase(),
          requestedAt: s.invitedAt.toISOString().split("T")[0],
          adminStatus: "admin_approved" as const,
        })),
      ],
      quizzes: batch.quizzes.map((qb) => {
        const scores = qb.quiz.attempts
          .map((a) => a.percentageScore)
          .filter((s): s is number => s != null);
        const avgScore =
          scores.length > 0
            ? Math.round(scores.reduce((a, c) => a + c, 0) / scores.length)
            : 0;
        const passCount = qb.quiz.attempts.filter((a) => a.passed).length;
        return {
          id: qb.quiz.id,
          title: qb.quiz.title,
          status: qb.quiz.status.toLowerCase(),
          beginWindow: qb.quiz.beginWindow?.toISOString() ?? null,
          endWindow: qb.quiz.endWindow?.toISOString() ?? null,
          attempts: qb.quiz.attempts.length,
          avgScore,
          passRate:
            qb.quiz.attempts.length > 0
              ? Math.round((passCount / qb.quiz.attempts.length) * 100)
              : 0,
        };
      }),
    },
  });
}

// PATCH /api/instructor/batches/[id] — approve/reject student
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: {
    action?: "approve" | "reject";
    batchStudentId?: string;
    name?: string;
    description?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Approve or reject a student
  if (body.action === "approve" || body.action === "reject") {
    if (!body.batchStudentId)
      return NextResponse.json(
        { error: "batchStudentId required" },
        { status: 400 },
      );

    const bs = await prisma.batchStudent.findFirst({
      where: { id: body.batchStudentId, batchId: params.id },
    });
    if (!bs)
      return NextResponse.json({ error: "Record not found" }, { status: 404 });

    if (body.action === "approve") {
      await prisma.batchStudent.update({
        where: { id: bs.id },
        data: { status: "ACTIVE", enrolledAt: new Date() },
      });
    } else {
      await prisma.batchStudent.update({
        where: { id: bs.id },
        data: { status: "REJECTED" },
      });
    }
    return NextResponse.json({ success: true });
  }

  // Update batch metadata
  if (body.name || body.description !== undefined) {
    const updated = await prisma.batch.update({
      where: { id: params.id },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.description !== undefined
          ? { description: body.description }
          : {}),
      },
    });
    return NextResponse.json({ batch: { id: updated.id, name: updated.name } });
  }

  return NextResponse.json(
    { error: "No valid action specified" },
    { status: 400 },
  );
}
