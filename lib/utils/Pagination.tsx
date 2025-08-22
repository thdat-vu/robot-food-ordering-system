import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pageNumber,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // Helper: sinh danh sách page hiển thị
  const getVisiblePages = (page: number, total: number): number[] => {
    const pages: number[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= page - 1 && i <= page + 1)) {
        pages.push(i);
      }
    }
    return pages;
  };

  const visiblePages = getVisiblePages(pageNumber, totalPages);

  return (
    <div className="flex justify-center items-center gap-2 p-4 border-t bg-gray-50">
      {/* Prev */}
      <button
        onClick={() => onPageChange(pageNumber - 1)}
        disabled={hasPreviousPage === false || pageNumber === 1}
        className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page numbers */}
      {visiblePages.map((page, index) => (
        <React.Fragment key={page}>
          {index > 0 && visiblePages[index - 1] !== page - 1 && (
            <span className="px-2 text-gray-500">...</span>
          )}
          <button
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              pageNumber === page
                ? "bg-blue-500 text-white shadow-md"
                : "bg-white text-gray-700 border hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        </React.Fragment>
      ))}

      {/* Next */}
      <button
        onClick={() => onPageChange(pageNumber + 1)}
        disabled={hasNextPage === false || pageNumber === totalPages}
        className="p-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
