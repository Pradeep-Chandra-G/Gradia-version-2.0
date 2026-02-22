"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Settings, LogOut } from "lucide-react";

export default function UserMenu() {
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const role =
    user?.publicMetadata?.role === "ADMIN"
      ? "Admin"
      : user?.publicMetadata?.role === "INSTRUCTOR"
        ? "Instructor"
        : "Student";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!isLoaded) {
    return <div className="h-14 rounded-lg bg-neutral-800 animate-pulse" />;
  }

  return (
    <div ref={ref} className="relative w-full">
      {/* ✨ Slash Shimmer Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === "Enter" && setOpen((v) => !v)}
        className="
          relative overflow-hidden
          flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer
          transition
          hover:bg-white/5
          focus:outline-none focus:ring-2 focus:ring-gray-400/40

          before:absolute
          before:top-0 before:left-[-40%]
          before:h-full before:w-[20%]
          before:skew-x-[-20deg]
          before:bg-linear-to-r
          before:from-transparent
          before:via-white/20
          before:to-transparent
          before:transition-all
          before:duration-700
          hover:before:left-[120%]
        "
      >
        {/* Avatar */}
        <div className="relative z-10 h-9 w-9 overflow-hidden rounded-full border border-white/10 shrink-0">
          <Image
            src={user?.imageUrl ?? "/avatar.png"}
            alt="Avatar"
            width={36}
            height={36}
            className="object-cover"
          />
        </div>

        {/* Name + Role */}
        <div className="relative z-10 flex flex-col leading-tight min-w-0">
          <span className="text-sm font-semibold text-white truncate">
            {user?.fullName ?? "User"}
          </span>
          <span className="text-xs font-medium text-gray-400/80 truncate">
            {role}
          </span>
        </div>
      </div>

      {/* Popup */}
      {open && (
        <div className="absolute bottom-14 left-0 w-64 rounded-xl border border-white/10 bg-neutral-900 shadow-xl z-50">
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm font-semibold text-white truncate">
              {user?.fullName ?? "User"}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>

          <div className="p-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-white/10"
            >
              <Settings className="h-4 w-4" />
              Manage account
            </Link>

            <SignOutButton>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      )}
    </div>
  );
}
