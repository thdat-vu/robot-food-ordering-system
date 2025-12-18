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

const formatCurrentDateTime = (date: Date): string => {
    const weekdayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const weekday = weekdayNames[date.getDay()] ?? "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${weekday} - ${day}/${month}/${year} - ${hours}:${minutes}`;
};

function WaiterPageContent() {
    const [activeTab, setActiveTab] = useState<OrderStatus>("bắt đầu phục vụ");
    const [searchQuery, setSearchQuery] = useState("");
    const [panel, setPanel] = useState<"control" | "payment">("control");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentDateTime, setCurrentDateTime] = useState<string>(() => formatCurrentDateTime(new Date()));
    
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
                <div className="px-6 py-3 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                            {currentDateTime}
                        </span>
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
                            <div className="w-52 md:w-60 lg:w-64 bg-white border-r border-gray-200 flex flex-col">
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
        <Suspense fallback={<WaiterPageLoading/>}>
            <WaiterPageContent/>
        </Suspense>
    );
}
