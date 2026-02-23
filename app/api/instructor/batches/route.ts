import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  getCurrentUser,
  unauthorized,
  forbidden,
  badRequest,
  ok,
} from "@/lib/api-utils";
import { nanoid } from "nanoid";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const batchInstructors = await prisma.batchInstructor.findMany({
    where: { instructorId: user.id },
    include: {
      batch: {
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
                },
              },
            },
          },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  return ok({
    batches: batchInstructors.map((bi) => ({
      id: bi.batch.id,
      name: bi.batch.name,
      subject: bi.batch.subject,
      description: bi.batch.description,
      color: bi.batch.color,
      joinCode: bi.batch.joinCode,
      studentCount: bi.batch.students.filter((s) => s.status === "ACTIVE")
        .length,
      pendingCount: bi.batch.students.filter(
        (s) =>
          s.status === "PENDING_ADMIN" || s.status === "PENDING_INSTRUCTOR",
      ).length,
      quizCount: bi.batch.quizzes.length,
      students: bi.batch.students,
      quizzes: bi.batch.quizzes.map((qb) => qb.quiz),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();
  if (!user.orgId) return badRequest("Instructor must belong to an org");

  const body = await req.json();
  const { name, subject, description, color, generateJoinCode } = body;

  if (!name || !subject) return badRequest("name and subject are required");

  const batch = await prisma.batch.create({
    data: {
      name,
      subject,
      description: description ?? null,
      color: color ?? "amber",
      joinCode: generateJoinCode ? nanoid(8).toUpperCase() : null,
      orgId: user.orgId,
      instructors: {
        create: { instructorId: user.id },
      },
    },
  });

  return ok({ batch });
}
