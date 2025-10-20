// components/DateRangeFilter.tsx
import React from "react";
import { useDateFilterUI } from "@/hooks/moderator/useDateFilterUI";
import {
  Filter,
  CalendarDays,
  AlertCircle,
  XCircle,
  RefreshCw,
  Search,
} from "lucide-react";

interface DateRangeFilterProps {
  onSearch: (startDate: string | null, endDate: string | null) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onSearch,
  isLoading,
  error,
  onClearError,
}) => {
  const {
    isFilterOpen,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    toggleFilter,
    resetDates,
    setQuickDateRange,
  } = useDateFilterUI();

  const handleSearch = async () => {
    await onSearch(startDate || null, endDate || null);
  };

  const handleReset = async () => {
    resetDates();
    await onSearch(null, null);
  };

  const handleQuickFilter = async (days: number) => {
    setQuickDateRange(days);

    if (days === 0) {
      const today = new Date().toISOString().split("T")[0];
      await onSearch(today, today);
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);
      await onSearch(
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Lọc Theo Ngày</h3>
        </div>
        <button
          onClick={toggleFilter}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <CalendarDays className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <span className="text-red-700 text-sm flex-1">{error}</span>
          <button
            onClick={onClearError}
            className="text-red-500 hover:text-red-700"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <button
          onClick={() => handleQuickFilter(0)}
          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Hôm nay
        </button>
        <button
          onClick={() => handleQuickFilter(7)}
          className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          7 ngày
        </button>
        <button
          onClick={() => handleQuickFilter(30)}
          className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          30 ngày
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Tất cả
        </button>
      </div>

      {/* Custom date range */}
      {isFilterOpen && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày
              </label>
              <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]} // ✅ đặt max ngoài, không để trong onChange
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  disabled={isLoading}
                />

            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày
              </label>
              <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]} // ✅ không cho chọn quá hôm nay
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  disabled={isLoading}
                />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>{isLoading ? "Đang tìm..." : "Tìm kiếm"}</span>
            </button>
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Đặt lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
