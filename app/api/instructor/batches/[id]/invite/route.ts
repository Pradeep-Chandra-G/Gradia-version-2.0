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

export async function POST(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { id: batchId } = await params;

  // Verify instructor belongs to this batch
  const bi = await prisma.batchInstructor.findUnique({
    where: { batchId_instructorId: { batchId, instructorId: user.id } },
  });
  if (!bi) return forbidden();

  const body = await req.json();
  const { email } = body;
  if (!email) return badRequest("Student email is required");

  // Find the student user
  const student = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      orgId: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!student) return notFound("User not found with that email");
  if (student.role !== "STUDENT") return badRequest("User is not a student");

  // Check if already enrolled/invited
  const existing = await prisma.batchStudent.findUnique({
    where: { batchId_studentId: { batchId, studentId: student.id } },
  });

  if (existing) {
    if (existing.status === "ACTIVE")
      return badRequest("Student is already enrolled");
    if (
      existing.status === "PENDING_ADMIN" ||
      existing.status === "PENDING_INSTRUCTOR"
    ) {
      return badRequest("Student already has a pending invitation");
    }
    if (existing.status === "REJECTED") {
      // Re-invite: reset to pending
      const updated = await prisma.batchStudent.update({
        where: { id: existing.id },
        data: {
          status: "PENDING_ADMIN",
          invitedBy: user.id,
          invitedAt: new Date(),
          enrolledAt: null,
        },
      });
      return ok({ enrollment: updated });
    }
  }

  // Create new enrollment as PENDING_ADMIN (awaiting admin approval)
  const enrollment = await prisma.batchStudent.create({
    data: {
      batchId,
      studentId: student.id,
      status: "PENDING_ADMIN",
      invitedBy: user.id,
    },
  });

  return ok({
    enrollment,
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email,
    },
  });
}
