type Props = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-end items-center gap-2 mt-10">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1 rounded-md bg-neutral-800 disabled:opacity-40 hover:cursor-pointer "
      >
        ←
      </button>

      {Array.from({ length: totalPages }).map((_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1 rounded-md text-sm ${
              p === page
                ? "bg-amber-400 text-black"
                : "bg-neutral-800 text-gray-300 cursor-pointer"
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1 rounded-md bg-neutral-800 disabled:opacity-40 cursor-pointer"
      >
        →
      </button>
    </div>
  );
}
