import React, { useEffect } from "react";
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

  const today = new Date().toLocaleDateString("sv-SE");

  /* ✅ Auto set ngày hiện tại khi mở filter */
  useEffect(() => {
    if (isFilterOpen) {
      if (!startDate || !endDate) {
        setStartDate(today);
        setEndDate(today);
      }
    }
  }, [isFilterOpen, startDate, endDate, setStartDate, setEndDate, today]);

  const handleSearch = async () => {
    await onSearch(startDate || null, endDate || null);
  };

  const handleReset = async () => {
    resetDates();
    await onSearch(today, today);
  };

  const handleQuickFilter = async (days: number) => {
    setQuickDateRange(days);
    const end = new Date();
    const start = new Date();
    if (days !== 0) start.setDate(end.getDate() - days);

    const startDateStr = start.toISOString().split("T")[0];
    const endDateStr = end.toISOString().split("T")[0];

    await onSearch(startDateStr, endDateStr);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Lọc theo ngày</h3>
        </div>
        <button
          onClick={toggleFilter}
          disabled={isLoading}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors duration-200"
        >
          <CalendarDays className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button
            onClick={onClearError}
            className="hover:bg-red-100 rounded-lg p-1 transition"
          >
            <XCircle className="w-5 h-5 text-red-600" />
          </button>
        </div>
      )}

      {/* QUICK FILTER BUTTONS */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleQuickFilter(0)}
          className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
        >
          Hôm nay
        </button>
        <button
          onClick={() => handleQuickFilter(7)}
          className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors duration-200"
        >
          7 ngày
        </button>
        <button
          onClick={() => handleQuickFilter(30)}
          className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
        >
          30 ngày
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
        >
          Tất cả
        </button>
      </div>

      {/* DATE RANGE PICKER */}
      {isFilterOpen && (
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={startDate || ""}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              disabled={isLoading}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <input
              type="date"
              value={endDate || ""}
              onChange={(e) => setEndDate(e.target.value)}
              max={today}
              disabled={isLoading}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-70 transition-all duration-200 shadow-sm"
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
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
            >
              Đặt lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
