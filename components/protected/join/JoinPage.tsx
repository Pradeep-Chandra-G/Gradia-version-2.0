"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  GraduationCap,
} from "lucide-react";

type JoinResult = {
  type: "batch" | "quiz";
  name: string;
  redirectTo: string;
  message?: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<JoinResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/student/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(
          data.error ??
            "That code doesn't exist or has expired. Double-check with your instructor.",
        );
        return;
      }

      setResult(data);
      setStatus("success");
      // Navigate after brief success flash
      setTimeout(() => router.push(data.redirectTo), 1400);
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleCodeChange = (val: string) => {
    setCode(val.toUpperCase().slice(0, 16));
    if (status !== "idle") {
      setStatus("idle");
      setErrorMsg("");
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <GraduationCap
            size={32}
            className="bg-amber-400 rounded-lg p-1 border border-amber-200"
          />
          <span className="text-xl font-black text-white">Gradia</span>
        </div>

        <div className="bg-neutral-900 border border-white/8 rounded-2xl p-8">
          <h1 className="text-2xl font-black text-white mb-1">
            Join with a code
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Enter the quiz or batch code your instructor shared with you.
          </p>

          {/* Input */}
          <div className="relative mb-4">
            <input
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. JAVA2026"
              disabled={status === "loading" || status === "success"}
              className={`w-full bg-neutral-800 border rounded-xl px-4 py-3.5 text-white text-base font-mono tracking-widest placeholder-gray-600 focus:outline-none transition-colors pr-12
                ${
                  status === "error"
                    ? "border-red-500/60 focus:border-red-500"
                    : status === "success"
                      ? "border-emerald-500/60"
                      : "border-white/10 focus:border-amber-500/50"
                }`}
              autoFocus
              autoCapitalize="characters"
              spellCheck={false}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {status === "loading" && (
                <Loader2 size={18} className="text-gray-400 animate-spin" />
              )}
              {status === "success" && (
                <CheckCircle2 size={18} className="text-emerald-400" />
              )}
              {status === "error" && (
                <XCircle size={18} className="text-red-400" />
              )}
            </div>
          </div>

          {/* Error message */}
          {status === "error" && errorMsg && (
            <p className="text-red-400 text-xs mb-4 flex items-start gap-1.5">
              <XCircle size={13} className="shrink-0 mt-0.5" />
              {errorMsg}
            </p>
          )}

          {/* Success message */}
          {status === "success" && result && (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <CheckCircle2
                size={16}
                className="text-emerald-400 shrink-0 mt-0.5"
              />
              <div>
                <p className="text-emerald-300 text-sm font-semibold">
                  {result.type === "batch" ? "Batch" : "Quiz"} found!
                </p>
                <p className="text-emerald-400/70 text-xs mt-0.5">
                  {result.name}
                </p>
                {result.message && (
                  <p className="text-emerald-400/60 text-xs mt-0.5">
                    {result.message}
                  </p>
                )}
                <p className="text-emerald-400/50 text-xs mt-1">
                  Redirecting you now…
                </p>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={
              !code.trim() || status === "loading" || status === "success"
            }
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm
              bg-amber-400 text-black hover:bg-amber-300
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-150 active:scale-[0.98]"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Checking…
              </>
            ) : (
              <>
                Join <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-center text-gray-600 text-xs mt-5">
            Codes are case-insensitive. Ask your instructor if you don&apos;t
            have one.
          </p>
        </div>
      </div>
    </div>
  );
}
