import { ClerkProvider } from "@clerk/nextjs";
import React from "react";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <div className="min-h-screen h-full">{children}</div>
    </ClerkProvider>
  );
}

export default ProtectedLayout;
