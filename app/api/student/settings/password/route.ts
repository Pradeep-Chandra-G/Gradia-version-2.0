import { NextRequest } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  getCurrentUser,
  unauthorized,
  forbidden,
  badRequest,
  ok,
} from "@/lib/api-utils";
import bcrypt from "bcryptjs";

// POST /api/student/settings/password
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  if (user.role !== "STUDENT") return forbidden();

  const body = await req.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return badRequest("Both current and new password are required");
  }
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return badRequest("New password must be at least 8 characters");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!dbUser?.passwordHash) {
    return badRequest("Password change not supported for your account");
  }

  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return badRequest("Current password is incorrect");
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return ok({ message: "Password changed successfully" });
}
