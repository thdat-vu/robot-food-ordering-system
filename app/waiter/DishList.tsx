"use client";

import React, {useState} from "react";
import {Checkbox} from "@/components/ui/checkbox";
import {OrderStatus} from "@/types/kitchen";
import {WaiterDish} from "@/hooks/use-waiter-orders";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";

interface DishListProps {
    activeTab: OrderStatus;
    searchQuery: string;
    onDishToggle: (dishId: string) => void;
    dishes: WaiterDish[];
    getDishesByStatus: (status: OrderStatus) => WaiterDish[];
    onRequestRemake: (reason?: string) => Promise<boolean>;
}

const categoryStyle: Record<
    string,
    { label: string; bg: string; border: string; icon?: React.ReactNode }
> = {
    "Tráng Miệng": {
        label: "Tráng Miệng",
        bg: "bg-orange-50",
        border: "border-orange-200",
    },
    "Món Chính": {
        label: "Món Chính",
        bg: "bg-green-50",
        border: "border-green-200",
    },
    "Đồ Uống": {
        label: "Đồ Uống",
        bg: "bg-blue-50",
        border: "border-blue-200",
    },
    Khác: {
        label: "Khác",
        bg: "bg-gray-50",
        border: "border-gray-200",
    },
};

const MAX_SELECTION = 6;

const DishList: React.FC<DishListProps> = ({
                                               activeTab,
                                               searchQuery,
                                               onDishToggle,
                                               dishes,
                                               getDishesByStatus,
                                               onRequestRemake,
                                           }) => {
    const [showRemakeConfirmation, setShowRemakeConfirmation] = useState(false);
    const [remakeReason, setRemakeReason] = useState("");

    // Get dishes for the active tab only
    const dishesForTab = getDishesByStatus(activeTab);
    const allDishesToShow = dishesForTab;

    // Count currently selected dishes
    const selectedCount = dishes.filter(d => d.selected).length;

    // Filter dishes by search query
    const filteredDishes = allDishesToShow.filter((dish) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;

        return (
            dish.name.toLowerCase().includes(query) ||
            dish.tableNumber.toString().includes(query) ||
            dish.categoryName.toLowerCase().includes(query) ||
            (dish.toppings &&
                dish.toppings.some((topping) =>
                    topping.toLowerCase().includes(query)
                )) ||
            (dish.sizeName &&
                dish.sizeName.toLowerCase().includes(query)) ||
            (dish.note && dish.note.toLowerCase().includes(query))
        );
    });

    // Group dishes by category
    const groupedDishes = filteredDishes.reduce<Record<string, WaiterDish[]>>(
        (acc, dish) => {
            if (!acc[dish.categoryName]) acc[dish.categoryName] = [];
            acc[dish.categoryName].push(dish);
            return acc;
        },
        {}
    );

    if (filteredDishes.length === 0) {
        return (
            <>
                <div className="p-4 text-center text-gray-500">
                    {searchQuery
                        ? "Không tìm thấy món ăn phù hợp"
                        : "Không có món ăn nào trong trạng thái này"}
                </div>
            </>
        );
    }

    const handleDishClick = (clickedDish: WaiterDish) => {
        if (activeTab.toString() === 'Đã phục vụ') {
            // For served dishes, just toggle the individual dish
            onDishToggle(clickedDish.id);
            return;
        }

        // Get all dishes from the same table that are in the current tab
        const dishesFromSameTable = dishesForTab.filter(d => d.tableNumber === clickedDish.tableNumber);
        const isAnyFromTableSelected = dishesFromSameTable.some(d => d.selected);

        if (isAnyFromTableSelected) {
            // If any dish from this table is selected, deselect all from this table
            const selectedFromThisTable = dishesFromSameTable.filter(d => d.selected);
            selectedFromThisTable.forEach(dish => {
                onDishToggle(dish.id);
            });
            toast.info(`Đã bỏ chọn ${selectedFromThisTable.length} món từ Bàn ${clickedDish.tableNumber}`);
        } else {
            // If no dish from this table is selected, try to select all
            const unselectedFromTable = dishesFromSameTable.filter(d => !d.selected);

            // Check if selecting all dishes from this table would exceed the limit
            if (selectedCount + unselectedFromTable.length > MAX_SELECTION) {
                const remainingSlots = MAX_SELECTION - selectedCount;
                toast.warning(`Chỉ có thể chọn tối đa ${MAX_SELECTION} món. Còn lại ${remainingSlots} vị trí trống.`);
                return;
            }

            // Select all dishes from this table
            unselectedFromTable.forEach(dish => {
                onDishToggle(dish.id);
            });
            toast.success(`Đã chọn ${unselectedFromTable.length} món từ Bàn ${clickedDish.tableNumber}`);
        }
    };

    const handleIndividualToggle = (dish: WaiterDish, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!dish.selected && selectedCount >= MAX_SELECTION) {
            toast.warning(`Chỉ có thể chọn tối đa ${MAX_SELECTION} món!`);
            return;
        }

        onDishToggle(dish.id);
    };

    const getTableSelectionStatus = (tableNumber: number) => {
        // Only check dishes from the current tab for table status
        const dishesFromTableInTab = dishesForTab.filter(d => d.tableNumber === tableNumber);
        const selectedFromTable = dishesFromTableInTab.filter(d => d.selected);

        if (selectedFromTable.length === 0) return "none";
        if (selectedFromTable.length === dishesFromTableInTab.length) return "all";
        return "partial";
    };

    return (
        <div className="p-4 space-y-6">
            {/* Selection Counter */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">
                        Đã chọn: {selectedCount}/{MAX_SELECTION} món
                    </span>
                    <div className="w-32 bg-blue-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{width: `${(selectedCount / MAX_SELECTION) * 100}%`}}
                        ></div>
                    </div>
                </div>
                {selectedCount >= MAX_SELECTION && (
                    <p className="text-xs text-blue-700 mt-1">
                        Đã đạt giới hạn tối đa. Bỏ chọn món khác để chọn thêm.
                    </p>
                )}
            </div>

            {Object.entries(groupedDishes).map(([categoryName, items]) => {
                const style = categoryStyle[categoryName] || categoryStyle["Khác"];

                return (
                    <div key={categoryName} className="w-full">
                        <div className="mb-2 text-sm font-semibold text-foreground uppercase tracking-wide">
                            {style.label}
                        </div>
                        <ul className="space-y-3 w-full">
                            {items.map((dish) => {
                                const tableStatus = getTableSelectionStatus(dish.tableNumber);
                                const isTablePartiallySelected = tableStatus === "partial";
                                const isTableFullySelected = tableStatus === "all";

                                return (
                                    <li key={dish.id}>
                                        <div
                                            className={`flex items-center px-4 py-3 rounded-xl border ${
                                                style.bg
                                            } ${
                                                style.border
                                            } cursor-pointer transition-all hover:bg-accent ${
                                                dish.selected
                                                    ? "ring-2 ring-green-500 ring-offset-2 bg-green-50 border-green-300"
                                                    : isTablePartiallySelected
                                                        ? "ring-1 ring-yellow-400 ring-offset-1 bg-yellow-50 border-yellow-200"
                                                        : ""
                                            }`}
                                            onClick={() => handleDishClick(dish)}
                                        >
                                            <div
                                                className={`mr-3 w-6 h-6 border-2 rounded flex items-center justify-center cursor-pointer transition-colors ${
                                                    dish.selected
                                                        ? 'bg-green-500 border-green-700'
                                                        : isTablePartiallySelected
                                                            ? 'bg-yellow-200 border-yellow-400'
                                                            : 'bg-white border-gray-300 hover:border-gray-400'
                                                }`}
                                                onClick={(e) => handleIndividualToggle(dish, e)}
                                                title={
                                                    dish.selected
                                                        ? "Đã chọn - Click để bỏ chọn"
                                                        : isTablePartiallySelected
                                                            ? "Bàn này có món khác đã được chọn"
                                                            : "Chưa chọn - Click để chọn"
                                                }
                                            >
                                                {dish.selected && (
                                                    <svg className="w-4 h-4 text-white" fill="currentColor"
                                                         viewBox="0 0 20 20">
                                                        <path fillRule="evenodd"
                                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                              clipRule="evenodd"/>
                                                    </svg>
                                                )}
                                                {isTablePartiallySelected && !dish.selected && (
                                                    <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-medium text-foreground">
                                                        {dish.name} - Bàn {dish.tableNumber}{" "}
                                                        {dish.quantity > 1 && `(${dish.quantity})`}
                                                    </div>
                                                    {isTableFullySelected && (
                                                        <span
                                                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                            Toàn bàn
                                                        </span>
                                                    )}
                                                    {isTablePartiallySelected && (
                                                        <span
                                                            className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                                                            Một phần
                                                        </span>
                                                    )}
                                                </div>
                                                {dish.orderTime && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Đặt lúc: {dish.orderTime}
                                                    </div>
                                                )}
                                                {dish.note && (
                                                    <div className="text-xs text-orange-600 mt-1">
                                                        Ghi chú: {dish.note}
                                                    </div>
                                                )}
                                                {dish.sizeName && (
                                                    <div className="text-xs text-blue-600">
                                                        Size: {dish.sizeName}
                                                    </div>
                                                )}
                                                {dish.toppings && dish.toppings.length > 0 && (
                                                    <div className="text-xs text-purple-600">
                                                        Toppings: {dish.toppings.join(", ")}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            })}

            {activeTab.toString() === "Đã phục vụ" && (
                <div className="sticky bottom-0 left-0 right-0 bg-white border-t pt-3">
                    <Button
                        onClick={() => setShowRemakeConfirmation(true)}
                        disabled={!dishes.some((d) => d.selected && d.status === activeTab)}
                        className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold disabled:opacity-50"
                    >
                        🔄 Yêu cầu làm lại
                    </Button>
                </div>
            )}

            {showRemakeConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                        <div className="text-center">
                            <div
                                className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🔄</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                Xác nhận yêu cầu làm lại
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn yêu cầu làm lại các món đã chọn? Hành động này sẽ chuyển các món
                                sang trạng thái "Yêu cầu làm lại".
                            </p>
                            <div className="mt-4 text-left">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lý do làm lại
                                </label>
                                <input
                                    type="text"
                                    value={remakeReason}
                                    onChange={(e) => setRemakeReason(e.target.value)}
                                    placeholder="Nhập lý do làm lại..."
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div className="mt-4 flex gap-3">
                                <Button onClick={() => setShowRemakeConfirmation(false)} variant="outline"
                                        className="flex-1">
                                    Hủy
                                </Button>
                                <Button
                                    disabled={remakeReason.trim().length === 0}
                                    onClick={async () => {
                                        if (remakeReason.trim().length === 0) return;
                                        const ok = await onRequestRemake(remakeReason.trim());
                                        if (ok) {
                                            toast("Yêu cầu làm lại", {description: "Yêu cầu làm lại đã được gửi đi!"});
                                            setShowRemakeConfirmation(false);
                                            setRemakeReason("");
                                        } else {
                                            toast("Lỗi yêu cầu làm lại", {description: "Có lỗi xảy ra khi gửi yêu cầu làm lại."});
                                        }
                                    }}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Xác nhận
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DishList;
// export default DishList;