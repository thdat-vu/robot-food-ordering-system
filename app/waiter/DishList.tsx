"use client";

import React, {useEffect, useMemo, useRef, useState} from "react";
import {Checkbox} from "@/components/ui/checkbox";
import {OrderStatus} from "@/types/kitchen";
import {WaiterDish} from "@/hooks/use-waiter-orders";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface DishListProps {
    activeTab: OrderStatus;
    searchQuery: string;
    onDishToggle: (dishId: string) => void;
    dishes: WaiterDish[];
    getDishesByStatus: (status: OrderStatus) => WaiterDish[];
    onRequestRemake: (reason?: string) => Promise<boolean>;
    useRobotDelivery: boolean; // Robot delivery mode
    robotTrayLimit: number; // Max dishes for robot (3 trays)
    onToggleRobotMode: (enabled: boolean) => void; // Toggle robot mode handler
}

const normalizeCategoryName = (name: string): string =>
    (name || "").normalize("NFC").toLowerCase();

const CATEGORY_PRIORITY: Record<string, number> = {
    "đồ uống": 0,
    "món chính": 1,
    "tráng miệng": 2,
};

const CATEGORY_STYLES: Record<string, { label: string; bg: string; border: string }> = {
    "đồ uống": {
        label: "Đồ uống",
        bg: "bg-blue-50",
        border: "border-blue-200",
    },
    "món chính": {
        label: "Món chính",
        bg: "bg-green-50",
        border: "border-green-200",
    },
    "tráng miệng": {
        label: "Tráng miệng",
        bg: "bg-orange-50",
        border: "border-orange-200",
    },
    default: {
        label: "Khác",
        bg: "bg-gray-50",
        border: "border-gray-200",
    },
};

const getCategoryStyle = (name: string) => {
    const normalized = normalizeCategoryName(name);
    return CATEGORY_STYLES[normalized] || CATEGORY_STYLES.default;
};

const getCategoryPriority = (name: string) => {
    const normalized = normalizeCategoryName(name);
    return CATEGORY_PRIORITY[normalized] ?? 3;
};

const REMAKE_SUGGESTIONS: string[] = [
    "Món ăn quá mặn",
    "Món ăn quá nhạt",
    "Món ăn chưa chín",
    "Món ăn bị cháy",
    "Không đúng yêu cầu",
    "Thiếu gia vị",
    "Quá cay",
    "Không đủ nóng",
    "Sai món",
    "Chất lượng không đạt"
];

const MAX_SELECTION = Infinity;

const DishList: React.FC<DishListProps> = ({
                                               activeTab,
                                               searchQuery,
                                               onDishToggle,
                                               dishes,
                                               getDishesByStatus,
                                               onRequestRemake,
                                               useRobotDelivery,
                                               robotTrayLimit,
                                               onToggleRobotMode,
                                           }) => {

    console.log(activeTab)

    const [showRemakeConfirmation, setShowRemakeConfirmation] = useState(false);
    const [remakeReason, setRemakeReason] = useState("");

    // Get dishes for the active tab only
    const dishesForTab = getDishesByStatus(activeTab);
    const allDishesToShow = dishesForTab;

    const [showSuggestions, setShowSuggestions] = useState(true);

    // Toggle: Auto-select items
    // Always start as ON on page load/reload
    const [autoSuggestEnabled, setAutoSuggestEnabled] = useState<boolean>(true);

    // Track whether we already auto-suggested for a given tab to avoid overriding user choices
    const autoSuggestedTabsRef = useRef<Record<string, boolean>>({});
    // Track previous value to run the clear-on-disable logic only once when toggled off
    const prevAutoSuggestRef = useRef<boolean>(autoSuggestEnabled);
    // Track when we have just cleared selections to avoid first-click race
    const lastClearTimestampRef = useRef<number>(0);
    // Track first mount to avoid running clear logic on initial render/reload
    const hasMountedRef = useRef<boolean>(false);

    // Ensure first manual toggle after clearing happens after the clear operations
    const safeToggle = (id: string) => {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const recentlyCleared = !autoSuggestEnabled && now - lastClearTimestampRef.current < 300;
        if (recentlyCleared) {
            setTimeout(() => onDishToggle(id), 0);
        } else {
            onDishToggle(id);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('waiter_auto_suggest', String(autoSuggestEnabled));
        }
    }, [autoSuggestEnabled]);

    const handleSuggestionClick = (suggestion: string) => {
        setRemakeReason(suggestion);
        setShowSuggestions(false);
    };

    const handleInputFocus = () => {
        if (remakeReason === '') {
            setShowSuggestions(true);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setRemakeReason(value);

        // Hiển thị gợi ý nếu input trống
        if (value === '') {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    // Count currently selected dishes (remember to multiply by quantity)
    const selectedCount = dishes
        .filter(d => d.selected)
        .reduce((total, dish) => total + (dish.quantity || 1), 0);

    // Auto-select logic: run once per tab when enabled; do not fight user deselection
    useEffect(() => {
        if (!autoSuggestEnabled) return;
        if (activeTab !== "bắt đầu phục vụ") return;

        // Prevent repeated auto-filling for the same tab session
        if (autoSuggestedTabsRef.current[activeTab]) return;

        const remaining = MAX_SELECTION - selectedCount;
        if (remaining <= 0) {
            autoSuggestedTabsRef.current[activeTab] = true;
            return;
        }

        const unselected = dishesForTab.filter(d => !d.selected);
        if (unselected.length === 0) {
            // Đợi dữ liệu/polling: không đánh dấu đã gợi ý để khi món xuất hiện sẽ tự chọn
            return;
        }

        const tableToItems = new Map<number, WaiterDish[]>();
        unselected.forEach(d => {
            const list = tableToItems.get(d.tableNumber) || [];
            list.push(d);
            tableToItems.set(d.tableNumber, list);
        });

        const tableGroups = Array.from(tableToItems.entries())
            .sort((a, b) => {
                const lenDiff = b[1].length - a[1].length;
                if (lenDiff !== 0) return lenDiff;
                return a[0] - b[0];
            })
            .map(([_, items]) => items);

        let toFill = remaining;
        for (const group of tableGroups) {
            for (const dish of group) {
                if (toFill <= 0) break;
                if (!dish.selected) {
                    onDishToggle(dish.id);
                    toFill -= (dish.quantity || 1);
                }
            }
            if (toFill <= 0) break;
        }

        // Mark as done to avoid re-running for this tab until toggled or tab changes
        autoSuggestedTabsRef.current[activeTab] = true;
    // We intentionally exclude onDishToggle from deps to avoid re-running on its identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoSuggestEnabled, activeTab, dishesForTab, selectedCount]);

    // When toggling OFF auto-suggest, clear selections ONCE; allow normal manual selection afterwards
    useEffect(() => {
        const prev = prevAutoSuggestRef.current;

        // Skip clear/reset logic on first mount to prevent unintended deselection after reload
        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            prevAutoSuggestRef.current = autoSuggestEnabled;
            return;
        }

        if (prev && !autoSuggestEnabled) {
            const selectedInTab = dishesForTab.filter(d => d.selected);
            if (selectedInTab.length > 0) {
                selectedInTab.forEach(d => onDishToggle(d.id));
                toast.info("Đã tắt gợi ý và bỏ chọn các món trong tab hiện tại.");
            }
            lastClearTimestampRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now();
        }

        if (!prev && autoSuggestEnabled) {
            autoSuggestedTabsRef.current = {};
        }

        prevAutoSuggestRef.current = autoSuggestEnabled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoSuggestEnabled]);

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
            const key = dish.categoryName || "Khác";
            if (!acc[key]) acc[key] = [];
            acc[key].push(dish);
            return acc;
        },
        {}
    );

    const sortedCategoryEntries = Object.entries(groupedDishes).sort((a, b) => {
        const priorityDiff = getCategoryPriority(a[0]) - getCategoryPriority(b[0]);
        if (priorityDiff !== 0) return priorityDiff;
        return a[0].localeCompare(b[0], "vi", { sensitivity: "accent" });
    });

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

        // BUG FIX: In robot mode, only toggle individual dish to avoid selecting multiple dishes unintentionally
        // OLD BEHAVIOR: Click on dish card would select ALL dishes from the same table
        // NEW BEHAVIOR: In robot mode, always toggle only the clicked dish
        if (useRobotDelivery && activeTab === "bắt đầu phục vụ") {
            // In robot mode, treat card click same as checkbox click (individual toggle)
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
                safeToggle(dish.id);
            });
            toast.info(`Đã bỏ chọn ${selectedFromThisTable.length} món từ Bàn ${clickedDish.tableNumber}`);
        } else {
            // If no dish from this table is selected, try to select all
            const unselectedFromTable = dishesFromSameTable.filter(d => !d.selected);

            // Check if selecting all dishes from this table would exceed the limit
            const unselectedQuantity = unselectedFromTable.reduce((total, dish) => total + (dish.quantity || 1), 0);
            if (selectedCount + unselectedQuantity > MAX_SELECTION) {
                const remainingSlots = MAX_SELECTION - selectedCount;
                toast.warning(`Chỉ có thể chọn tối đa ${MAX_SELECTION} món. Còn lại ${remainingSlots} vị trí trống.`);
                return;
            }

            // Select all dishes from this table
            unselectedFromTable.forEach(dish => {
                safeToggle(dish.id);
            });
            toast.success(`Đã chọn ${unselectedQuantity} món từ Bàn ${clickedDish.tableNumber}`);
        }
    };

    const handleIndividualToggle = (dish: WaiterDish, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!dish.selected && selectedCount + (dish.quantity || 1) > MAX_SELECTION) {
            toast.warning(`Chỉ có thể chọn tối đa ${MAX_SELECTION} món!`);
            return;
        }

        safeToggle(dish.id);
    };

    const getTableSelectionStatus = (tableNumber: number) => {
        // Only check dishes from the current tab for table status
        const dishesFromTableInTab = dishesForTab.filter(d => d.tableNumber === tableNumber);
        const selectedFromTable = dishesFromTableInTab.filter(d => d.selected);

        if (selectedFromTable.length === 0) return "none";
        if (selectedFromTable.length === dishesFromTableInTab.length) return "all";
        return "partial";
    };

    // ============================================================================
    // ROBOT MODE HANDLER - Auto-disable suggest and select first 3
    // ============================================================================
    const handleRobotModeToggle = (enabled: boolean) => {
        if (enabled) {
            // Step 1: Disable auto-suggest
            if (autoSuggestEnabled) {
                setAutoSuggestEnabled(false);
                toast.info("Đã tắt gợi ý tự động khi bật chế độ robot");
            }
            
            // Step 2: Clear any current selections in this tab
            const selectedInTab = dishesForTab.filter(d => d.selected);
            selectedInTab.forEach(d => onDishToggle(d.id));
            
            // Step 3: Select dishes until total quantity reaches robotTrayLimit (3)
            // BUG FIX: Must count by quantity, not just number of dishes
            // OLD CODE (BUGGY): const dishesToSelect = unselectedDishes.slice(0, robotTrayLimit);
            // NEW CODE: Select dishes while tracking cumulative quantity
            const unselectedDishes = dishesForTab.filter(d => !d.selected);
            const dishesToSelect: typeof unselectedDishes = [];
            let totalQuantity = 0;
            
            for (const dish of unselectedDishes) {
                const dishQuantity = dish.quantity || 1;
                // Only add dish if it won't exceed the robot tray limit
                if (totalQuantity + dishQuantity <= robotTrayLimit) {
                    dishesToSelect.push(dish);
                    totalQuantity += dishQuantity;
                }
                // Stop when we reach the limit
                if (totalQuantity >= robotTrayLimit) {
                    break;
                }
            }
            
            // Use setTimeout to ensure previous toggles complete first
            setTimeout(() => {
                dishesToSelect.forEach(dish => onDishToggle(dish.id));
                onToggleRobotMode(true);
                toast.success(
                    `🤖 Đã bật chế độ robot và tự động chọn ${totalQuantity} món (${dishesToSelect.length} món ăn)`,
                    { duration: 3000 }
                );
            }, 50);
        } else {
            // When disabling robot mode
            onToggleRobotMode(false);
            toast.info("Đã tắt chế độ robot");
        }
    };

    return (
        <div className="p-4 space-y-6">
            {/* ============================================================================ */}
            {/* ROBOT DELIVERY MODE - Only show for "bắt đầu phục vụ" tab */}
            {/* ============================================================================ */}
            {activeTab === "bắt đầu phục vụ" && (
                <div className="w-full">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="robot-mode-sidebar"
                                    checked={useRobotDelivery}
                                    onCheckedChange={(checked) => handleRobotModeToggle(checked === true)}
                                    className="size-5 border-2 border-blue-600 data-[state=checked]:bg-blue-600"
                                />
                                <label
                                    htmlFor="robot-mode-sidebar"
                                    className="text-sm font-bold text-gray-800 cursor-pointer select-none flex items-center gap-1.5"
                                >
                                    <span className="text-lg">🤖</span>
                                    <span>Đề nghị chuyển sang robot</span>
                                </label>
                            </div>
                        </div>
                        
                        {useRobotDelivery && (
                            <div className="text-xs text-blue-800 bg-blue-100 rounded-lg px-3 py-2 border border-blue-200">
                                💡 Robot chỉ có {robotTrayLimit} khay, mỗi khay 1 món.
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Auto Suggest Toggle */}
            <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Gợi ý chọn món phục vụ</div>
                    {/* <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px] cursor-help">i</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                Tự động chọn món (không vượt quá 6)
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider> */}
                </div>
                <Switch 
                    checked={autoSuggestEnabled} 
                    onCheckedChange={setAutoSuggestEnabled}
                    disabled={useRobotDelivery && activeTab === "bắt đầu phục vụ"}
                />
            </div>
            {/* Selection Counter with Robot Mode Indicator */}
            <div className={`border rounded-lg p-3 ${
                useRobotDelivery 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'bg-blue-50 border-blue-200'
            }`}>
                <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                        useRobotDelivery ? 'text-blue-900' : 'text-blue-800'
                    }`}>
                        {useRobotDelivery ? (
                            <span>🤖 Đã chọn: {selectedCount}/{robotTrayLimit} món</span>
                        ) : (
                            <span>Đã chọn: {selectedCount} món</span>
                        )}
                    </span>
                    {useRobotDelivery && selectedCount >= robotTrayLimit && (
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                            Đã đạt giới hạn
                        </span>
                    )}
                </div>
            </div>

            {sortedCategoryEntries.map(([categoryName, items]) => {
                const style = getCategoryStyle(categoryName);

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
                                
                                // ============================================================================
                                // ROBOT MODE: Check if dish can be selected
                                // ============================================================================
                                const isRobotLimitReached = useRobotDelivery && 
                                                           activeTab === "bắt đầu phục vụ" && 
                                                           selectedCount >= robotTrayLimit;
                                const cannotSelectDish = !dish.selected && isRobotLimitReached;

                                return (
                                    <li key={dish.id}>
                                        <div
                                            className={`flex items-center px-4 py-3 rounded-xl border ${
                                                style.bg
                                            } ${
                                                style.border
                                            } ${
                                                cannotSelectDish 
                                                    ? 'opacity-50 cursor-not-allowed' 
                                                    : 'cursor-pointer transition-all hover:bg-accent'
                                            } ${
                                                dish.selected
                                                    ? "ring-2 ring-green-500 ring-offset-2 bg-green-50 border-green-300"
                                                    : isTablePartiallySelected
                                                        ? "ring-1 ring-yellow-400 ring-offset-1 bg-yellow-50 border-yellow-200"
                                                        : cannotSelectDish
                                                            ? "bg-gray-100 border-gray-300"
                                                            : ""
                                            }`}
                                            onClick={() => !cannotSelectDish && handleDishClick(dish)}
                                            title={cannotSelectDish ? "🤖 Đã đạt giới hạn robot (3 món)" : undefined}
                                        >
                                            <div
                                                className={`mr-3 w-6 h-6 border-2 rounded flex items-center justify-center ${
                                                    cannotSelectDish 
                                                        ? 'cursor-not-allowed bg-gray-200 border-gray-400' 
                                                        : 'cursor-pointer'
                                                } transition-colors ${
                                                    dish.selected
                                                        ? 'bg-green-500 border-green-700'
                                                        : isTablePartiallySelected
                                                            ? 'bg-yellow-200 border-yellow-400'
                                                            : cannotSelectDish
                                                                ? 'bg-gray-200 border-gray-400'
                                                                : 'bg-white border-gray-300 hover:border-gray-400'
                                                }`}
                                                onClick={(e) => !cannotSelectDish && handleIndividualToggle(dish, e)}
                                                title={
                                                    cannotSelectDish
                                                        ? "🤖 Đã đạt giới hạn robot (3 món)"
                                                        : dish.selected
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

            {activeTab.toString() === "đã phục vụ" && (
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-2xl">🔄</div>
                                <h2 className="text-lg font-semibold">Xác nhận yêu cầu làm lại</h2>
                            </div>

                            <p className="text-gray-600 mb-6">
                                Bạn có chắc chắn muốn yêu cầu làm lại các món đã chọn? Hành động này sẽ chuyển các món
                                sang trạng thái "Đang thực hiện".
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Lý do làm lại
                                </label>

                                {/* Gợi ý */}
                                {showSuggestions && remakeReason === '' && (
                                    <div className="mb-3">
                                        <p className="text-xs text-gray-500 mb-2">Gợi ý lý do (nhấn để chọn):</p>
                                        <div className="flex flex-wrap gap-2">
                                            {REMAKE_SUGGESTIONS.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200
                                             text-gray-700 rounded-full border transition-colors
                                             hover:border-orange-300 focus:outline-none
                                             focus:ring-2 focus:ring-orange-200"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <textarea
                                    value={remakeReason}
                                    onChange={handleInputChange}
                                    onFocus={handleInputFocus}
                                    placeholder="Nhập lý do làm lại hoặc chọn từ gợi ý bên trên..."
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2
                             focus:outline-none focus:ring-2 focus:ring-orange-500
                             focus:border-orange-500 resize-none"
                                />

                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-500">
                                        {remakeReason === '' ? 'Có thể chọn gợi ý hoặc nhập tay' : ''}
                                    </p>
                                    <span className="text-xs text-gray-400">
                        {remakeReason.length}/200
                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRemakeConfirmation(false);
                                        setRemakeReason("");
                                        setShowSuggestions(true);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700
                             rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={async () => {
                                        if (remakeReason.trim().length === 0) return;
                                        const ok = await onRequestRemake(remakeReason.trim());
                                        if (ok) {
                                            toast("Yêu cầu làm lại", {
                                                description: "Yêu cầu đã được gửi và món đã chuyển về trạng thái đang thực hiện.",
                                            });
                                            setShowRemakeConfirmation(false);
                                            setRemakeReason("");
                                            setShowSuggestions(true);
                                        } else {
                                            toast("Lỗi yêu cầu làm lại", {description: "Có lỗi xảy ra khi gửi yêu cầu làm lại."});
                                        }
                                    }}
                                    disabled={remakeReason.trim().length === 0}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50
                             disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors"
                                >
                                    Xác nhận
                                </button>
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