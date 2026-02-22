import { GraduationCap } from "lucide-react";
import Link from "next/link";
import React from "react";

function HomeNavbar() {
  return (
    <nav className="bg-foreground text-black h-16 rounded-2xl flex flex-row px-2 items-center justify-between">
      {/* BRANDING & LOGO */}
      <div className="flex flex-row items-center gap-2 select-none">
        {/* LOGO */}
        <div className="">
          <GraduationCap size={48} className="bg-black/20 p-0.5 rounded-2xl md:block" />
        </div>
        <h1 className="text-4xl font-black">Gradia</h1>
      </div>

      {/* LOGIN & GET STARTED */}
      <div className="gap-4 flex flex-row items-center tracking-wide">
        {/* LOGIN */}
        <Link
          href={"/auth/sign-in"}
          className="text-lg p-2 font-semibold hover:bg-black/20 active:bg-black/15 rounded-xl"
        >
          Login
        </Link>
        <Link
          href={"/auth/sign-up"}
          className="text-lg p-2 font-semibold bg-amber-300 hover:bg-amber-300/85 hover:drop-shadow-amber-300/80 hover:drop-shadow-md active:bg-amber-300/15 rounded-xl "
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default HomeNavbar;
