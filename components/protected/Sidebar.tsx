"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { GraduationCap, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";

// ── Role → nav items mapping ──────────────────────────────────────────────
const NAV_ITEMS: Record<string, { label: string; href: string }[]> = {
  Admin: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Organisations", href: "/dashboard/admin/organisations" },
    { label: "Batches", href: "/dashboard/admin/batches" },
    { label: "Quizzes", href: "/dashboard/admin/quizzes" },
    { label: "Results", href: "/dashboard/admin/results" },
    { label: "Analytics", href: "/dashboard/admin/analytics" },
    { label: "Settings", href: "/dashboard/admin/settings" },
  ],
  Instructor: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Batches", href: "/dashboard/instructor/batches" },
    { label: "Quizzes", href: "/dashboard/instructor/quizzes" },
    { label: "Results", href: "/dashboard/instructor/results" },
    { label: "Analytics", href: "/dashboard/instructor/analytics" },
    { label: "Settings", href: "/dashboard/instructor/settings" },
  ],
  Student: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Quizzes", href: "/dashboard/quizzes" },
    { label: "Results", href: "/dashboard/results" },
    { label: "Analytics", href: "/dashboard/analytics" },
    { label: "Settings", href: "/dashboard/settings" },
  ],
};

// ── Skeleton ──────────────────────────────────────────────────────────────
function SidebarSkeleton() {
  return (
    <div className="h-screen sticky top-0 bg-neutral-900 p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-9 w-9 rounded-lg bg-neutral-800 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-24 bg-neutral-800 rounded animate-pulse" />
          <div className="h-3 w-16 bg-neutral-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded-md bg-neutral-800 animate-pulse"
          />
        ))}
      </div>
      <div className="mt-auto p-2">
        <div className="h-14 rounded-lg bg-neutral-800 animate-pulse" />
      </div>
    </div>
  );
}

// ── Sidebar content ───────────────────────────────────────────────────────
function SidebarContent({
  navItems,
  role,
  pathname,
  onLinkClick,
}: {
  navItems: { label: string; href: string }[];
  role: string;
  pathname: string;
  onLinkClick?: () => void;
}) {
  return (
    <>
      {/* Branding */}
      <div className="flex items-center gap-2 mb-6">
        <GraduationCap
          size={36}
          className="bg-amber-400 rounded-lg p-1 border border-amber-200 shrink-0"
        />
        <div>
          <h2 className="text-lg font-bold text-white">Gradia</h2>
          <p className="text-[12px] text-gray-400">{role} Console</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1">
        <div className="flex flex-col gap-1 font-semibold text-lg">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onLinkClick}
                className={
                  "rounded-md px-3 py-2 transition-colors " +
                  (isActive
                    ? "bg-amber-400 text-black"
                    : "text-gray-300 hover:bg-white/10")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto p-2">
          <UserMenu />
        </div>
      </nav>
    </>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────
export default function Sidebar() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isLoaded) return <SidebarSkeleton />;

  const roleKey =
    user?.publicMetadata?.role === "ADMIN"
      ? "Admin"
      : user?.publicMetadata?.role === "INSTRUCTOR"
        ? "Instructor"
        : "Student";

  const navItems = NAV_ITEMS[roleKey] ?? NAV_ITEMS.Student;

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex h-screen sticky top-0 bg-neutral-900 p-4 flex-col">
        <SidebarContent
          navItems={navItems}
          role={roleKey}
          pathname={pathname}
        />
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 rounded-md bg-neutral-900 p-2 text-white"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-neutral-900 p-4 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
            <SidebarContent
              navItems={navItems}
              role={roleKey}
              pathname={pathname}
              onLinkClick={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
