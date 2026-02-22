import React from "react";

function QuizAttemptPageLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-black h-screen w-full font-sans">{children}</div>;
}

export default QuizAttemptPageLayout;
