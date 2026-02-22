import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { Role } from "../generated/prisma/client";

/**
 * Utility function to ensure Clerk user exists in database
 * Call this in your protected pages to sync user on first visit
 *
 * Usage:
 * ```tsx
 * import { ensureUserInDatabase } from "@/lib/sync-user";
 *
 * async function MyPage() {
 *   const user = await ensureUserInDatabase();
 *   // user is now guaranteed to be in database
 * }
 * ```
 */
export async function ensureUserInDatabase() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("No authenticated user found");
  }

  const email =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("User has no email address");
  }

  const role = (clerkUser.publicMetadata?.role as Role) ?? "STUDENT";

  const dbUser = await prisma.user.upsert({
    where: { id: clerkUser.id },
    update: {
      email,
      firstName: clerkUser.firstName ?? "",
      lastName: clerkUser.lastName ?? "",
      role,
    },
    create: {
      id: clerkUser.id,
      email,
      firstName: clerkUser.firstName ?? "",
      lastName: clerkUser.lastName ?? "",
      role,
    },
  });

  return dbUser;
}

/**
 * Get current user from database with all relations
 * This combines Clerk auth check with database query
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: clerkUser.id },
    include: {
      // Student batches
      batchStudents: {
        include: {
          batch: true,
        },
      },

      // Instructor batches
      batchInstructors: {
        include: {
          batch: true,
        },
      },

      // Quizzes created by this user
      quizzesCreated: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      },

      // Attempts by the user
      attempts: {
        orderBy: {
          startedAt: "desc",
        },
        take: 10,
      },
    },
  });
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(role: Role | Role[]) {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
}

/**
 * Require user to have specific role (throws error if not)
 */
export async function requireRole(role: Role | Role[]) {
  const allowed = await hasRole(role);

  if (!allowed) {
    throw new Error(
      `Unauthorized: This action requires ${Array.isArray(role) ? role.join(" or ") : role} role`,
    );
  }
}
