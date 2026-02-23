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

type Params = { params: Promise<{ id: string; reqId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "INSTRUCTOR") return forbidden();

  const { id: batchId, reqId } = await params;

  // Verify instructor belongs to this batch
  const bi = await prisma.batchInstructor.findUnique({
    where: { batchId_instructorId: { batchId, instructorId: user.id } },
  });
  if (!bi) return forbidden();

  const body = await req.json();
  const { action } = body; // "approve" | "reject"

  if (!action || !["approve", "reject"].includes(action)) {
    return badRequest("action must be 'approve' or 'reject'");
  }

  const enrollment = await prisma.batchStudent.findUnique({
    where: { id: reqId },
  });
  if (!enrollment || enrollment.batchId !== batchId)
    return notFound("Enrollment not found");

  // Instructor can only act on PENDING_INSTRUCTOR status
  // (PENDING_ADMIN needs admin to approve first)
  if (enrollment.status !== "PENDING_INSTRUCTOR") {
    return badRequest(
      enrollment.status === "PENDING_ADMIN"
        ? "This request is still waiting for admin approval"
        : `Cannot act on enrollment with status: ${enrollment.status}`,
    );
  }

  const updated = await prisma.batchStudent.update({
    where: { id: reqId },
    data: {
      status: action === "approve" ? "ACTIVE" : "REJECTED",
      enrolledAt: action === "approve" ? new Date() : null,
    },
  });

  return ok({ enrollment: updated });
}
