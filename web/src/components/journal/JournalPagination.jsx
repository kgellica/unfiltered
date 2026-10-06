import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function JournalPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalEntries,
  onGoToPage,
}) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalEntries);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-soft)] flex-wrap gap-3">
      <span className="text-[12px] font-medium text-[var(--ink-soft)]">
        showing {startItem}-{endItem} of {totalEntries} entries
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onGoToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl transition disabled:opacity-30 hover:bg-black/5 cursor-pointer disabled:cursor-not-allowed"
          style={{ color: 'var(--ink)' }}
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            const isActive = currentPage === pageNum;

            return (
              <button
                key={pageNum}
                onClick={() => onGoToPage(pageNum)}
                className={`w-8 h-8 rounded-xl text-[13px] font-bold transition cursor-pointer ${
                  isActive ? 'text-white' : 'hover:bg-black/5'
                }`}
                style={{
                  background: isActive ? 'var(--accent)' : 'transparent',
                  color: isActive ? 'white' : 'var(--ink)',
                }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onGoToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl transition disabled:opacity-30 hover:bg-black/5 cursor-pointer disabled:cursor-not-allowed"
          style={{ color: 'var(--ink)' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}