"use client";
import { useUser } from "@clerk/nextjs";
import { User } from "lucide-react";
import Image from "next/image";
import React from "react";

function UserProfile() {
  const user = useUser().user;
  const user_avatar = user?.imageUrl;
  return (
    <div className="flex flex-row items-center gap-2 justify-between h-10 select-none">
      {/* User info */}
      <div className="flex flex-col gap-0.5 items-left justify-start">
        <h1 className="text-md font-semibold">{user?.fullName}</h1>
        <span className="text-xs text-neutral-400">{user?.id}</span>
      </div>

      {/* User avatar */}
      <div className="h-10 w-10 ">
        {user_avatar != null ? (
          <Image
            src={user_avatar}
            alt="User Avatar"
            width={96}
            height={96}
            className="rounded-full border border-neutral-400"
          />
        ) : (
          <User
            size={32}
            className="rounded-full p-0.5 border border-neutral-400"
          />
        )}
      </div>
    </div>
  );
}

export default UserProfile;
