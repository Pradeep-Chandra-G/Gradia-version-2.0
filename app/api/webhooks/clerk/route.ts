import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/app/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * Clerk Webhook Handler
 * This syncs Clerk users with your Prisma database
 *
 * Setup:
 * 1. Go to Clerk Dashboard > Webhooks
 * 2. Add endpoint: https://yourdomain.com/api/webhooks/clerk
 * 3. Subscribe to: user.created, user.updated, user.deleted
 * 4. Copy the signing secret and add to .env as CLERK_WEBHOOK_SECRET
 */

export async function POST(req: Request) {
  // Get webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env",
    );
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create new Svix instance with secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, public_metadata } =
      evt.data;

    const email =
      email_addresses.find((e) => e.id === evt.data.primary_email_address_id)
        ?.email_address || email_addresses[0]?.email_address;

    if (!email) {
      return new Response("Error: No email found", { status: 400 });
    }

    // 1️⃣ Determine role (default STUDENT)
    let role: Role = "STUDENT";

    if (public_metadata?.role) {
      const metadataRole = public_metadata.role as string;
      if (["ADMIN", "INSTRUCTOR", "STUDENT"].includes(metadataRole)) {
        role = metadataRole as Role;
      }
    }

    // 2️⃣ WRITE ROLE BACK INTO CLERK (only if not already set)
    if (!public_metadata?.role) {
      const client = await clerkClient();

      await client.users.updateUser(id, {
        publicMetadata: {
          role,
        },
      });
    }

    // 3️⃣ Save user in Prisma
    await prisma.user.create({
      data: {
        id,
        email,
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        role,
      },
    });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, public_metadata } =
      evt.data;

    const email =
      email_addresses.find((e) => e.id === evt.data.primary_email_address_id)
        ?.email_address || email_addresses[0]?.email_address;

    if (!email) {
      return new Response("Error: No email found", { status: 400 });
    }

    // Determine role from public_metadata
    let role: Role = "STUDENT";
    if (public_metadata?.role) {
      const metadataRole = public_metadata.role as string;
      if (["ADMIN", "INSTRUCTOR", "STUDENT"].includes(metadataRole)) {
        role = metadataRole as Role;
      }
    }

    try {
      // Update user in database
      await prisma.user.update({
        where: { id: id },
        data: {
          email,
          firstName: first_name ?? "",
          lastName: last_name ?? "",
          role,
        },
      });

      console.log(`✅ User updated: ${email} with role: ${role}`);
    } catch (error) {
      console.error("Error updating user in database:", error);
      return new Response("Error: Failed to update user", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      // Delete user from database (or mark as deleted)
      await prisma.user.delete({
        where: { id: id as string },
      });

      console.log(`✅ User deleted: ${id}`);
    } catch (error) {
      console.error("Error deleting user from database:", error);
      // Don't fail if user doesn't exist
    }
  }

  return new Response("Webhook processed successfully", { status: 200 });
}
