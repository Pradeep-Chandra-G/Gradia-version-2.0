import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  getCurrentUser,
  unauthorized,
  forbidden,
  ok,
  badRequest,
} from "@/lib/api-utils";

// GET /api/student/settings
export async function GET(_req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT") return forbidden();

  const profile = (await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
    },
  })) as Record<string, unknown> | null;

  return ok({
    settings: {
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? null,
      notifyEmail: profile?.notifyEmail ?? true,
      notifyQuizReminder: profile?.notifyQuizReminder ?? true,
    },
  });
}

// PATCH /api/student/settings
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT") return forbidden();

  const body = await req.json();
  const { name, phone, notifyEmail, notifyQuizReminder } = body;

  if (!name || typeof name !== "string" || name.trim().length < 1) {
    return badRequest("Name is required");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name.trim(),
      phone: phone ?? null,
      notifyEmail: notifyEmail ?? true,
      notifyQuizReminder: notifyQuizReminder ?? true,
    },
  });

  return ok({ message: "Settings updated" });
}
