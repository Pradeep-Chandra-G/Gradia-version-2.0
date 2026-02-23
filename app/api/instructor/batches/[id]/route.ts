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

type Params = { params: Promise<{ id: string }> };

async function requireBatchInstructor(batchId: string, instructorId: string) {
  const bi = await prisma.batchInstructor.findUnique({
    where: { batchId_instructorId: { batchId, instructorId } },
  });
  return !!bi;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { id } = await params;
  if (!(await requireBatchInstructor(id, user.id))) return forbidden();

  const batch = await prisma.batch.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { invitedAt: "desc" },
      },
      quizzes: {
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              subject: true,
              status: true,
              difficulty: true,
              totalTimeLimit: true,
              beginWindow: true,
              endWindow: true,
              attempts: {
                select: { id: true, passed: true, percentageScore: true },
              },
            },
          },
        },
        orderBy: { assignedAt: "desc" },
      },
      instructors: {
        include: {
          instructor: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
    },
  });

  if (!batch) return notFound("Batch not found");

  return ok({
    batch: {
      id: batch.id,
      name: batch.name,
      subject: batch.subject,
      description: batch.description,
      color: batch.color,
      joinCode: batch.joinCode,
      instructors: batch.instructors.map((bi) => bi.instructor),
      students: batch.students,
      quizzes: batch.quizzes.map((qb) => ({
        ...qb.quiz,
        assignedAt: qb.assignedAt,
        attemptCount: qb.quiz.attempts.length,
        passRate:
          qb.quiz.attempts.length > 0
            ? Math.round(
                (qb.quiz.attempts.filter((a) => a.passed).length /
                  qb.quiz.attempts.length) *
                  100,
              )
            : 0,
      })),
    },
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { id } = await params;
  if (!(await requireBatchInstructor(id, user.id))) return forbidden();

  const body = await req.json();
  const { name, subject, description, color } = body;

  const batch = await prisma.batch.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(subject && { subject }),
      ...(description !== undefined && { description }),
      ...(color && { color }),
    },
  });

  return ok({ batch });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { id } = await params;
  if (!(await requireBatchInstructor(id, user.id))) return forbidden();

  await prisma.batch.delete({ where: { id } });

  return ok({ success: true });
}
