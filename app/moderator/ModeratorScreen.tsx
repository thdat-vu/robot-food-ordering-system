import React, { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Users,
  Clock,
  User,
  CreditCard,
  UserCheck,
  ChefHat,
  Filter,
  Search,
  X,
} from "lucide-react";
import { TableData } from "@/entites/moderator/FeedbackModole";
import { useGetAllFeedbackHome } from "@/hooks/moderator/useFeedbackHooks";
import ModeratorFeedbackFromTable from "@/app/moderator/ModeratorFeedbackFromTable";
import { Truck, DollarSign } from "lucide-react";
import { useToastModerator } from "@/hooks/use-toast-moderator";
import { ToastContainer } from "@/components/moderator/ToastContainer";

type FilterStatus = "all" | "notification" | "paid" | "serving" | "normal";

const ModeratorScreen: React.FC = () => {
  const [data, setData] = useState<Record<string, TableData>>({});
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [tablesWithBell, setTablesWithBell] = useState<Record<string, boolean>>(
    {}
  );
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [idTable, setIdTable] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [highlightedTable, setHighlightedTable] = useState<string>("");
  const { run } = useGetAllFeedbackHome();
  const { toasts, addToast, removeToast } = useToastModerator();

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date());
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await run();

        if (!res || typeof res !== "object") {
          console.warn("Invalid response from API:", res);
          return;
        }

        const newData = res.data;

        if (!newData || typeof newData !== "object") {
          console.warn("Invalid data from API:", newData);
          return;
        }

        setData(newData);

        setTablesWithBell((prev) => {
          const updated = { ...prev };

          Object.keys(newData).forEach((key) => {
            updated[key] = newData[key].counter > 0;
          });

          const validKeys = Object.keys(newData);
          const filteredUpdated = Object.keys(updated).reduce((acc, key) => {
            if (validKeys.includes(key)) {
              acc[key] = updated[key];
            }
            return acc;
          }, {} as Record<string, boolean>);

          return filteredUpdated;
        });
      } catch (error) {
        console.error("Error loading data:", error);
        addToast(
          "Có lỗi xảy ra khi tải dữ liệu bàn. Vui lòng thử lại.",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 500);
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = useCallback(
    (tableId: string) => {
      const tableData = data[tableId];
      if (tableData) {
        setSelectedTable(tableData);
        setOpenDialog(true);
      }
    },
    [data]
  );

  const handleStatusChange = useCallback(
    (tableId: string, allConfirmed: boolean) => {
      setTablesWithBell((prev) => ({
        ...prev,
        [tableId]: !allConfirmed,
      }));
    },
    []
  );

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setSelectedTable(null);
  }, []);

  const handle = (id: string) => {
    setIdTable(id);
    setOpenDialog(true);
  };
  // Handle search functionality
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (query.trim() === "") {
        setHighlightedTable("");
        return;
      }

      // Find matching table
      const matchingTable = Object.entries(data).find(
        ([tableId, tableData]) => {
          const tableNumber = tableData.tableName.replace(/\D/g, ""); // Lấy số trong tên
          return tableNumber === query.trim();
        }
      );

      if (matchingTable) {
        setHighlightedTable(matchingTable[0]);
        // Scroll to the highlighted table after a short delay
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

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTableStatus = (tableData: TableData): FilterStatus => {
    const hasNotification = (tableData.counter || 0) > 0;
    if (hasNotification) return "notification";
    if (tableData.totalItems > 0) {
      if (tableData.paidCount / tableData.totalItems === 1) return "paid";
      return "serving";
    }
    return "normal";
  };

  const filteredData = Object.entries(data).filter(([tableId, tableData]) => {
    if (filterStatus === "all") return true;
    return getTableStatus(tableData) === filterStatus;
  });

  const totalNotifications = Object.values(data).reduce(
    (sum, table) => sum + (table.counter || 0),
    0
  );
  const activeTables = Object.values(data).filter(
    (table) => (table.counter || 0) > 0
  ).length;
  const totalTables = Object.keys(data).length;

  // Statistics for different statuses
  const statusCounts = {
    notification: Object.values(data).filter(
      (table) => (table.counter || 0) > 0
    ).length,
    paid: Object.values(data).filter(
      (table) =>
        table.totalItems > 0 &&
        table.paidCount / table.totalItems === 1 &&
        (table.counter || 0) === 0
    ).length,
    serving: Object.values(data).filter(
      (table) =>
        table.totalItems > 0 &&
        table.paidCount / table.totalItems < 1 &&
        (table.counter || 0) === 0
    ).length,
    normal: Object.values(data).filter(
      (table) => table.totalItems === 0 && (table.counter || 0) === 0
    ).length,
  };

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

            {/* Chú thích trạng thái - đưa sang bên trái */}
            <div className="absolute left-0 top-12 bg-white/90 rounded-xl shadow-md p-3 space-y-1 text-sm">
              <h3 className="font-semibold text-gray-700">Chú thích</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse"></span>
                <span>Có thông báo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-500"></span>
                <span>Đã thanh toán hết</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-pink-500 animate-pulse"></span>
                <span>Đang phục vụ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-200"></span>
                <span>Bình thường</span>
              </div>
            </div>
          </div>
          {/* Search Bar */}
          <div className="flex justify-center mb-6">
          <div className="space-y-4">
          <div className="flex items-center bg-purple-500/30 backdrop-blur-lg rounded-full px-4 py-2 shadow-lg border border-purple-300/30 min-w-96">
            <Search className="w-5 h-5 text-purple-100 mr-3" />
            <input
              type="text"
              placeholder="Tìm kiếm bàn (ví dụ: Bàn 1)..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder-purple-100/70"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="ml-2 text-purple-100/70 hover:text-purple-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
          </div>
          <p className="text-white/90 text-lg font-medium mb-4">
            Theo dõi và xử lý thông báo từ khách hàng
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/30">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-white" />
                <div className="text-left">
                  <div className="text-white font-mono text-lg font-bold">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-white/80 text-xs">
                    {formatDate(currentTime)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/30">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-yellow-300" />
                <div className="text-left">
                  <div className="text-white font-bold text-lg">
                    {totalNotifications}
                  </div>
                  <div className="text-white/80 text-xs">Thông báo</div>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/30">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-300" />
                <div className="text-left">
                  <div className="text-white font-bold text-lg">
                    {activeTables}/{totalTables}
                  </div>
                  <div className="text-white/80 text-xs">Bàn cần xử lý</div>
                </div>
              </div>
            </div>
          </div>
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filterStatus === "all"
                  ? "bg-white text-purple-700 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Filter size={16} />
              Tất cả ({totalTables})
            </button>

            <button
              onClick={() => setFilterStatus("notification")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filterStatus === "notification"
                  ? "bg-yellow-400 text-yellow-900 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Bell size={16} />
              Có thông báo ({statusCounts.notification})
            </button>

            <button
              onClick={() => setFilterStatus("serving")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filterStatus === "serving"
                  ? "bg-red-400 text-red-900 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <ChefHat size={16} />
              Đang phục vụ ({statusCounts.serving})
            </button>

            <button
              onClick={() => setFilterStatus("paid")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filterStatus === "paid"
                  ? "bg-green-400 text-green-900 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <CreditCard size={16} />
              Đã thanh toán ({statusCounts.paid})
            </button>

            <button
              onClick={() => setFilterStatus("normal")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                filterStatus === "normal"
                  ? "bg-gray-300 text-gray-800 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <User size={16} />
              Bình thường ({statusCounts.normal})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {filteredData
            .sort(([, a], [, b]) => {
              const getNumber = (name: string) => {
                const match = name.match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
              };
              return getNumber(a.tableName) - getNumber(b.tableName);
            })
            .map(([tableId, tableData]) => {
              const hasNotification = (tableData.counter || 0) > 0;
              const isHighlighted = highlightedTable === tableId;
              const hasBell = tablesWithBell[tableId] || hasNotification;
              const status = (() => {
                if (hasNotification) return 1;
                if (tableData.totalItems > 0) {
                  if (tableData.paidCount / tableData.totalItems === 1)
                    return 2;
                  return -1;
                }
                return 0;
              })();

              return (
                <div
                  key={tableId}
                  className={`
                                        group relative aspect-square rounded-3xl flex flex-col items-center justify-center 
                                        cursor-pointer transition-all duration-300 transform hover:scale-105 hover:rotate-1 
                                        ${
                                          status === 1
                                            ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30 animate-pulse"
                                            : status === 2
                                            ? "bg-gradient-to-br from-green-400 to-green-500 shadow-lg shadow-green-500/30"
                                            : status === -1
                                            ? "bg-gradient-to-br from-red-400 to-pink-500 shadow-lg shadow-red-500/30 animate-pulse"
                                            : "bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg shadow-gray-300/30"
                                        }
                                    `}
                  onClick={() => handle(tableId)}
                >
                  <div
                    className={`text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-center ${
                      hasNotification ? "text-white" : "text-amber-800"
                    }`}
                  >
                    {tableData.tableName}
                  </div>

                  <div
                    className={`text-3xl md:text-4xl lg:text-5xl font-black ${
                      hasNotification ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {tableData.counter || 0}
                  </div>

                  <div
                    className={`text-sm md:text-lg font-bold text-center ${
                      hasNotification ? "text-white/90" : "text-gray-700"
                    }`}
                  >
                    thông báo
                  </div>

                  {/* Three status indicators arranged vertically */}
                  <div className="absolute bottom-2 left-2 flex justify-evenly flex-wrap gap-y-4 items-center gap-3">
                    {/* Served count - NEW */}
                    <div className="flex items-center gap-1 text-black text-xs font-semibold bg-white/80 rounded px-1">
                      <ChefHat size={12} />
                      <span>
                        {tableData.serveredCount || 0}/
                        {tableData.totalItems || 0}
                      </span>
                    </div>
                    {/* Delivered count */}
                    <div className="flex items-center gap-1 text-black text-xs font-semibold bg-white/80 rounded px-1">
                      <UserCheck size={12} />
                      <span>
                        {tableData.deliveredCount || 0}/
                        {tableData.totalItems || 0}
                      </span>
                    </div>

                    {/* Paid count */}
                    <div className="flex items-center gap-1 text-black text-xs font-semibold bg-white/80 rounded px-1">
                      <CreditCard size={12} />
                      <span>
                        {tableData.paidCount || 0}/{tableData.totalItems || 0}
                      </span>
                    </div>
                  </div>

                  {hasNotification && (
                    <div className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg animate-bounce">
                      {tableData.counter || 0}
                    </div>
                  )}

                  {hasNotification && (
                    <div className="absolute top-2 left-2 text-white font-semibold text-xs bg-red-600 px-2 py-1 rounded-full">
                      Cần xử lý
                    </div>
                  )}
                  {isHighlighted && (
                    <>
                      {/* Target acquired label */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 via-cyan-400 to-green-500 text-black text-sm px-4 py-1 rounded-full font-bold shadow-2xl border-2 border-white animate-bounce">
                        🎯 TÌM THẤY 🎯
                      </div>

                      <div className="absolute inset-0 rounded-3xl border-4 border-transparent">
                        <div className="absolute inset-0 rounded-3xl border-4 border-cyan-400 animate-[borderRun_2s_linear_infinite]"></div>
                      </div>

                      {/* Pulsing energy field */}
                      <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400/20 via-transparent to-green-400/20 rounded-3xl animate-pulse"></div>
                      <div
                        className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-3xl animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      ></div>

                      {/* Corner markers */}
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

                      {/* Scanning lines */}
                      <div className="absolute inset-0 overflow-hidden rounded-3xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                        <div
                          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"
                          style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                          className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-yellow-400 to-transparent animate-pulse"
                          style={{ animationDelay: "0.25s" }}
                        ></div>
                        <div
                          className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-red-400 to-transparent animate-pulse"
                          style={{ animationDelay: "0.75s" }}
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

      <ModeratorFeedbackFromTable
        idTable={idTable}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        tableName={data[idTable]?.tableName}
      />
    </div>
  );
};

export default ModeratorScreen;
