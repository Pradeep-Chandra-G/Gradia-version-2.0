"use client";

import { useEffect, useRef, useState } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string;
};

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder = "Select",
  width = "w-full",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${width}`}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          w-full flex items-center justify-between
          bg-neutral-900/70
          border border-white/10
          rounded-lg
          px-3 py-2.5
          text-sm text-white
          hover:bg-white/5
          focus:outline-none
          focus:ring-2 focus:ring-amber-500/40
        "
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <span
          className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute z-50 mt-2 w-full
            rounded-xl
            border border-white/10
            bg-neutral-900/95 backdrop-blur-xl
            shadow-2xl
            overflow-hidden
            animate-in fade-in slide-in-from-top-1
          "
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`
                w-full text-left px-3 py-2 text-sm
                transition-colors
                ${
                  value === opt.value
                    ? "bg-amber-500/15 text-white"
                    : "text-gray-300 hover:bg-white/5"
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
