"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuizTabSelector from "./QuizTabSelector";
import QuizCardsList from "./QuizCardsList";
import QuizCardsSkeletonList from "./QuizCardsSkeletonList";
import Pagination from "./Pagination";
import { Quiz } from "@/data/quizzes";

const PAGE_SIZE = 6;

export default function QuizPageClient({ quizzes }: { quizzes: Quiz[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeTab =
    (params.get("tab") as "all" | "completed" | "upcoming") ?? "all";

  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let data = [...quizzes];

    if (activeTab === "completed") {
      data = data.filter((q) => q.status === "COMPLETED");
    }

    if (activeTab === "upcoming") {
      data = data.filter((q) => q.status === "UPCOMING");
    }

    if (search.trim()) {
      data = data.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (course !== "all") {
      data = data.filter((q) => q.course === course);
    }

    data.sort((a, b) =>
      sort === "newest"
        ? +new Date(b.date) - +new Date(a.date)
        : +new Date(a.date) - +new Date(b.date),
    );

    return data;
  }, [quizzes, activeTab, search, course, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function handleTabChange(tab: "all" | "completed" | "upcoming") {
    startTransition(() => {
      router.push(`?tab=${tab}`);
      setPage(1);
    });
  }

  return (
    <>
      <QuizTabSelector
        activeTab={activeTab}
        onTabChange={handleTabChange}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        course={course}
        onCourseChange={(v) => {
          setCourse(v);
          setPage(1);
        }}
        sort={sort}
        onSortChange={setSort}
      />

      {isPending ? (
        <QuizCardsSkeletonList />
      ) : (
        <>
          <QuizCardsList quizzes={paginated} />
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}
