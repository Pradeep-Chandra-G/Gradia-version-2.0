import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { nanoid } from "nanoid";

async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

// GET /api/instructor/batches
export async function GET() {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const batches = await prisma.batch.findMany({
    where: {
      orgId: user.orgId ?? undefined,
      instructors: { some: { instructorId: user.id } },
    },
    include: {
      students: {
        include: {
          student: {
            select: { id: true, firstName: true, lastName: true, email: true },
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
              attempts: { select: { percentageScore: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = batches.map((b) => {
    const activeStudents = b.students.filter((s) => s.status === "ACTIVE");
    const pendingAdmin = b.students.filter((s) => s.status === "PENDING_ADMIN");
    const pendingInstructor = b.students.filter(
      (s) => s.status === "PENDING_INSTRUCTOR",
    );
    const allScores = b.quizzes
      .flatMap((qb) => qb.quiz.attempts.map((a) => a.percentageScore))
      .filter((s): s is number => s != null);
    const avgScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((a, c) => a + c, 0) / allScores.length)
        : 0;

    return {
      id: b.id,
      name: b.name,
      subject: b.subject,
      description: b.description,
      color: b.color,
      joinCode: b.joinCode,
      createdAt: b.createdAt.toISOString().split("T")[0],
      quizCount: b.quizzes.length,
      avgScore,
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
    };
  });

  return NextResponse.json({ batches: result });
}

// POST /api/instructor/batches — create a new batch
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
    name?: string;
    subject?: string;
    description?: string;
    color?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.name?.trim())
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!body.subject?.trim())
    return NextResponse.json({ error: "subject is required" }, { status: 400 });

  const batch = await prisma.batch.create({
    data: {
      name: body.name.trim(),
      subject: body.subject.trim(),
      description: body.description?.trim() ?? null,
      color: body.color ?? "amber",
      orgId: user.orgId,
      joinCode: nanoid(8).toUpperCase(),
    },
  });

  await prisma.batchInstructor.create({
    data: { batchId: batch.id, instructorId: user.id },
  });

  return NextResponse.json({
    batch: {
      id: batch.id,
      name: batch.name,
      subject: batch.subject,
      description: batch.description,
      color: batch.color,
      joinCode: batch.joinCode,
      createdAt: batch.createdAt.toISOString().split("T")[0],
      quizCount: 0,
      avgScore: 0,
      students: [],
      pendingRequests: [],
    },
  });
}
