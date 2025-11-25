import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Users,
  Clock,
  User,
  UserCheck,
  ChefHat,
  Filter,
  Search,
  X,
  Package,
  CheckCircle2,
  Wallet,
  XCircle,
  MessageSquareWarning,
  TrendingUp,
  Clock10Icon,
  AlertTriangle,
  Utensils,
  AlarmClock,
} from "lucide-react";

import { useGetAllFeedbackHome } from "@/hooks/moderator/useFeedbackHooks";
import { useToastModerator } from "@/hooks/use-toast-moderator";
import { ToastContainer } from "@/components/moderator/ToastContainer";
import { DialogModeratorMainPage } from "@/app/moderator/DialogModeratorMainPage";
import { TableData } from "@/entites/moderator/FeedbackModole";
import { LegendFloating } from "./LegendFloating";
import LateDishWarning from "@/components/moderator/LateDishWarning";
import LastUpdateBadge from "@/components/moderator/LastUpdateBadge";
import ExpandableSearch from "@/components/moderator/ExpandableSearch";
import { ClockCard } from "@/components/moderator/ClockCard";
import { StatsCard } from "@/components/moderator/StatsCard";
type FilterStatus =
  | "all"
  | "empty"
  | "ordered"
  | "served"
  | "delivered"
  | "occupied"
  | "paid";

/**
 * ⏰ ClockCard: tách ra component riêng + React.memo
 * -> chỉ component này re-render mỗi 1s, không kéo cả ModeratorScreen re-render.
 */

const ModeratorScreen: React.FC = () => {
  const [data, setData] = useState<Record<string, TableData>>({});
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [idTable, setIdTable] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [highlightedTable, setHighlightedTable] = useState<string>("");
  const [initialTab, setInitialTab] = useState<"home" | "feedback">("home");

  const [isLegendFloating, setIsLegendFloating] = useState(false);

  const { run } = useGetAllFeedbackHome();
  const { toasts, addToast, removeToast } = useToastModerator();

  /**
   * 🔄 Poll API mỗi 3 giây
   * - Chỉ khởi tạo interval 1 lần khi mount
   * - Không phụ thuộc vào các state khác => không bị chạy lại theo render
   */
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const res = await run();

        if (!res || typeof res !== "object") {
          console.warn("Invalid response from API:", res);
          return;
        }

        const newData = (res as any).data;

        if (!newData || typeof newData !== "object") {
          console.warn("Invalid data from API:", newData);
          return;
        }

        if (!isMounted) return;

        setData((prev) => {
          const same = JSON.stringify(prev) === JSON.stringify(newData);
          return same ? prev : (newData as Record<string, TableData>);
        });
      } catch (error) {
        console.error("Error loading data:", error);
        if (isMounted) {
          addToast(
            "Có lỗi xảy ra khi tải dữ liệu bàn. Vui lòng thử lại.",
            "error"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // gọi lần đầu khi mount
    loadData();
    // sau đó poll mỗi 3s
    const intervalId = setInterval(loadData, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setInitialTab("home"); // reset tab về home khi đóng dialog
  }, []);

  const handleOpenDialog = useCallback((id: string) => {
    setIdTable(id);
    setInitialTab("home");
    setOpenDialog(true);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateLegendState = () => {
      const y = lastScrollY;

      setIsLegendFloating((prev) => {
        // dùng 2 ngưỡng để tránh flicker
        const showFloatingThreshold = 260; // xuống dưới header kha khá
        const backToTopThreshold = 180; // kéo lên lại trên cao hơn

        if (!prev && y > showFloatingThreshold) return true; // chuyển sang floating
        if (prev && y < backToTopThreshold) return false; // quay về dạng top
        return prev; // giữ nguyên, không setState thừa
      });

      ticking = false;
    };

    const handleScroll = () => {
      lastScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(updateLegendState);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // set trạng thái ban đầu
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Determine table status dựa trên counters
  const getTableStatus = (tableData: TableData): FilterStatus => {
    const {
      totalItems,
      serveredCount,
      deliveredCount,
      paidCount,
      tableStatus,
    } = tableData;

    if (tableStatus === 0) {
      return "empty";
    }

    // Bàn có khách nhưng chưa gọi món
    if (tableStatus === 1 && totalItems === 0) {
      return "occupied";
    }

    // Đã thanh toán hết
    if (totalItems > 0 && paidCount === totalItems) {
      return "paid";
    }

    // Đã phục vụ và giao hết, chưa thanh toán
    if (
      totalItems > 0 &&
      serveredCount === totalItems &&
      deliveredCount === totalItems &&
      paidCount === 0
    ) {
      return "served";
    }

    // Đã giao hết (chưa thanh toán)
    if (totalItems > 0 && deliveredCount === totalItems && paidCount === 0) {
      return "delivered";
    }

    // Đã order, đang xử lý
    if (totalItems > 0) {
      return "ordered";
    }

    return "empty";
  };

  const getTableColor = (tableData: TableData): string => {
    const status = getTableStatus(tableData);

    switch (status) {
      case "empty":
        return "bg-gradient-to-br from-white to-gray-100 shadow-lg shadow-gray-200/50 border-2 border-gray-200";
      case "occupied":
        return "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-600 shadow-lg shadow-gray-600/40 border-2 border-gray-400";
      case "ordered":
        return "bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-500/40 animate-pulse border-2 border-blue-300";
      case "delivered":
        return "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/40 animate-pulse border-2 border-orange-300";
      case "served":
        return "bg-gradient-to-br from-purple-400 to-purple-500 shadow-lg shadow-purple-500/40 border-2 border-purple-300";
      case "paid":
        return "bg-gradient-to-br from-green-400 to-green-500 shadow-lg shadow-green-500/40 border-2 border-green-300";
      default:
        return "bg-gradient-to-br from-white to-gray-100 shadow-lg shadow-gray-200/50 border-2 border-gray-200";
    }
  };

  const getTextColor = (tableData: TableData): string => {
    const status = getTableStatus(tableData);
    return status === "empty" ? "text-gray-800" : "text-white";
  };

  // 🔍 Search theo số bàn
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim() === "") {
        setHighlightedTable("");
        return;
      }

      const matchingTable = Object.entries(data).find(([, tableData]) => {
        const tableNumber = tableData.tableName.replace(/\D/g, "");
        return tableNumber === query.trim();
      });

      if (matchingTable) {
        setHighlightedTable(matchingTable[0]);
        setTimeout(() => {
          const element = document.getElementById(`table-${matchingTable[0]}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      } else {
        setHighlightedTable("");
      }
    },
    [data]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setHighlightedTable("");
  }, []);

  // ✅ MEMO HOÁ: danh sách sau filter + sort
  const processedData = useMemo(
    () =>
      Object.entries(data)
        .filter(([, tableData]) =>
          filterStatus === "all"
            ? true
            : getTableStatus(tableData) === filterStatus
        )
        .sort(([, a], [, b]) => {
          const getNumber = (name: string) => {
            const match = name.match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
          };
          return getNumber(a.tableName) - getNumber(b.tableName);
        }),
    [data, filterStatus]
  );

  const totalTables = useMemo(() => Object.keys(data).length, [data]);

  const statusCounts = useMemo(
    () => ({
      empty: Object.values(data).filter(
        (table) => getTableStatus(table) === "empty"
      ).length,
      ordered: Object.values(data).filter(
        (table) => getTableStatus(table) === "ordered"
      ).length,
      served: Object.values(data).filter(
        (table) => getTableStatus(table) === "served"
      ).length,
      delivered: Object.values(data).filter(
        (table) => getTableStatus(table) === "delivered"
      ).length,
      paid: Object.values(data).filter(
        (table) => getTableStatus(table) === "paid"
      ).length,
    }),
    [data]
  );

  const activeTables = useMemo(
    () => totalTables - statusCounts.empty,
    [totalTables, statusCounts.empty]
  );

  // Format "Lần cập nhật món gần nhất"
  const parseLastOrderTime = (raw?: string | null): Date | null => {
    if (!raw) return null;

    // Nếu backend sau này trả ISO (2025-11-20T16:13:47) thì vẫn hỗ trợ
    if (raw.includes("T")) {
      const isoDate = new Date(raw);
      return isNaN(isoDate.getTime()) ? null : isoDate;
    }

    // Format hiện tại: "20/11/2025 16:13:47"
    const [datePart, timePart] = raw.split(" ");
    if (!datePart || !timePart) return null;

    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    const d = new Date(
      year,
      (month || 1) - 1,
      day || 1,
      hour || 0,
      minute || 0,
      second || 0
    );
    return isNaN(d.getTime()) ? null : d;
  };

  const getLastOrderTimeLabel = (table: TableData): string => {
    const date = parseLastOrderTime(table.lastOrderUpdatedTime);
    if (!date) return "—";

    // Hiển thị HH:mm:ss
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format pill "⏱ Chờ món: X' (Y món)"

  const totalItemsAllTables = useMemo(
    () =>
      Object.values(data).reduce(
        (sum, table) => sum + (table.totalItems || 0),
        0
      ),
    [data]
  );
  const slowItemsCount = useMemo(
    () =>
      Object.values(data).reduce(
        (sum, TableData) => sum + (TableData.pendingItems ?? 0),
        0
      ),
    [data]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg p-12 rounded-3xl shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-purple-500 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-purple-300 animate-pulse mx-auto"></div>
            </div>
            <h3 className="text-purple-800 text-2xl font-bold mb-2">
              Đang tải dữ liệu...
            </h3>
            <p className="text-gray-600 text-lg">Vui lòng đợi trong giây lát</p>
            <div className="mt-6 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (totalTables === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg p-12 rounded-3xl shadow-2xl border border-white/20 text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-purple-800 text-2xl font-bold mb-2">
            Chưa có dữ liệu bàn
          </h3>
          <p className="text-gray-600 text-lg">
            Hệ thống sẽ tự động cập nhật khi có thông tin mới
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 p-4">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="relative flex justify-center items-center mb-6">
            {/* Tiêu đề Moderator */}
            <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-lg rounded-full px-8 py-4 border border-white/30">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h1 className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  BẢNG QUẢN LÝ MODERATOR
                </h1>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            <LegendFloating isFloating={isLegendFloating} />
          </div>

          {/* Search Bar */}
          <div className="flex justify-center mb-8 px-4">
            <div className="relative w-full max-w-lg group">
              <div className="relative flex items-center bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-purple-600/30 backdrop-blur-2xl rounded-3xl px-5 sm:px-7 py-3 sm:py-4 transition-all duration-500 group-hover:scale-[1.02]">
                <div className="relative">
                  <ExpandableSearch
                    placeholder="Tìm kiếm bàn, món ăn..."
                    onSearch={(query) => {
                      console.log("Tìm kiếm:", query);
                      // Gọi hàm lọc dữ liệu của bạn ở đây
                      handleSearch(query);
                    }}
                  />
                  <div className="absolute inset-0 bg-purple-400 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>

                <input
                  type="text"
                  placeholder="✨ Tìm kiếm bàn của bạn..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:border-none text-white placeholder-purple-100/70 text-sm sm:text-base font-medium min-w-0 tracking-wide"
                />

                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="ml-2 sm:ml-3 p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-purple-500/40 to-pink-500/40 hover:from-purple-500/60 hover:to-pink-500/60 text-white transition-all duration-300 flex-shrink-0 hover:scale-110 hover:rotate-90"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20 rounded-3xl blur-2xl -z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>

              <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            </div>
          </div>

          <p className="text-white/90 text-lg font-medium mb-4">
            Theo dõi trạng thái các bàn real-time
          </p>

          {/* Thanh stats + đồng hồ – đẩy sát về bên phải vừa đủ */}
          <div className="flex justify-center  items-center gap-5 mb-7 pr-6">
            {/* Đồng hồ */}
            <ClockCard />

            {/* 3 stats nhỏ gọn */}
            <div className="flex items-center gap-4">
              <StatsCard
                icon={<Users className="w-5 h-5 text-emerald-300" />}
                value={`${activeTables}/${totalTables}`}
                label="Bàn hoạt động"
              />
              <StatsCard
                icon={<Utensils className="w-5 h-5 text-yellow-300" />}
                value={totalItemsAllTables}
                label="Món đã order"
              />
              <StatsCard
                icon={<AlarmClock className="w-5 h-5 text-red-300" />}
                value={slowItemsCount}
                label="Món chậm"
                highlight={slowItemsCount > 0}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filterStatus === "all"
                  ? "bg-white text-purple-700 shadow-lg transform scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Filter size={16} />
              Tất cả ({totalTables})
            </button>

            <button
              onClick={() => setFilterStatus("empty")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filterStatus === "empty"
                  ? "bg-gray-300 text-gray-800 shadow-lg transform scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <User size={16} />
              Bàn trống ({statusCounts.empty})
            </button>

            <button
              onClick={() => setFilterStatus("ordered")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filterStatus === "ordered"
                  ? "bg-blue-400 text-blue-900 shadow-lg transform scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <TrendingUp size={16} />
              Đã order ({statusCounts.ordered})
            </button>

            <button
              onClick={() => setFilterStatus("served")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filterStatus === "served"
                  ? "bg-orange-400 text-orange-900 shadow-lg transform scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <ChefHat size={16} />
              Đã phục vụ ({statusCounts.delivered})
            </button>

            <button
              onClick={() => setFilterStatus("delivered")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filterStatus === "delivered"
                  ? "bg-purple-400 text-purple-900 shadow-lg transform scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <UserCheck size={16} />
              Đã giao ({statusCounts.served})
            </button>

            <button
              onClick={() => setFilterStatus("paid")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filterStatus === "paid"
                  ? "bg-green-400 text-green-900 shadow-lg transform scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <CheckCircle2 size={16} />
              Đã thanh toán ({statusCounts.paid})
            </button>
          </div>
        </div>

        {/* Table Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {processedData.map(([tableId, tableData]) => {
            const isHighlighted = highlightedTable === tableId;
            const textColor = getTextColor(tableData);
            const cardColor = getTableColor(tableData);

            return (
              <div
                key={tableId}
                id={`table-${tableId}`}
                className={` basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 
                  group relative aspect-square rounded-3xl flex flex-col items-center justify-center 
                  cursor-pointer transition-all duration-300 transform hover:scale-105 hover:rotate-1
                  ${cardColor}`}
                onClick={() => handleOpenDialog(tableId)}
              >
                {tableData.counter > 0 && (
                  <div
                    className="absolute top-2 right-2 z-[100] cursor-pointer hover:scale-110 transition-transform bg-white/10 rounded-full p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInitialTab("feedback");
                      setIdTable(tableId);
                      setOpenDialog(true);
                    }}
                  >
                    <div className="relative">
                      <MessageSquareWarning
                        size={22}
                        className="text-orange-500 drop-shadow-[0_0_6px_rgba(255,165,0,0.8)]"
                        strokeWidth={2.5}
                      />
                      <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[8px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center shadow-lg border border-white">
                        {tableData.counter}
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className={`text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-center ${textColor}`}
                >
                  {tableData.tableName}
                </div>

                {tableData.totalItems > 0 ? (
                  <div className="text-center">
                    <div
                      className={`text-4xl md:text-5xl lg:text-6xl font-black ${textColor}`}
                    >
                      {tableData.totalItems}
                    </div>
                    <div
                      className={`text-sm md:text-base font-bold text-center ${textColor}`}
                    >
                      Món ăn
                    </div>
                  </div>
                ) : null}
                {tableData.tableStatus !== 0 && (
                  <div className="flex items-center gap-1 backdrop-blur-sm text-gray-800 text-xs font-bold rounded px-1.5 py-0.5 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold rounded px-1.5 py-0.5 shadow-sm">
                      <ChefHat size={12} className="flex-shrink-0" />
                      <span>
                        {tableData.deliveredCount || 0}/
                        {tableData.totalItems || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold rounded px-1.5 py-0.5 shadow-sm">
                      <UserCheck size={12} className="flex-shrink-0" />
                      <span>
                        {tableData.serveredCount || 0}/
                        {tableData.totalItems || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-bold rounded px-1.5 py-0.5 shadow-sm flex-shrink-0">
                      {(() => {
                        switch (tableData.paymentStatus) {
                          case 1:
                            return (
                              <>
                                <Wallet className="w-4 h-4" />
                                <Clock10Icon className="w-4 h-4" />
                              </>
                            );
                          case 2:
                            return (
                              <>
                                <Wallet className="w-4 h-4" />
                                <CheckCircle2 className="w-4 h-4" />
                              </>
                            );
                          case 3:
                          case 4:
                            return (
                              <>
                                <Wallet className="w-4 h-4" />
                                <XCircle className="w-4 h-4" />
                              </>
                            );
                          default:
                            return null;
                        }
                      })()}
                    </div>
                  </div>
                )}
                <LateDishWarning table={tableData} />
                <LastUpdateBadge
                  lastUpdateTime={tableData.lastOrderUpdatedTime}
                />

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {isHighlighted && (
                  <>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 via-cyan-400 to-green-500 text-black text-sm px-4 py-1 rounded-full font-bold shadow-2xl border-2 border-white animate-bounce z-10">
                      🎯 TÌM THẤY 🎯
                    </div>

                    <div className="absolute inset-0 rounded-3xl border-4 border-transparent">
                      <div className="absolute inset-0 rounded-3xl border-4 border-cyan-400 animate-[borderRun_2s_linear_infinite]"></div>
                    </div>

                    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 via-transparent to-green-400/20 rounded-3xl animate-pulse"></div>

                    <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400 animate-pulse"></div>
                    <div
                      className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-green-400 animate-pulse"
                      style={{ animationDelay: "0.25s" }}
                    ></div>
                    <div
                      className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-yellow-400 animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div
                      className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-red-400 animate-pulse"
                      style={{ animationDelay: "0.75s" }}
                    ></div>

                    <div className="absolute inset-0 overflow-hidden rounded-3xl">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                      <div
                        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                    </div>
                  </>
                )}

                <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>
      </div>

      <DialogModeratorMainPage
        open={openDialog}
        onClose={handleCloseDialog}
        idTable={idTable}
        tableSessionId={data?.[idTable]?.sessionId}
        tableName={data?.[idTable]?.tableName ?? "Bàn"}
        initialTab={initialTab}
      />
    </div>
  );
};

export default ModeratorScreen;
