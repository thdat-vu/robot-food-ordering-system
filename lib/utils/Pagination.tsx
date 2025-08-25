import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
    pageNumber: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    pageNumber,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    onPageChange,
}) => {
    // Tạo array các trang để hiển thị
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5; // Số trang tối đa hiển thị
        
        if (totalPages <= maxVisiblePages) {
            // Nếu tổng số trang ít, hiển thị tất cả
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logic phức tạp hơn cho nhiều trang
            if (pageNumber <= 3) {
                // Nếu ở đầu
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (pageNumber >= totalPages - 2) {
                // Nếu ở cuối
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // Nếu ở giữa
                pages.push(1, '...', pageNumber - 1, pageNumber, pageNumber + 1, '...', totalPages);
            }
        }
        
        return pages;
    };

    const pageNumbers = getPageNumbers();

    if (totalPages <= 1) {
        return null; // Không hiển thị pagination nếu chỉ có 1 trang
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {/* Thông tin trang - Ẩn trên mobile nhỏ */}
            <div className="hidden sm:block text-sm text-gray-700">
                Trang <span className="font-medium">{pageNumber}</span> trên{' '}
                <span className="font-medium">{totalPages}</span>
            </div>

            {/* Mobile: Chỉ hiển thị Previous/Next */}
            <div className="flex sm:hidden items-center justify-between w-full">
                <button
                    onClick={() => onPageChange(pageNumber - 1)}
                    disabled={!hasPreviousPage}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        !hasPreviousPage
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Trước
                </button>

                <div className="text-sm text-gray-600">
                    {pageNumber}/{totalPages}
                </div>

                <button
                    onClick={() => onPageChange(pageNumber + 1)}
                    disabled={!hasNextPage}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        !hasNextPage
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    Sau
                    <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>

            {/* Tablet & Desktop: Hiển thị full pagination */}
            <div className="hidden sm:flex items-center space-x-1">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(pageNumber - 1)}
                    disabled={!hasPreviousPage}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        !hasPreviousPage
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span className="hidden md:inline">Trước</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                    {pageNumbers.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-3 py-2 text-gray-500"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </span>
                            );
                        }

                        const isCurrentPage = page === pageNumber;
                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[40px] ${
                                    isCurrentPage
                                        ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(pageNumber + 1)}
                    disabled={!hasNextPage}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        !hasNextPage
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    <span className="hidden md:inline">Sau</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            </div>

            {/* Quick Jump - Chỉ hiển thị trên Desktop */}
            {totalPages > 10 && (
                <div className="hidden lg:flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Đi tới:</span>
                    <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={pageNumber}
                        onChange={(e) => {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= totalPages) {
                                onPageChange(page);
                            }
                        }}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            )}
        </div>
    );
};

export default Pagination;  