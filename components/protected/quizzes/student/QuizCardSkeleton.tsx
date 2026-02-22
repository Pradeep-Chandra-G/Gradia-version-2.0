export default function QuizCardSkeleton() {
  return (
    <div className="rounded-2xl p-5 bg-neutral-900/60 border border-white/5 animate-pulse">
      <div className="h-4 w-20 bg-white/10 rounded mb-4" />
      <div className="h-5 w-3/4 bg-white/10 rounded mb-2" />
      <div className="h-3 w-1/2 bg-white/10 rounded mb-6" />

      <div className="flex gap-4 mb-6">
        <div className="h-3 w-20 bg-white/10 rounded" />
        <div className="h-3 w-16 bg-white/10 rounded" />
      </div>

      <div className="h-9 bg-white/10 rounded-lg mt-auto" />
    </div>
  );
}
