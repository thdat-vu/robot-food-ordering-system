import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ================= TYPES ================= */

type PaginationProps = {
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  currentCount: number;
  onPageChange: (page: number) => void;
};

/* ================= COMPONENT ================= */

export const Pagination: React.FC<PaginationProps> = ({
  pageNumber,
  totalPages,
  totalCount,
  currentCount,
  onPageChange,
}) => {
  const handlePrev = () => {
    if (pageNumber > 1) {
      onPageChange(pageNumber - 1);
    }
  };

  const handleNext = () => {
    if (pageNumber < totalPages) {
      onPageChange(pageNumber + 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Hiển thị {currentCount} / {totalCount} hoạt động
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePrev}
          disabled={pageNumber === 1}
          className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-sm text-gray-700 px-3">
          Trang {pageNumber} / {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={pageNumber === totalPages}
          className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
