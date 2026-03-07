import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";

async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  return user ? { ...user, clerkId: userId } : null;
}

// GET /api/instructor/settings
export async function GET() {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const org = user.orgId
    ? await prisma.organisation.findUnique({ where: { id: user.orgId } })
    : null;

  return NextResponse.json({
    profile: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      organisation: org?.name ?? null,
      orgId: user.orgId ?? null,
    },
  });
}

// PATCH /api/instructor/settings
export async function PATCH(req: Request) {
  const user = await getDbUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: {
    firstName?: string;
    lastName?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Partial<{ firstName: string; lastName: string }> = {};
  if (body.firstName?.trim()) updates.firstName = body.firstName.trim();
  if (body.lastName?.trim()) updates.lastName = body.lastName.trim();

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  // Update DB
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: updates,
  });

  // Sync to Clerk
  try {
    const clerk = await clerkClient();
    await clerk.users.updateUser(user.clerkId, {
      firstName: updated.firstName,
      lastName: updated.lastName,
    });
  } catch (e) {
    console.error("Clerk sync failed:", e);
    // Non-fatal — DB is the source of truth
  }

  return NextResponse.json({
    profile: {
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
    },
  });
}
