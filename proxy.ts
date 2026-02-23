import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ── Route matchers ────────────────────────────────────────────────────────
const isPublicRoute = createRouteMatcher([
  "/",
  "/auth/sign-in(.*)",
  "/auth/sign-up(.*)",
  "/api/webhooks(.*)", // Clerk webhook must be public
]);

const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);

const isInstructorRoute = createRouteMatcher(["/dashboard/instructor(.*)"]);

// Protected routes (everything not public)
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/quiz_attempt(.*)",
  "/account(.*)",
  "/join(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Let public routes through with no checks
  if (isPublicRoute(req)) return NextResponse.next();

  // 2. For all protected routes, enforce authentication
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      // Not signed in → redirect to sign-in
      const signInUrl = new URL("/auth/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Clerk exposes publicMetadata under sessionClaims.metadata in JWT
    // Make sure your Clerk JWT template includes `metadata` with `user.public_metadata`
    const metadata = sessionClaims?.metadata as
      | Record<string, unknown>
      | undefined;
    const role = metadata?.role as string | undefined;

    // 3. Admin-only routes
    if (isAdminRoute(req) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 4. Instructor-only routes
    if (isInstructorRoute(req) && role !== "INSTRUCTOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
