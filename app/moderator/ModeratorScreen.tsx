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
  Search,
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
  | "feedback"
  | "empty"
  | "ordered"
  | "served"
  | "delivered"
  | "occupied"
  | "paid";

const ModeratorScreen: React.FC = () => {
  const { data, isLoading, error, isRealtimeConnected } =
    useModeratorRealtimeTables();

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [onlyFeedback, setOnlyFeedback] = useState(false);

  const [idTable, setIdTable] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [highlightedTable, setHighlightedTable] = useState<string>("");
  const [initialTab, setInitialTab] = useState<"home" | "feedback">("home");

  const { toasts, addToast, removeToast } = useToastModerator();

  React.useEffect(() => {
    if (error) addToast(error, "error");
  }, [error, addToast]);

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

    if (totalItems > 0 && deliveredCount < totalItems) return "ordered";

    if (
      totalItems > 0 &&
      deliveredCount === totalItems &&
      serveredCount < totalItems
    )
      return "delivered";

    if (
      totalItems > 0 &&
      serveredCount === totalItems &&
      deliveredCount === totalItems
    ) {
      if (paymentStatus === 2) return "paid";
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

  const getComplainCount = (t: any) =>
    t.complainCount ?? t.complains?.length ?? 0;
  const processedData = useMemo(
    () =>
      Object.entries(data)
        .filter(([, tableData]) => {
          const status = getTableStatus(tableData);
          const hasFeedback = (tableData.counter ?? 0) > 0;

          if (filterStatus === "all") return true;

          // ✅ feedback: chỉ lấy bàn đang hoạt động (không phải empty) + có counter
          if (filterStatus === "feedback") {
            return status !== "empty" && hasFeedback;
          }

          return status === filterStatus;
        })
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
      feedback: Object.values(data).filter((t) => {
        const status = getTableStatus(t);
        return status !== "empty" && (t.counter ?? 0) > 0;
      }).length,

      empty: Object.values(data).filter((t) => getTableStatus(t) === "empty")
        .length,
      ordered: Object.values(data).filter(
        (t) => getTableStatus(t) === "ordered"
      ).length,
      delivered: Object.values(data).filter(
        (t) => getTableStatus(t) === "delivered"
      ).length,
      served: Object.values(data).filter((t) => getTableStatus(t) === "served")
        .length,
      paid: Object.values(data).filter((t) => getTableStatus(t) === "paid")
        .length,
    }),
    [data]
  );

  const feedbackCounts = useMemo(() => {
    const tables = Object.values(data);

    const total = tables.reduce((sum, t) => sum + (t.counter ?? 0), 0);
    const tablesHas = tables.filter((t) => (t.counter ?? 0) > 0).length;

    return { total, tablesHas };
  }, [data]);

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
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-purple-500 mx-auto" />
              <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-purple-300 animate-pulse mx-auto" />
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

  const FilterBtn = ({
    active,
    onClick,
    left,
    right,
    className,
  }: {
    active: boolean;
    onClick: () => void;
    left: React.ReactNode;
    right: React.ReactNode;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={[
        "w-full rounded-2xl px-4 py-3 transition-all duration-200 flex items-center justify-between",
        active
          ? "bg-white text-purple-700 shadow-lg"
          : "bg-white/15 text-white hover:bg-white/25",
        className ?? "",
      ].join(" ")}
    >
      <span className="flex items-center gap-3 text-lg font-semibold">
        {left}
      </span>
      <span className="font-extrabold tabular-nums text-xl">{right}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700">
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      {/* ================= GLOBAL HEADER ================= */}
      <div className="relative z-30 mb-6">
        <div className="flex justify-center">
          <div className="w-full max-w-[720px] flex flex-col items-center">
            {/* TITLE */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-3 bg-white/18 backdrop-blur-lg rounded-full px-6 py-3 border border-white/25">
                <span
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    isRealtimeConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                <h1 className="text-white text-xl md:text-2xl font-bold tracking-wide">
                  BẢNG QUẢN LÝ MODERATOR
                </h1>
                <span
                  className={`w-3 h-3 rounded-full animate-pulse ${
                    isRealtimeConnected ? "bg-green-400" : "bg-red-400"
                  }`}
                />
              </div>
            </div>

            {/* SEARCH */}
            <div className="w-full">
              <div className="flex items-center bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-purple-600/30 backdrop-blur-2xl rounded-3xl px-5 py-3">
                <ExpandableSearch
                  placeholder="Tìm kiếm bàn, món ăn..."
                  onSearch={(q) => handleSearch(q)}
                />

                <input
                  type="text"
                  placeholder="Tìm kiếm bàn của bạn..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-purple-100/70 text-sm font-medium ml-2"
                />

                {searchQuery ? (
                  <button
                    onClick={clearSearch}
                    className="ml-2 p-2 rounded-full bg-white/15 hover:bg-white/25 transition"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                ) : (
                  <div className="ml-2 p-2 rounded-full bg-white/10">
                    <Search className="w-4 h-4 text-white/80" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FULL WIDTH, KHÔNG tạo khoảng trống hai bên */}
      <div className="mx-auto w-full max-w-[1800px] px-4 py-4">
        {/* ✅ 3-COLUMN LAYOUT (LEFT / CENTER / RIGHT) */}
        <div className="grid grid-cols-1 2xl:grid-cols-[260px,minmax(0,1fr),300px] gap-6">
          {/* ================= LEFT FILTER ================= */}
          <aside className="hidden 2xl:block relative z-50 pointer-events-auto">
            <div className="sticky top-1/2 -translate-y-1/2 z-50">
              {/* không bọc khung to: chỉ một panel nhỏ gọn */}
              <div className="rounded-3xl bg-white/12 backdrop-blur-xl border border-white/20 p-3 shadow-2xl">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Filter className="w-4 h-4 text-white" />
                  <div className="text-white font-bold text-xs">Bộ lọc</div>
                </div>

                <div className="flex flex-col gap-2">
                  <FilterBtn
                    active={filterStatus === "feedback"}
                    onClick={() => setFilterStatus("feedback")}
                    left={
                      <>
                        <MessageSquareWarning size={18} className="shrink-0" />{" "}
                        Phản hồi
                      </>
                    }
                    right={statusCounts.feedback}
                    className={
                      statusCounts.feedback > 0 && filterStatus !== "feedback"
                        ? "!bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 !text-white ring-4 ring-orange-300 ring-offset-2 ring-offset-purple-600 animate-pulse shadow-[0_0_20px_rgba(251,146,60,0.6)]"
                        : ""
                    }
                  />

                  <FilterBtn
                    active={filterStatus === "all"}
                    onClick={() => setFilterStatus("all")}
                    left={
                      <>
                        <Filter size={18} className="shrink-0" /> Tất cả
                      </>
                    }
                    right={totalTables}
                    className=""
                  />

                  <FilterBtn
                    active={filterStatus === "empty"}
                    onClick={() => setFilterStatus("empty")}
                    left={
                      <>
                        <User size={18} className="shrink-0" /> Bàn trống
                      </>
                    }
                    right={statusCounts.empty}
                    className=""
                  />

                  <FilterBtn
                    active={filterStatus === "ordered"}
                    onClick={() => setFilterStatus("ordered")}
                    left={
                      <>
                        <TrendingUp size={18} className="shrink-0" /> Đã order
                      </>
                    }
                    right={statusCounts.ordered}
                    className=""
                  />

                  <FilterBtn
                    active={filterStatus === "delivered"}
                    onClick={() => setFilterStatus("delivered")}
                    left={
                      <>
                        <UserCheck size={18} className="shrink-0" /> Đã giao
                      </>
                    }
                    right={statusCounts.delivered}
                    className=""
                  />

                  <FilterBtn
                    active={filterStatus === "served"}
                    onClick={() => setFilterStatus("served")}
                    left={
                      <>
                        <ChefHat size={18} className="shrink-0" /> Đã phục vụ
                      </>
                    }
                    right={statusCounts.served}
                    className=""
                  />

                  <FilterBtn
                    active={filterStatus === "paid"}
                    onClick={() => setFilterStatus("paid")}
                    left={
                      <>
                        <CheckCircle2 size={18} className="shrink-0" /> Đã thanh
                        toán
                      </>
                    }
                    right={statusCounts.paid}
                    className=""
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* ================= CENTER ================= */}
          <main className="min-w-0 flex flex-col justify-center min-h-[calc(100vh-200px)]">
            {/* HEADER (nén lại để fit) */}
            <div className="hidden 2xl:block pt-1">
              {/* ép nó “đứng yên” ở đầu, không chơi floating theo scroll */}
              <LegendFloating isFloating={true} />
            </div>
            {/* GRID bàn - giữ format, chỉ “nén” nhẹ ở 2xl */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 2xl:gap-3">
              {processedData.map(([tableId, tableData]) => {
                const isHighlighted = highlightedTable === tableId;
                const textColor = getTextColor(tableData);
                const cardColor = getTableColor(tableData);
                const totalItems = tableData.totalItems || 0;
                const isEmpty = totalItems === 0;

                return (
                  <div
                    key={tableId}
                    id={`table-${tableId}`}
                    className={[
                      "group relative aspect-square rounded-3xl 2xl:rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-[1.03] hover:rotate-1",
                      cardColor,
                    ].join(" ")}
                    onClick={() => openTableDialog(tableId, "home")}
                  >
                    <div
                      className={[
                        "font-bold mb-2 text-center",
                        "text-xl md:text-2xl lg:text-3xl 2xl:text-2xl",
                        textColor,
                      ].join(" ")}
                    >
                      {tableData.tableName}
                    </div>

                    {tableData.totalItems > 0 ? (
                      <div className="w-full text-center relative px-3">
                        <div
                          className={[
                            "font-black",
                            "text-4xl md:text-5xl lg:text-6xl 2xl:text-5xl",
                            textColor,
                          ].join(" ")}
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
                              <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[12px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center shadow-lg border border-white">
                                {tableData.counter}
                              </span>
                            </div>
                          </button>
                        )}

                        <div
                          className={[
                            "font-bold text-center",
                            "text-sm md:text-base 2xl:text-sm",
                            textColor,
                          ].join(" ")}
                        >
                          Món ăn
                        </div>
                      </div>
                    ) : null}

                    {tableData.tableStatus !== 0 && (
                      <div
                        className={[
                          "flex items-center gap-1 backdrop-blur-sm text-gray-800 font-bold rounded shadow-sm flex-shrink-0",
                          isEmpty
                            ? "text-base px-2.5 py-1.5"
                            : "text-xs px-1.5 py-0.5",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 font-bold rounded shadow-sm",
                            isEmpty
                              ? "text-base px-2.5 py-1.5"
                              : "text-xs px-1.5 py-0.5",
                          ].join(" ")}
                        >
                          <ChefHat
                            size={isEmpty ? 18 : 12}
                            className="flex-shrink-0"
                          />
                          <span className={isEmpty ? "leading-none" : ""}>
                            {tableData.deliveredCount || 0}/{totalItems}
                          </span>
                        </div>

                        <div
                          className={[
                            "flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 font-bold rounded shadow-sm",
                            isEmpty
                              ? "text-base px-2.5 py-1.5"
                              : "text-xs px-1.5 py-0.5",
                          ].join(" ")}
                        >
                          <UserCheck
                            size={isEmpty ? 18 : 12}
                            className="flex-shrink-0"
                          />
                          <span className={isEmpty ? "leading-none" : ""}>
                            {tableData.serveredCount || 0}/{totalItems}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 font-bold rounded shadow-sm px-1.5 py-0.5 flex-shrink-0">
                          {(() => {
                            switch (tableData.paymentStatus) {
                              case 1:
                                return (
                                  <>
                                    <Wallet
                                      className={
                                        isEmpty ? "w-5 h-5" : "w-4 h-4"
                                      }
                                    />
                                    <Clock10Icon
                                      className={
                                        isEmpty ? "w-5 h-5" : "w-4 h-4"
                                      }
                                    />
                                  </>
                                );
                              case 2:
                                return (
                                  <>
                                    <Wallet
                                      className={
                                        isEmpty ? "w-5 h-5" : "w-4 h-4"
                                      }
                                    />
                                    <CheckCircle2
                                      className={
                                        isEmpty ? "w-5 h-5" : "w-4 h-4"
                                      }
                                    />
                                  </>
                                );
                              case 3:
                              case 4:
                                return (
                                  <>
                                    <Wallet
                                      className={
                                        isEmpty ? "w-5 h-5" : "w-4 h-4"
                                      }
                                    />
                                    <XCircle
                                      className={
                                        isEmpty ? "w-5 h-5" : "w-4 h-4"
                                      }
                                    />
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

                    <div className="pointer-events-none absolute inset-0 bg-white/10 rounded-3xl 2xl:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {isHighlighted && (
                      <>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 via-cyan-400 to-green-500 text-black text-sm px-4 py-1 rounded-full font-bold shadow-2xl border-2 border-white animate-bounce z-10">
                          🎯 TÌM THẤY 🎯
                        </div>
                        <div className="absolute inset-0 rounded-3xl 2xl:rounded-2xl border-4 border-transparent">
                          <div className="absolute inset-0 rounded-3xl 2xl:rounded-2xl border-4 border-cyan-400 animate-[borderRun_2s_linear_infinite]" />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </main>

          {/* ================= RIGHT STATS ================= */}
          <aside className="hidden 2xl:block">
            <div className="sticky top-1/2 -translate-y-1/2">
              {/* không khung dư, chỉ panel gọn */}
              <div className="rounded-3xl bg-white/12 backdrop-blur-xl border border-white/20 p-3 shadow-2xl">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Users className="w-4 h-4 text-white" />
                  <div className="text-white font-bold text-xs">Thống kê</div>
                </div>

                <div className="flex flex-col gap-3 scale-[0.95] origin-top">
                  <div className="bg-white/10 rounded-2xl p-2 border border-white/15">
                    <ClockCard />
                  </div>

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
            </div>
          </aside>
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
