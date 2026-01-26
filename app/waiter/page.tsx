"use client";
import React, {useState, Suspense, useEffect, useMemo} from "react";
import {OrderStatus} from "@/types/kitchen";
import {NavigationTabs} from "@/components/waiter/NavigationTabs";
import {useWaiterOrders} from "@/hooks/use-waiter-orders";
import {useModeratorRealtimeTables} from "@/hooks/moderator/useModeratorRealtimeTables";
import DishList from "./DishList";
import ServePanel from "./ServePanel";
import PaymentPanel from "./PaymentPanel";
import {toast} from "sonner";
import {PanelLeftClose, PanelLeftOpen} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import UserMenu from "@/components/common/UserMenu";
import AuthGuard from "@/components/common/AuthGuard";
import { TablePositionsProvider } from "@/contexts/TablePositionsContext";

// NEW: Returns object with separate date and time for better header display
interface FormattedDateTime {
  weekday: string;
  date: string;
  time: string;
  full: string;
}

const formatCurrentDateTime = (date: Date): FormattedDateTime => {
  const weekdayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  const weekday = weekdayNames[date.getDay()] ?? "";
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  
  return {
    weekday,
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}:${seconds}`,
    full: `${weekday} - ${day}/${month}/${year} - ${hours}:${minutes}`,
  };
};

function WaiterPageContent() {
    const [activeTab, setActiveTab] = useState<OrderStatus>("bắt đầu phục vụ");
    const [searchQuery, setSearchQuery] = useState("");
    const [panel, setPanel] = useState<"control" | "payment">("control");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    // Initialize with empty values to avoid SSR hydration mismatch, then update on client
    const [currentDateTime, setCurrentDateTime] = useState<FormattedDateTime>({
        weekday: '',
        date: '',
        time: '',
        full: '',
    });
    
    // ============================================================================
    // ROBOT DELIVERY MODE STATE
    // ============================================================================
    // When enabled, limits selection to 3 dishes max (robot has 3 trays)
    // ============================================================================
    const [useRobotDelivery, setUseRobotDelivery] = useState(false);
    const ROBOT_TRAY_LIMIT = 3;

    // Invalid table selection dialog
    const [invalidTable, setInvalidTable] = useState<number | null>(null);

    const {
        dishes,
        groupedDishes,
        categories,
        hasSelected,
        isLoading,
        error,
        toggleDish,
        handleServe,
        handleRequestRemake,
        refreshOrders,
        getTabCount,
        getDishesByStatus,
    } = useWaiterOrders();

    // Realtime table updates (complain/status) via SignalR
    const { data: realtimeTables } = useModeratorRealtimeTables();
    const [tableLastUpdateTimes, setTableLastUpdateTimes] = useState<Record<number, string | null>>({});

    // Extract table number from tableName (e.g., "Bàn 4" -> 4)
    const extractTableNumber = (tableName: string): number | null => {
        const match = tableName.match(/Bàn\s*(\d+)/i);
        return match ? parseInt(match[1], 10) : null;
    };

    // Map realtime table data -> last update times
    useEffect(() => {
        if (!realtimeTables || typeof realtimeTables !== "object") return;
        const timesMap: Record<number, string | null> = {};
        Object.values(realtimeTables).forEach((table: any) => {
            if (table?.tableName && table?.lastOrderUpdatedTime !== undefined) {
                const tableNumber = extractTableNumber(table.tableName);
                if (tableNumber !== null) {
                    timesMap[tableNumber] = table.lastOrderUpdatedTime;
                }
            }
        });
        setTableLastUpdateTimes(timesMap);
    }, [realtimeTables]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const IPAD_AIR_WIDTH = 1180;
        if (window.innerWidth <= IPAD_AIR_WIDTH) {
            setIsSidebarOpen(false);
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDateTime(formatCurrentDateTime(new Date()));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleTabChange = (newTab: OrderStatus) => {
        if (newTab !== activeTab) {
            dishes.forEach(dish => {
                if (dish.selected) {
                    toggleDish(dish.id);
                }
            });
            // Reset robot delivery mode when switching tabs
            setUseRobotDelivery(false);
            // toast.info("Đã xóa tất cả các món đã chọn.");
        }
        setActiveTab(newTab);
    };

    // ============================================================================
    // ROBOT DELIVERY MODE HANDLERS
    // ============================================================================
    // Note: Main robot mode logic is now handled in DishList component
    // This handler is kept for compatibility with ServePanel if needed
    const handleToggleRobotMode = (enabled: boolean) => {
        setUseRobotDelivery(enabled);
    };

    // Enhanced toggle dish with robot limit check
    const handleDishToggle = (dishId: string) => {
        const dish = dishes.find(d => d.id === dishId);
        if (!dish) return;

        // If check robot: allow table 1-> 5 only
        if (useRobotDelivery) {
            const allowedTables = new Set([1, 2, 3, 4, 5]);
            if (!dish.selected && !allowedTables.has(dish.tableNumber)) {
                setInvalidTable(dish.tableNumber);
                return;
            }
        }

        // If selecting (not deselecting) and robot mode is ON
        if (!dish.selected && useRobotDelivery && activeTab === "bắt đầu phục vụ") {
            const currentSelectedCount = dishes.filter(d => 
                d.selected && d.status === activeTab
            ).length;
            
            if (currentSelectedCount >= ROBOT_TRAY_LIMIT) {
                toast.error(
                    `🤖 Chế độ robot chỉ cho phép chọn tối đa ${ROBOT_TRAY_LIMIT} món/lượt. ` +
                    `Vui lòng bỏ chọn món khác hoặc tắt chế độ robot.`,
                    { duration: 4000 }
                );
                return;
            }
        }

        toggleDish(dishId);
    };

    // ============================================================================
    // TABLE SELECTION FROM MAP
    // ============================================================================
    // When clicking on a table in the map, toggle all dishes for that table(s)
    const handleTableSelect = (tableNumbers: number[]) => {
        // Get all dishes for the specified tables in the current tab
        const dishesForTables = dishes.filter(
            (dish) => tableNumbers.includes(dish.tableNumber) && dish.status === activeTab
        );

        if (dishesForTables.length === 0) {
            toast.info("Bàn này không có món nào trong tab hiện tại");
            return;
        }

        // Check if ALL dishes for these tables are already selected
        const allSelected = dishesForTables.every((dish) => dish.selected);

        // Robot mode check
        if (useRobotDelivery && !allSelected) {
            const allowedTables = new Set([1, 2, 3, 4, 5]);
            const invalidTables = tableNumbers.filter(t => !allowedTables.has(t));
            if (invalidTables.length > 0) {
                setInvalidTable(invalidTables[0]);
                return;
            }

            // Check robot tray limit
            const currentSelectedCount = dishes.filter(d => d.selected && d.status === activeTab).length;
            const newDishesCount = dishesForTables.filter(d => !d.selected).length;
            
            if (currentSelectedCount + newDishesCount > ROBOT_TRAY_LIMIT) {
                toast.error(
                    `🤖 Chế độ robot chỉ cho phép chọn tối đa ${ROBOT_TRAY_LIMIT} món/lượt. ` +
                    `Đang chọn ${currentSelectedCount} món, muốn thêm ${newDishesCount} món.`,
                    { duration: 4000 }
                );
                return;
            }
        }

        // Toggle: if all selected -> deselect all, else select all unselected
        if (allSelected) {
            // Deselect all dishes for these tables
            dishesForTables.forEach((dish) => {
                if (dish.selected) {
                    toggleDish(dish.id);
                }
            });
            toast.info(`Đã bỏ chọn ${dishesForTables.length} món của bàn ${tableNumbers.join(", ")}`);
        } else {
            // Select all unselected dishes for these tables
            const unselectedDishes = dishesForTables.filter((dish) => !dish.selected);
            unselectedDishes.forEach((dish) => {
                toggleDish(dish.id);
            });
            toast.success(`Đã chọn ${unselectedDishes.length} món của bàn ${tableNumbers.join(", ")}`);
        }
    };

    const handlePaymentComplete = () => {
        refreshOrders();
        setPanel("control");
    };

    // Handler to clear all selections
    const handleClearAllSelections = () => {
        const selectedDishes = dishes.filter(d => d.selected);
        if (selectedDishes.length === 0) {
            toast.info("Không có món nào được chọn");
            return;
        }
        
        selectedDishes.forEach(dish => {
            toggleDish(dish.id);
        });
        
        toast.success(`Đã xóa ${selectedDishes.length} món đã chọn`);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <div className="flex items-center justify-center w-full">
                    <div className="text-gray-500">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-gray-50 overflow-hidden">
                <div className="flex items-center justify-center w-full">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">Lỗi: {error}</div>
                        <button
                            onClick={() => refreshOrders(false)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthGuard allowRoles={["Waiter"]}>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <div className="fixed top-4 right-4 z-50">
                <UserMenu />
            </div>
            {/*{isSidebarOpen && (*/}
            {/*    <div className="flex flex-col gap-4 items-center mr-4 p-4">*/}
            {/*        <button*/}
            {/*            className={`px-4 py-2 rounded-lg font-medium transition-colors ${*/}
            {/*                panel === "control"*/}
            {/*                    ? "bg-blue-500 text-white"*/}
            {/*                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"*/}
            {/*            }`}*/}
            {/*            onClick={() => setPanel("control")}*/}
            {/*        >*/}
            {/*            Điều khiển*/}
            {/*        </button>*/}
            {/*        <button*/}
            {/*            className={`px-4 py-2 rounded-lg font-medium transition-colors ${*/}
            {/*                panel === "payment"*/}
            {/*                    ? "bg-blue-500 text-white"*/}
            {/*                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"*/}
            {/*            }`}*/}
            {/*            onClick={() => setPanel("payment")}*/}
            {/*        >*/}
            {/*            Thanh toán*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*)}*/}

            <div className="flex-1 flex flex-col">
                {/* Enhanced Header with datetime and search bar */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                    <div className="flex items-center justify-between">
                        {/* LEFT side: DateTime and Search */}
                        <div className="flex items-center gap-4">
                            {/* DateTime display */}
                            <div className="flex items-center gap-3">
                                {/* Date section */}
                                <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ngày</span>
                                        <span className="text-sm font-bold text-gray-800">
                                            {currentDateTime.weekday && currentDateTime.date 
                                                ? `${currentDateTime.weekday}, ${currentDateTime.date}` 
                                                : '...'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Time section */}
                                <div className="flex items-center gap-2.5 px-3.5 py-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-sm">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Giờ</span>
                                        <span className="text-sm font-bold text-gray-800 tabular-nums tracking-wide">
                                            {currentDateTime.time || '...'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Divider */}
                                <div className="h-8 w-px bg-gray-300"></div>
                                
                                {/* General Search Bar - Search for dishes/tables */}
                                <div className="relative">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow w-[200px]">
                                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Tìm món ăn hoặc bàn..."
                                            className="flex-1 outline-none text-xs text-gray-700 placeholder-gray-400 bg-transparent min-w-0"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* RIGHT side: User greeting (if needed) */}
                        <div className="flex items-center gap-4">
                            {/* User greeting can be added here if needed */}
                        </div>
                    </div>
                </div>
                {panel === "control" ? (
                    <>
                        <div className="flex items-center justify-between pr-4">
                            {/*<div className="pl-2 py-2">*/}
                            {/*    <Button*/}
                            {/*        variant="outline"*/}
                            {/*        size="sm"*/}
                            {/*        onClick={() => setIsSidebarOpen((v) => !v)}*/}
                            {/*        className="gap-2"*/}
                            {/*        aria-label="Toggle left panel"*/}
                            {/*    >*/}
                            {/*        {isSidebarOpen ? (*/}
                            {/*            <>*/}
                            {/*                <PanelLeftClose className="w-4 h-4"/>*/}
                            {/*                Ẩn thanh bên trái*/}
                            {/*            </>*/}
                            {/*        ) : (*/}
                            {/*            <>*/}
                            {/*                <PanelLeftOpen className="w-4 h-4"/>*/}
                            {/*                Hiện thanh bên trái*/}
                            {/*            </>*/}
                            {/*        )}*/}
                            {/*    </Button>*/}
                            {/*</div>*/}
                            <div className="flex-1">
                                <NavigationTabs
                                    activeTab={activeTab}
                                    onTabChange={handleTabChange}
                                    getTabCount={getTabCount}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    selectedCount={dishes.filter(d => d.selected).length}
                                />
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            <div className="w-64 md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col">
                                <div className="flex-1 overflow-y-auto">
                                    <DishList
                                        activeTab={activeTab}
                                        searchQuery={searchQuery}
                                        onDishToggle={handleDishToggle}
                                        dishes={dishes}
                                        getDishesByStatus={getDishesByStatus}
                                        onRequestRemake={handleRequestRemake}
                                        useRobotDelivery={useRobotDelivery}
                                        robotTrayLimit={ROBOT_TRAY_LIMIT}
                                        onToggleRobotMode={setUseRobotDelivery}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <ServePanel
                                    activeTab={activeTab}
                                    onServe={handleServe}
                                    onRequestRemake={handleRequestRemake}
                                    hasSelected={hasSelected}
                                    dishes={dishes}
                                    getDishesByStatus={getDishesByStatus}
                                    useRobotDelivery={useRobotDelivery}
                                    robotTrayLimit={ROBOT_TRAY_LIMIT}
                                    onToggleRobotMode={handleToggleRobotMode}
                                    tableLastUpdateTimes={tableLastUpdateTimes}
                                    onTableSelect={handleTableSelect}
                                    onClearAllSelections={handleClearAllSelections}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <PaymentPanel onPaymentComplete={handlePaymentComplete}/>
                )}
            </div>
        </div>
        <AlertDialog open={invalidTable !== null} onOpenChange={(open) => !open && setInvalidTable(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Không được chọn bàn này</AlertDialogTitle>
                    <AlertDialogDescription>
                        Không được chọn bàn khác ngoài 1,2,3,4,5. 
                        {invalidTable ? ` (Bàn ${invalidTable})` : ""}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setInvalidTable(null)}>
                        Đã hiểu
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </AuthGuard>
    );
}

// Loading component for Suspense fallback
function WaiterPageLoading() {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <div className="flex items-center justify-center w-full">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        </div>
    );
}

export default function WaiterPage() {
    return (
        <TablePositionsProvider>
            <Suspense fallback={<WaiterPageLoading/>}>
                <WaiterPageContent/>
            </Suspense>
        </TablePositionsProvider>
    );
}
