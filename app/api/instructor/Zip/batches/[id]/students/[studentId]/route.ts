import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  getCurrentUser,
  unauthorized,
  forbidden,
  notFound,
  ok,
} from "@/lib/api-utils";

type Params = { params: Promise<{ id: string; studentId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { id: batchId, studentId } = await params;

  // Verify instructor belongs to this batch
  const bi = await prisma.batchInstructor.findUnique({
    where: { batchId_instructorId: { batchId, instructorId: user.id } },
  });
  if (!bi) return forbidden();

  const enrollment = await prisma.batchStudent.findUnique({
    where: { batchId_studentId: { batchId, studentId } },
  });
  if (!enrollment) return notFound("Student is not in this batch");

  await prisma.batchStudent.delete({
    where: { batchId_studentId: { batchId, studentId } },
  });

  return ok({ success: true });
}
