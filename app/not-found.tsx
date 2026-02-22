import React from "react";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-32">
      <h1 className="font-black text-9xl">404</h1>
      <h1 className="text-white text-5xl font-extrabold tracking-tight">
        This page is either under construction / not available to you.
      </h1>
      <p className="text-xl font-medium text-red-600 tracking-wider">
        Please return to home.
      </p>
    </div>
  );
}

export default NotFoundPage;
