"use client";

import { useEffect, useRef } from "react";
import Dropdown from "./Dropdown";

const TABS = [
  { label: "All Exams", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Upcoming", value: "upcoming" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

type Props = {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  search: string;
  onSearchChange: (value: string) => void;
  course: string;
  onCourseChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
};

export default function QuizTabSelector({
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  course,
  onCourseChange,
  sort,
  onSortChange,
}: Props) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = tabsRef.current;
    const underline = underlineRef.current;
    if (!container || !underline) return;

    const index = TABS.findIndex((t) => t.value === activeTab);
    const activeBtn = container.children[index] as HTMLElement | undefined;
    if (!activeBtn) return;

    underline.style.width = `${activeBtn.offsetWidth}px`;
    underline.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Tabs */}
      <div className="relative">
        <div
          ref={tabsRef}
          className="flex gap-6 text-sm font-medium overflow-x-auto scrollbar-hide"
        >
          {TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onTabChange(value)}
              className={`pb-2 whitespace-nowrap transition-colors ${
                activeTab === value
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Animated underline */}
        <span
          ref={underlineRef}
          className="absolute bottom-0 h-0.5 bg-indigo-500 rounded-full transition-all duration-300 ease-out"
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search exams..."
          className="
            bg-neutral-900/70
            border border-white/10
            rounded-lg
            px-4 py-2.5
            text-sm text-white
            w-full sm:w-80
            focus:outline-none
            focus:ring-2 focus:ring-amber-500/40
          "
        />

        {/* Course Dropdown */}
        <Dropdown
          value={course}
          onChange={onCourseChange}
          width="w-full sm:w-40"
          options={[
            { label: "Course: All", value: "all" },
            { label: "Java", value: "Java" },
            { label: "DBMS", value: "DBMS" },
            { label: "OS", value: "OS" },
          ]}
        />

        {/* Sort Dropdown */}
        <Dropdown
          value={sort}
          onChange={onSortChange}
          width="w-full sm:w-40"
          options={[
            { label: "Date: Newest", value: "newest" },
            { label: "Date: Oldest", value: "oldest" },
          ]}
        />
      </div>
    </div>
  );
}
