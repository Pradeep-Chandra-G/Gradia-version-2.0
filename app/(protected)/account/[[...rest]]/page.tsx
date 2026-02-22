"use client";

import { UserProfile, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AccountPage() {
  const { user } = useUser();

  const role =
    user?.publicMetadata?.role === "ADMIN"
      ? "Admin"
      : user?.publicMetadata?.role === "INSTRUCTOR"
        ? "Instructor"
        : "Student";

  const roleColor =
    role === "Admin"
      ? "bg-red-500/15 text-red-400 border-red-500/30"
      : role === "Instructor"
        ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      {/* Top bar */}
      <div className="mx-auto mb-4 flex max-w-3xl items-center justify-between">
        {/* Back */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Role badge */}
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${roleColor}`}
        >
          {role}
        </span>
      </div>

      {/* Clerk profile */}
      <div className="flex justify-center">
        <UserProfile
          appearance={{
            variables: {
              colorPrimary: "#22c55e",
              colorBackground: "transparent",
              colorText: "#ffffff",
              colorInputBackground: "#262626",
              colorInputText: "#ffffff",
              borderRadius: "12px",
            },
            elements: {
              /* Remove Clerk layout */
              navbar: "hidden",
              sidebar: "hidden",
              footer: "hidden",
              card: "shadow-none bg-transparent w-full max-w-3xl",

              /* Headers */
              headerTitle: "text-white text-xl",
              headerSubtitle: "text-gray-400",

              /* Sections */
              profileSectionContent:
                "bg-neutral-900/70 rounded-xl p-6 border border-white/10",

              /* Buttons */
              formButtonPrimary:
                "bg-emerald-500 text-black hover:bg-emerald-400",
              formButtonReset:
                "border border-white/20 text-white hover:bg-white/10",

              /* Inputs */
              formFieldInput:
                "bg-neutral-800 border border-white/10 text-white",

              /* ✅ Email primary badge fix */
              badge:
                "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
            },
          }}
        />
      </div>
    </div>
  );
}
