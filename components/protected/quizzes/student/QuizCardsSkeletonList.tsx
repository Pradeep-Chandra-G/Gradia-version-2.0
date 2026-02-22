import QuizCardSkeleton from "./QuizCardSkeleton";

export default function QuizCardsSkeletonList() {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <QuizCardSkeleton key={i} />
      ))}
    </div>
  );
}
