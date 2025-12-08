import React, { useState, useCallback, useMemo } from "react";
import {
  Users,
  User,
  UserCheck,
  ChefHat,
  Filter,
  X,
  CheckCircle2,
  Wallet,
  XCircle,
  MessageSquareWarning,
  TrendingUp,
  Clock10Icon,
  Utensils,
  AlarmClock,
} from "lucide-react";

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
import { useModeratorRealtimeTables } from "@/hooks/moderator/useModeratorRealtimeTables";

type FilterStatus =
  | "all"
  | "empty"
  | "ordered"
  | "served"
  | "delivered"
  | "occupied"
  | "paid";

const ModeratorScreen: React.FC = () => {
  // ✅ Sử dụng SignalR hook thay vì useEffect polling
  const { data, isLoading, error, isRealtimeConnected } =
    useModeratorRealtimeTables();

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [idTable, setIdTable] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [highlightedTable, setHighlightedTable] = useState<string>("");
  const [initialTab, setInitialTab] = useState<"home" | "feedback">("home");
  const [isLegendFloating, setIsLegendFloating] = useState(false);

  const { toasts, addToast, removeToast } = useToastModerator();

  // ✅ Hiển thị error từ hook nếu có
  React.useEffect(() => {
    if (error) {
      addToast(error, "error");
    }
  }, [error, addToast]);

  // ✅ Mở dialog theo tab
  const openTableDialog = useCallback(
    (tableId: string, tab: "home" | "feedback" = "home") => {
      setIdTable(tableId);
      setInitialTab(tab);
      setOpenDialog(true);
    },
    []
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setInitialTab("home");
  }, []);

  // ✅ Scroll legend floating
  React.useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateLegendState = () => {
      const y = lastScrollY;
      setIsLegendFloating((prev) => {
        const showFloatingThreshold = 260;
        const backToTopThreshold = 180;

        if (!prev && y > showFloatingThreshold) return true;
        if (prev && y < backToTopThreshold) return false;
        return prev;
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
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Determine table status dựa trên counters
  const getTableStatus = (tableData: TableData): FilterStatus => {
    const {
      totalItems,
      serveredCount,
      deliveredCount,
      tableStatus,
      paymentStatus,
    } = tableData;

    if (tableStatus === 0) return "empty";
    if (tableStatus === 1 && totalItems === 0) return "occupied";

    if (totalItems > 0 && deliveredCount < totalItems) {
      return "ordered";
    }

    if (
      totalItems > 0 &&
      deliveredCount === totalItems &&
      serveredCount < totalItems
    ) {
      return "delivered";
    }

    if (
      totalItems > 0 &&
      serveredCount === totalItems &&
      deliveredCount === totalItems
    ) {
      if (paymentStatus === 2) {
        return "paid";
      }
      return "served";
    }

    return "empty";
  };

  const getTableColor = (tableData: TableData): string => {
    const status = getTableStatus(tableData);
    switch (status) {
      case "empty":
        return "bg-gradient-to-br from-white to-gray-100 shadow-lg shadow-gray-200/50 border-2 border-gray-200";
      case "occupied":
        return "bg-gradient-to-br from-cyan-400 via-teal-400 to-cyan-500 shadow-lg shadow-cyan-500/40 border-2 border-cyan-300";
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
          if (element)
            element.scrollIntoView({ behavior: "smooth", block: "center" });
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
      empty: Object.values(data).filter((t) => getTableStatus(t) === "empty")
        .length,
      ordered: Object.values(data).filter(
        (t) => getTableStatus(t) === "ordered"
      ).length,
      served: Object.values(data).filter((t) => getTableStatus(t) === "served")
        .length,
      delivered: Object.values(data).filter(
        (t) => getTableStatus(t) === "delivered"
      ).length,
      paid: Object.values(data).filter((t) => getTableStatus(t) === "paid")
        .length,
    }),
    [data]
  );

  const activeTables = useMemo(
    () => totalTables - statusCounts.empty,
    [totalTables, statusCounts.empty]
  );

  const totalItemsAllTables = useMemo(
    () => Object.values(data).reduce((sum, t) => sum + (t.totalItems || 0), 0),
    [data]
  );

  const slowItemsCount = useMemo(
    () =>
      Object.values(data).reduce((sum, t) => sum + (t.pendingItems ?? 0), 0),
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
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="relative flex justify-center items-center mb-6">
            <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-lg rounded-full px-8 py-4 border border-white/30">
              <div className="flex items-center space-x-3">
                {/* ✅ Indicator real-time connection */}
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    isRealtimeConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
                <h1 className="text-white text-2xl md:text-3xl font-bold tracking-wide">
                  BẢNG QUẢN LÝ MODERATOR
                </h1>
                <div
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    isRealtimeConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                ></div>
              </div>
            </div>

            <LegendFloating isFloating={isLegendFloating} />
          </div>

          {/* Search */}
          <div className="flex justify-center mb-8 px-4">
            <div className="relative w-full max-w-lg group">
              <div className="relative flex items-center bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-purple-600/30 backdrop-blur-2xl rounded-3xl px-5 sm:px-7 py-3 sm:py-4 transition-all duration-500 group-hover:scale-[1.02]">
                <div className="relative">
                  <ExpandableSearch
                    placeholder="Tìm kiếm bàn, món ăn..."
                    onSearch={(q) => handleSearch(q)}
                  />
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
            </div>
          </div>

          <p className="text-white/90 text-lg font-medium mb-4">
            Theo dõi trạng thái các bàn real-time
            {!isRealtimeConnected && (
              <span className="ml-2 text-red-300 text-sm">
                (Đang kết nối lại...)
              </span>
            )}
          </p>

          <div className="flex justify-center items-center gap-5 mb-7 pr-6">
            <ClockCard />
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

          {/* Filters */}
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

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {processedData.map(([tableId, tableData]) => {
            const isHighlighted = highlightedTable === tableId;
            const textColor = getTextColor(tableData);
            const cardColor = getTableColor(tableData);

            return (
              <div
                key={tableId}
                id={`table-${tableId}`}
                className={`group relative aspect-square rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 hover:rotate-1 ${cardColor}`}
                onClick={() => openTableDialog(tableId, "home")}
              >
                <div
                  className={`text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-center ${textColor}`}
                >
                  {tableData.tableName}
                </div>

                {tableData.totalItems > 0 ? (
                  <div className="w-full text-center relative px-3">
                    <div
                      className={`text-4xl md:text-5xl lg:text-6xl font-black ${textColor}`}
                    >
                      {tableData.totalItems}
                    </div>

                    {tableData.counter > 0 && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/10 rounded-full p-1 hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openTableDialog(tableId, "feedback");
                        }}
                        aria-label="Xem phản hồi"
                      >
                        <div className="relative">
                          <MessageSquareWarning
                            size={18}
                            className="text-orange-500 drop-shadow-[0_0_6px_rgba(255,165,0,0.8)]"
                            strokeWidth={2.5}
                          />
                          <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[8px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center shadow-lg border border-white">
                            {tableData.counter}
                          </span>
                        </div>
                      </button>
                    )}

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

                <div className="pointer-events-none absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {isHighlighted && (
                  <>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 via-cyan-400 to-green-500 text-black text-sm px-4 py-1 rounded-full font-bold shadow-2xl border-2 border-white animate-bounce z-10">
                      🎯 TÌM THẤY 🎯
                    </div>
                    <div className="absolute inset-0 rounded-3xl border-4 border-transparent">
                      <div className="absolute inset-0 rounded-3xl border-4 border-cyan-400 animate-[borderRun_2s_linear_infinite]"></div>
                    </div>
                  </>
                )}
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
