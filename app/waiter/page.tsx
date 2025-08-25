"use client";
import React, {useState, Suspense, useEffect} from "react";
import {OrderStatus} from "@/types/kitchen";
import {NavigationTabs} from "@/components/waiter/NavigationTabs";
import {useWaiterOrders} from "@/hooks/use-waiter-orders";
import DishList from "./DishList";
import ServePanel from "./ServePanel";
import PaymentPanel from "./PaymentPanel";
import {toast} from "sonner";

function WaiterPageContent() {
    const [activeTab, setActiveTab] = useState<OrderStatus>("bắt đầu phục vụ");
    const [searchQuery, setSearchQuery] = useState("");
    const [panel, setPanel] = useState<"control" | "payment">("control");

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
        getDishesByStatus, // Add this to the destructured values
    } = useWaiterOrders();

    // Auto-refresh orders every 1 second without triggering loading state
    useEffect(() => {
        const interval = setInterval(() => {
            refreshOrders(true);
        }, 1000);
        return () => clearInterval(interval);
    }, [refreshOrders]);

    // Clear all selections when switching tabs
    const handleTabChange = (newTab: OrderStatus) => {
        if (newTab !== activeTab) {
            // Clear all selections when switching tabs
            dishes.forEach(dish => {
                if (dish.selected) {
                    toggleDish(dish.id);
                }
            });
            toast.info("Đã xóa tất cả các món đã chọn.");
        }
        setActiveTab(newTab);
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
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Control Panel */}
            <div className="flex flex-col gap-4 items-center mr-4 p-4">
                <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        panel === "control"
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setPanel("control")}
                >
                    Điều khiển
                </button>
                <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        panel === "payment"
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => setPanel("payment")}
                >
                    Thanh toán
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {panel === "control" ? (
                    <>
                        {/* Navigation Tabs */}
                        <NavigationTabs
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                            getTabCount={getTabCount}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            selectedCount={dishes.filter(d => d.selected).length}
                        />

                        {/* Content based on active tab */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Dish List Sidebar */}
                            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                                <div className="flex-1 overflow-y-auto">
                                    <DishList
                                        activeTab={activeTab}
                                        searchQuery={searchQuery}
                                        onDishToggle={toggleDish}
                                        dishes={dishes}
                                        getDishesByStatus={getDishesByStatus}
                                        onRequestRemake={handleRequestRemake}
                                    />
                                </div>
                            </div>

                            {/* Serve Panel */}
                            <div className="flex-1 overflow-y-auto">
                                <ServePanel
                                    activeTab={activeTab}
                                    onServe={handleServe}
                                    onRequestRemake={handleRequestRemake}
                                    hasSelected={hasSelected}
                                    dishes={dishes}
                                    getDishesByStatus={getDishesByStatus}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <PaymentPanel onPaymentComplete={handlePaymentComplete}/>
                )}
            </div>
        </div>
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
