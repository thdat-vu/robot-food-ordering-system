"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderStatus } from "@/types/kitchen";
import { WaiterDish } from "@/hooks/use-waiter-orders";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  "phục vụ nhanh": 3,
};

const CATEGORY_STYLES: Record<
  string,
  { label: string; bg: string; border: string }
> = {
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
  "phục vụ nhanh": {
    label: "Phục vụ nhanh",
    bg: "bg-purple-50",
    border: "border-purple-200",
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

type LeftPanelView = "byDish" | "byTable";

const STATUS_BADGES: Record<OrderStatus, { label: string; className: string }> =
  {
    "đang chờ": {
      label: "Đang chờ",
      className: "bg-yellow-100 text-yellow-700",
    },
    "đang thực hiện": {
      label: "Đang chuẩn bị",
      className: "bg-orange-100 text-orange-700",
    },
    "bắt đầu phục vụ": {
      label: "Sẵn sàng phục vụ",
      className: "bg-blue-100 text-blue-700",
    },
    "phục vụ nhanh": {
      label: "Phục vụ nhanh",
      className: "bg-purple-100 text-purple-700",
    },
    "yêu cầu làm lại": {
      label: "Yêu cầu làm lại",
      className: "bg-red-100 text-red-600",
    },
    "đã phục vụ": {
      label: "Đã phục vụ",
      className: "bg-green-100 text-green-700",
    },
    "đã huỷ": { label: "Đã huỷ", className: "bg-gray-200 text-gray-700" },
  };

// Parse DD/MM/YYYY HH:mm:ss format to timestamp for sorting
const parseOrderTime = (timeStr: string | undefined): number => {
  if (!timeStr) return Number.MAX_SAFE_INTEGER;

  const match = timeStr.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/
  );
  if (match) {
    const [, day, month, year, hours, minutes, seconds] = match;
    return new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hours, 10),
      parseInt(minutes, 10),
      parseInt(seconds, 10)
    ).getTime();
  }

  const parsed = new Date(timeStr).getTime();
  return isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};

// Format time string to show only time (HH:mm:ss) - remove date
const formatTimeOnly = (timeStr: string | undefined): string => {
  if (!timeStr) return "";

  // Try parsing format: "HH:mm:ss dd/MM/yyyy"
  const match1 = timeStr.match(
    /^(\d{2}):(\d{2}):(\d{2})\s+(\d{2})\/(\d{2})\/(\d{4})$/
  );
  if (match1) {
    return `${match1[1]}:${match1[2]}:${match1[3]}`;
  }

  // Try parsing format: "dd/MM/yyyy HH:mm:ss"
  const match2 = timeStr.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/
  );
  if (match2) {
    const hours = match2[4].padStart(2, "0");
    return `${hours}:${match2[5]}:${match2[6]}`;
  }

  // Try parsing as ISO date
  const parsed = new Date(timeStr);
  if (!Number.isNaN(parsed.getTime())) {
    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(
      parsed.getSeconds()
    )}`;
  }

  return timeStr;
};

interface TableGroup {
  tableNumber: number;
  dishes: WaiterDish[];
  selectedCount: number;
  totalCount: number;
  selectedQuantity: number;
  totalQuantity: number;
  firstOrderTime?: string;
}

interface TableCluster {
  tables: number[];
  tableGroups: TableGroup[];
  totalDishes: number;
  selectedDishes: number;
}

// Detect clusters of adjacent tables (same logic as RestaurantMap)
const TABLE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 250, y: 160 },
  2: { x: 410, y: 160 },
  3: { x: 570, y: 160 },
  4: { x: 730, y: 160 },
  5: { x: 890, y: 160 },
  6: { x: 250, y: 280 },
  7: { x: 410, y: 280 },
  8: { x: 570, y: 280 },
  9: { x: 730, y: 280 },
  10: { x: 890, y: 280 },
  11: { x: 250, y: 400 },
  12: { x: 410, y: 400 },
  13: { x: 570, y: 400 },
  14: { x: 730, y: 400 },
  15: { x: 890, y: 400 },
  16: { x: 250, y: 520 },
  17: { x: 410, y: 520 },
  18: { x: 570, y: 520 },
  19: { x: 730, y: 520 },
  20: { x: 890, y: 520 },
};

const areTablesAdjacent = (id1: number, id2: number): boolean => {
  const pos1 = TABLE_POSITIONS[id1];
  const pos2 = TABLE_POSITIONS[id2];
  if (!pos1 || !pos2) return false;
  // Same row, adjacent columns (160 pixels apart)
  if (pos1.y === pos2.y && Math.abs(pos1.x - pos2.x) === 160) return true;
  // Same column, adjacent rows (120 pixels apart)
  if (pos1.x === pos2.x && Math.abs(pos1.y - pos2.y) === 120) return true;
  return false;
};

const detectTableClusters = (tableNumbers: number[]): number[][] => {
  if (tableNumbers.length === 0) return [];

  const visited = new Set<number>();
  const clusters: number[][] = [];

  const findCluster = (startId: number): number[] => {
    const cluster: number[] = [];
    const queue: number[] = [startId];
    visited.add(startId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      cluster.push(currentId);

      for (const otherId of tableNumbers) {
        if (!visited.has(otherId) && areTablesAdjacent(currentId, otherId)) {
          visited.add(otherId);
          queue.push(otherId);
        }
      }
    }

    return cluster.sort((a, b) => a - b);
  };

  for (const tableId of tableNumbers) {
    if (!visited.has(tableId)) {
      clusters.push(findCluster(tableId));
    }
  }

  return clusters;
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
  "Chất lượng không đạt",
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
  const [showRemakeConfirmation, setShowRemakeConfirmation] = useState(false);
  const [remakeReason, setRemakeReason] = useState("");
  const [viewMode, setViewMode] = useState<LeftPanelView>("byDish");
  const [expandedTables, setExpandedTables] = useState<Set<number>>(
    () => new Set()
  );

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
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const recentlyCleared =
      !autoSuggestEnabled && now - lastClearTimestampRef.current < 300;
    if (recentlyCleared) {
      setTimeout(() => onDishToggle(id), 0);
    } else {
      onDishToggle(id);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "waiter_auto_suggest",
        String(autoSuggestEnabled)
      );
    }
  }, [autoSuggestEnabled]);

  const handleSuggestionClick = (suggestion: string) => {
    setRemakeReason(suggestion);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (remakeReason === "") {
      setShowSuggestions(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setRemakeReason(value);

    // Hiển thị gợi ý nếu input trống
    if (value === "") {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Count currently selected dishes (remember to multiply by quantity)
  const selectedCount = dishes
    .filter((d) => d.selected)
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

    const unselected = dishesForTab.filter((d) => !d.selected);
    if (unselected.length === 0) {
      // Đợi dữ liệu/polling: không đánh dấu đã gợi ý để khi món xuất hiện sẽ tự chọn
      return;
    }

    const tableToItems = new Map<number, WaiterDish[]>();
    unselected.forEach((d) => {
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
          toFill -= dish.quantity || 1;
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
      const selectedInTab = dishesForTab.filter((d) => d.selected);
      if (selectedInTab.length > 0) {
        selectedInTab.forEach((d) => onDishToggle(d.id));
        toast.info("Đã tắt gợi ý và bỏ chọn các món trong tab hiện tại.");
      }
      lastClearTimestampRef.current =
        typeof performance !== "undefined" ? performance.now() : Date.now();
    }

    if (!prev && autoSuggestEnabled) {
      autoSuggestedTabsRef.current = {};
    }

    prevAutoSuggestRef.current = autoSuggestEnabled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSuggestEnabled]);

  // Filter dishes by search query (for "byDish" view)
  const filteredDishes = useMemo(() => {
    // When in "byTable" view, don't filter dishes by search query
    // The table filtering will be handled separately
    if (viewMode === "byTable") {
      return allDishesToShow;
    }

    const query = searchQuery.toLowerCase().trim();
    if (!query) return allDishesToShow;

    return allDishesToShow.filter((dish) => {
      return (
        dish.name.toLowerCase().includes(query) ||
        dish.tableNumber.toString().includes(query) ||
        dish.categoryName.toLowerCase().includes(query) ||
        (dish.toppings &&
          dish.toppings.some((topping) =>
            topping.toLowerCase().includes(query)
          )) ||
        (dish.sizeName && dish.sizeName.toLowerCase().includes(query)) ||
        (dish.note && dish.note.toLowerCase().includes(query))
      );
    });
  }, [allDishesToShow, searchQuery, viewMode]);

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

  // Sort items within each category by order time (oldest first - FIFO)
  Object.keys(groupedDishes).forEach((category) => {
    groupedDishes[category].sort((a, b) => {
      const timeA = parseOrderTime(a.orderTime);
      const timeB = parseOrderTime(b.orderTime);
      return timeA - timeB; // Oldest first
    });
  });

  const sortedCategoryEntries = Object.entries(groupedDishes).sort((a, b) => {
    const priorityDiff = getCategoryPriority(a[0]) - getCategoryPriority(b[0]);
    if (priorityDiff !== 0) return priorityDiff;
    return a[0].localeCompare(b[0], "vi", { sensitivity: "accent" });
  });

  // Base table groups (without search filtering)
  const baseTableGroups = useMemo<TableGroup[]>(() => {
    const map = new Map<number, WaiterDish[]>();
    allDishesToShow.forEach((dish) => {
      const current = map.get(dish.tableNumber) || [];
      current.push(dish);
      map.set(dish.tableNumber, current);
    });

    return (
      Array.from(map.entries())
        .map(([tableNumber, tableDishes]) => {
          // Sort dishes within each table by order time (oldest first)
          tableDishes.sort(
            (a, b) => parseOrderTime(a.orderTime) - parseOrderTime(b.orderTime)
          );

          const selectedDishes = tableDishes.filter((dish) => dish.selected);
          const selectedCount = selectedDishes.length;
          const totalCount = tableDishes.length;
          const selectedQuantity = selectedDishes.reduce(
            (sum, dish) => sum + (dish.quantity || 1),
            0
          );
          const totalQuantity = tableDishes.reduce(
            (sum, dish) => sum + (dish.quantity || 1),
            0
          );

          // Get oldest order time for this table
          const oldestOrderTime = tableDishes[0]?.orderTime;

          return {
            tableNumber,
            dishes: tableDishes,
            selectedCount,
            totalCount,
            selectedQuantity,
            totalQuantity,
            firstOrderTime: oldestOrderTime,
          };
        })
        // Sort tables by oldest order time first (FIFO)
        .sort((a, b) => {
          const timeA = parseOrderTime(a.firstOrderTime);
          const timeB = parseOrderTime(b.firstOrderTime);
          if (timeA !== timeB) return timeA - timeB; // Oldest first
          return a.tableNumber - b.tableNumber; // Same time, sort by table number
        })
    );
  }, [allDishesToShow]);

  // Filter table groups by table number when in "byTable" view
  const tableGroups = useMemo<TableGroup[]>(() => {
    if (viewMode === "byTable" && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      return baseTableGroups.filter((group) =>
        group.tableNumber.toString().includes(query)
      );
    }
    return baseTableGroups;
  }, [baseTableGroups, viewMode, searchQuery]);

  // Group tables into clusters for "byTable" view
  const tableClusters = useMemo<TableCluster[]>(() => {
    const tableNumbers = tableGroups.map((g) => g.tableNumber);
    const clusterArrays = detectTableClusters(tableNumbers);

    return clusterArrays.map((clusterTables) => {
      const clusterGroups = clusterTables
        .map((tableNum) => tableGroups.find((g) => g.tableNumber === tableNum))
        .filter((g): g is TableGroup => g !== undefined);

      return {
        tables: clusterTables,
        tableGroups: clusterGroups,
        totalDishes: clusterGroups.reduce((sum, g) => sum + g.totalCount, 0),
        selectedDishes: clusterGroups.reduce(
          (sum, g) => sum + g.selectedCount,
          0
        ),
      };
    });
  }, [tableGroups]);

  // Toggle all dishes in a cluster
  const toggleClusterSelection = (clusterTables: number[]) => {
    const clusterDishes = dishesForTab.filter((d) =>
      clusterTables.includes(d.tableNumber)
    );
    const allSelected = clusterDishes.every((d) => d.selected);

    if (allSelected) {
      // Deselect all
      clusterDishes.filter((d) => d.selected).forEach((d) => safeToggle(d.id));
      toast.info(`Đã bỏ chọn cụm bàn ${clusterTables.join(", ")}`);
    } else {
      // Select all unselected
      const unselected = clusterDishes.filter((d) => !d.selected);

      // Check robot limit
      if (useRobotDelivery && activeTab === "bắt đầu phục vụ") {
        const unselectedQuantity = unselected.reduce(
          (sum, d) => sum + (d.quantity || 1),
          0
        );
        if (selectedCount + unselectedQuantity > robotTrayLimit) {
          toast.error(`🤖 Vượt quá giới hạn robot (${robotTrayLimit} món)`);
          return;
        }
      }

      unselected.forEach((d) => safeToggle(d.id));
      toast.success(`Đã chọn cụm bàn ${clusterTables.join(", ")}`);
    }
  };

  // Get cluster selection status
  const getClusterSelectionStatus = (
    clusterTables: number[]
  ): "none" | "partial" | "all" => {
    const clusterDishes = dishesForTab.filter((d) =>
      clusterTables.includes(d.tableNumber)
    );
    const selectedCount = clusterDishes.filter((d) => d.selected).length;

    if (selectedCount === 0) return "none";
    if (selectedCount === clusterDishes.length) return "all";
    return "partial";
  };

  const viewTabs = useMemo(
    () => [
      { key: "byDish" as LeftPanelView, label: "Theo món" },
      { key: "byTable" as LeftPanelView, label: "Theo bàn" },
    ],
    []
  );

  const prevTableNumbersRef = useRef<number[]>([]);
  useEffect(() => {
    const currentNumbers = tableGroups.map((group) => group.tableNumber);
    const prevNumbers = prevTableNumbersRef.current;
    const hasChanges =
      currentNumbers.length !== prevNumbers.length ||
      currentNumbers.some((num, idx) => num !== prevNumbers[idx]);

    if (!hasChanges) {
      return;
    }

    prevTableNumbersRef.current = currentNumbers;

    setExpandedTables((prev) => {
      const next = new Set<number>();
      currentNumbers.forEach((num) => {
        if (prev.has(num)) {
          next.add(num);
        }
      });

      if (next.size === 0 && currentNumbers.length > 0) {
        next.add(currentNumbers[0]);
      }

      return next;
    });
  }, [tableGroups]);

  const handleDishClick = (clickedDish: WaiterDish) => {
    // For served tab, handle differently - only toggle non-quick-serve items from the table
    if (activeTab.toString() === "đã phục vụ") {
      // Get all non-quick-serve dishes from the same table in the current tab
      const dishesFromSameTable = dishesForTab.filter(
        (d) => d.tableNumber === clickedDish.tableNumber && !d.isQuickServe
      );
      const isAnyFromTableSelected = dishesFromSameTable.some(
        (d) => d.selected
      );

      if (isAnyFromTableSelected) {
        // Deselect all non-quick-serve dishes from this table
        const selectedFromThisTable = dishesFromSameTable.filter(
          (d) => d.selected
        );
        selectedFromThisTable.forEach((dish) => {
          safeToggle(dish.id);
        });
      } else {
        // Select all non-quick-serve dishes from this table
        const unselectedFromTable = dishesFromSameTable.filter(
          (d) => !d.selected
        );
        unselectedFromTable.forEach((dish) => {
          safeToggle(dish.id);
        });
      }
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
    const dishesFromSameTable = dishesForTab.filter(
      (d) => d.tableNumber === clickedDish.tableNumber
    );
    const isAnyFromTableSelected = dishesFromSameTable.some((d) => d.selected);

    if (isAnyFromTableSelected) {
      // If any dish from this table is selected, deselect all from this table
      const selectedFromThisTable = dishesFromSameTable.filter(
        (d) => d.selected
      );
      selectedFromThisTable.forEach((dish) => {
        safeToggle(dish.id);
      });
      toast.info(
        `Đã bỏ chọn ${selectedFromThisTable.length} món từ Bàn ${clickedDish.tableNumber}`
      );
    } else {
      // If no dish from this table is selected, try to select all
      const unselectedFromTable = dishesFromSameTable.filter(
        (d) => !d.selected
      );

      // Check if selecting all dishes from this table would exceed the limit
      const unselectedQuantity = unselectedFromTable.reduce(
        (total, dish) => total + (dish.quantity || 1),
        0
      );
      if (selectedCount + unselectedQuantity > MAX_SELECTION) {
        const remainingSlots = MAX_SELECTION - selectedCount;
        toast.warning(
          `Chỉ có thể chọn tối đa ${MAX_SELECTION} món. Còn lại ${remainingSlots} vị trí trống.`
        );
        return;
      }

      // Select all dishes from this table
      unselectedFromTable.forEach((dish) => {
        safeToggle(dish.id);
      });
      toast.success(
        `Đã chọn ${unselectedQuantity} món từ Bàn ${clickedDish.tableNumber}`
      );
    }
  };

  const toggleTableExpansion = (tableNumber: number) => {
    setExpandedTables((prev) => {
      const next = new Set(prev);
      if (next.has(tableNumber)) {
        next.delete(tableNumber);
      } else {
        next.add(tableNumber);
      }
      return next;
    });
  };

  const toggleTableSelection = (tableNumber: number) => {
    // In served tab, only consider non-quick-serve dishes
    const dishesToConsider =
      activeTab.toString() === "đã phục vụ"
        ? dishesForTab.filter(
            (dish) => dish.tableNumber === tableNumber && !dish.isQuickServe
          )
        : dishesForTab.filter((dish) => dish.tableNumber === tableNumber);

    const firstDish = dishesToConsider[0];
    if (firstDish) {
      handleDishClick(firstDish);
    }
  };

  const handleIndividualToggle = (dish: WaiterDish, e: React.MouseEvent) => {
    e.stopPropagation();

    if (
      !dish.selected &&
      selectedCount + (dish.quantity || 1) > MAX_SELECTION
    ) {
      toast.warning(`Chỉ có thể chọn tối đa ${MAX_SELECTION} món!`);
      return;
    }

    safeToggle(dish.id);
  };

  const getTableSelectionStatus = (tableNumber: number) => {
    // Only check dishes from the current tab for table status
    // In served tab, exclude quick-serve items from the selection status check
    const dishesFromTableInTab =
      activeTab.toString() === "đã phục vụ"
        ? dishesForTab.filter(
            (d) => d.tableNumber === tableNumber && !d.isQuickServe
          )
        : dishesForTab.filter((d) => d.tableNumber === tableNumber);
    const selectedFromTable = dishesFromTableInTab.filter((d) => d.selected);

    if (dishesFromTableInTab.length === 0) return "none"; // No selectable dishes
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
      const selectedInTab = dishesForTab.filter((d) => d.selected);
      selectedInTab.forEach((d) => onDishToggle(d.id));

      // Step 3: Select dishes until total quantity reaches robotTrayLimit (3)
      // BUG FIX: Must count by quantity, not just number of dishes
      // OLD CODE (BUGGY): const dishesToSelect = unselectedDishes.slice(0, robotTrayLimit);
      // NEW CODE: Select dishes while tracking cumulative quantity
      const unselectedDishes = dishesForTab.filter((d) => !d.selected);
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
        dishesToSelect.forEach((dish) => onDishToggle(dish.id));
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

  const emptyState = (
    <div className="p-4 text-center text-gray-500">
      {searchQuery
        ? "Không tìm thấy món ăn phù hợp"
        : "Không có món ăn nào trong trạng thái này"}
    </div>
  );

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
                  onCheckedChange={(checked) =>
                    handleRobotModeToggle(checked === true)
                  }
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

      {/* Auto Suggest Toggle - Hide in served tab */}
      {activeTab.toString() !== "đã phục vụ" && (
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
      )}
      {/* Selection Counter with Robot Mode Indicator */}
      <div
        className={`border rounded-lg p-3 ${
          useRobotDelivery
            ? "bg-blue-100 border-blue-300"
            : "bg-blue-50 border-blue-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-medium ${
              useRobotDelivery ? "text-blue-900" : "text-blue-800"
            }`}
          >
            {useRobotDelivery ? (
              <span>
                🤖 Đã chọn: {selectedCount}/{robotTrayLimit} món
              </span>
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

      {/* View mode toggle */}
      <div className="bg-gray-100 rounded-xl p-1 grid grid-cols-2 gap-1">
        {viewTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setViewMode(tab.key)}
            className={`text-sm font-medium py-2 rounded-lg transition-colors ${
              viewMode === tab.key
                ? "bg-white text-blue-600 shadow"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredDishes.length === 0 && emptyState}

        {filteredDishes.length > 0 &&
          viewMode === "byDish" &&
          sortedCategoryEntries.map(([categoryName, items]) => {
            const style = getCategoryStyle(categoryName);

            return (
              <div key={categoryName} className="w-full">
                <div className="mb-2 text-sm font-semibold text-foreground uppercase tracking-wide">
                  {style.label}
                </div>
                <ul className="space-y-3 w-full">
                  {items.map((dish) => {
                    const tableStatus = getTableSelectionStatus(
                      dish.tableNumber
                    );
                    const isTablePartiallySelected = tableStatus === "partial";
                    const isTableFullySelected = tableStatus === "all";

                    const isRobotLimitReached =
                      useRobotDelivery &&
                      activeTab === "bắt đầu phục vụ" &&
                      selectedCount >= robotTrayLimit;
                    // Disable selection for quick serve items in "đã phục vụ" tab
                    const isQuickServeInServedTab =
                      activeTab === "đã phục vụ" && dish.isQuickServe === true;
                    const cannotSelectDish =
                      !dish.selected &&
                      (isRobotLimitReached || isQuickServeInServedTab);

                    return (
                      <li key={dish.id}>
                        <div
                          className={`flex items-center px-4 py-3 rounded-xl border ${
                            style.bg
                          } ${style.border} ${
                            cannotSelectDish
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer transition-all hover:bg-accent"
                          } ${
                            dish.selected
                              ? "ring-2 ring-green-500 ring-offset-2 bg-green-50 border-green-300"
                              : isTablePartiallySelected
                              ? "ring-1 ring-yellow-400 ring-offset-1 bg-yellow-50 border-yellow-200"
                              : cannotSelectDish
                              ? "bg-gray-100 border-gray-300"
                              : ""
                          }`}
                          onClick={() =>
                            !cannotSelectDish && handleDishClick(dish)
                          }
                          title={
                            cannotSelectDish
                              ? isQuickServeInServedTab
                                ? "⚡ Món phục vụ nhanh đã phục vụ không thể yêu cầu làm lại"
                                : "🤖 Đã đạt giới hạn robot (3 món)"
                              : undefined
                          }
                        >
                          <div
                            className={`mr-3 w-6 h-6 border-2 rounded flex items-center justify-center ${
                              cannotSelectDish
                                ? "cursor-not-allowed bg-gray-200 border-gray-400"
                                : "cursor-pointer"
                            } transition-colors ${
                              dish.selected
                                ? "bg-green-500 border-green-700"
                                : isTablePartiallySelected
                                ? "bg-yellow-200 border-yellow-400"
                                : cannotSelectDish
                                ? "bg-gray-200 border-gray-400"
                                : "bg-white border-gray-300 hover:border-gray-400"
                            }`}
                            onClick={(e) =>
                              !cannotSelectDish &&
                              handleIndividualToggle(dish, e)
                            }
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
                              <svg
                                className="w-4 h-4 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {isTablePartiallySelected && !dish.selected && (
                              <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {/* Primary Info: Name + Size + Quantity + Table on same line */}
                            <div className="flex items-start sm:items-center justify-between gap-2 mb-2 flex-wrap">
                              <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0 flex-1">
                                <span className="truncate max-w-[120px] sm:max-w-none">
                                  {dish.name}
                                </span>
                                {dish.sizeName && (
                                  <span className="px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full border border-blue-200 flex-shrink-0">
                                    {dish.sizeName.charAt(0).toUpperCase()}
                                  </span>
                                )}
                                <span className="text-xs sm:text-sm font-semibold text-gray-600 flex-shrink-0">
                                  x{dish.quantity > 0 ? dish.quantity : 1}
                                </span>
                                <span className="text-gray-400 font-normal flex-shrink-0">
                                  -
                                </span>
                                <span className="text-xs sm:text-sm font-semibold text-gray-600 flex-shrink-0">
                                  Bàn {dish.tableNumber}
                                </span>
                              </h3>
                              <div className="flex-shrink-0">
                                {isTableFullySelected && (
                                  <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                    Toàn bàn
                                  </span>
                                )}
                                {isTablePartiallySelected && (
                                  <span className="text-[10px] sm:text-xs bg-yellow-100 text-yellow-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                    Một phần
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Note & Toppings */}
                            {dish.note && (
                              <div className="mt-1 text-[10px] sm:text-xs text-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 px-2 py-1 rounded-md border border-amber-200 break-words">
                                <span className="font-semibold">Ghi chú:</span>{" "}
                                <span className="break-words">{dish.note}</span>
                              </div>
                            )}
                            {dish.toppings && dish.toppings.length > 0 && (
                              <div className="mt-1 text-[10px] sm:text-xs text-emerald-800 bg-gradient-to-r from-emerald-50 to-green-50 px-2 py-1 rounded-md border border-emerald-200 break-words">
                                <span className="font-semibold">Toppings:</span>{" "}
                                <span className="break-words">
                                  {dish.toppings.join(", ")}
                                </span>
                              </div>
                            )}

                            {/* Time badges - Horizontal layout with labels - Responsive */}
                            <div className="flex items-center gap-1.5 sm:gap-3 mt-2 flex-wrap">
                              <TooltipProvider>
                                {dish.orderTime && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 cursor-help hover:text-gray-700 transition-colors px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md hover:bg-gray-50 flex-shrink-0">
                                        <svg
                                          className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 4v16m8-8H4"
                                          />
                                        </svg>
                                        <span className="text-gray-600 font-semibold hidden sm:inline">
                                          Tạo:
                                        </span>
                                        <span className="text-gray-500 truncate max-w-[100px] sm:max-w-none">
                                          {formatTimeOnly(dish.orderTime)}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Ngày giờ tạo món</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {dish.readyTime && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-emerald-600 cursor-help hover:text-emerald-700 transition-colors px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md hover:bg-emerald-50 flex-shrink-0">
                                        <svg
                                          className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 flex-shrink-0"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                        <span className="text-emerald-700 font-semibold hidden sm:inline">
                                          Ra món:
                                        </span>
                                        <span className="text-emerald-600 truncate max-w-[100px] sm:max-w-none">
                                          {formatTimeOnly(dish.readyTime)}
                                        </span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Ngày giờ ra món</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {activeTab === "đã phục vụ" &&
                                  dish.servedTime && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-green-600 cursor-help hover:text-green-700 transition-colors px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md hover:bg-green-50 flex-shrink-0">
                                          <svg
                                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                          <span className="text-green-700 font-semibold hidden sm:inline">
                                            Đã phục vụ:
                                          </span>
                                          <span className="text-green-600 truncate max-w-[100px] sm:max-w-none">
                                            {formatTimeOnly(dish.servedTime)}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Ngày giờ đã phục vụ</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

        {filteredDishes.length > 0 &&
          viewMode === "byTable" &&
          tableClusters.map((cluster, clusterIndex) => {
            const isMultiTableCluster = cluster.tables.length > 1;
            const clusterStatus = getClusterSelectionStatus(cluster.tables);
            const clusterCheckboxState =
              clusterStatus === "all"
                ? true
                : clusterStatus === "partial"
                ? "indeterminate"
                : false;

            return (
              <div key={`cluster-${clusterIndex}`} className="space-y-3">
                {/* Cluster Header - only show for multi-table clusters */}
                {isMultiTableCluster && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-300 p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={clusterCheckboxState}
                        onCheckedChange={() =>
                          toggleClusterSelection(cluster.tables)
                        }
                        className="size-5 shrink-0 border-2 border-purple-600 data-[state=checked]:bg-purple-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-purple-900 truncate">
                            Cụm {cluster.tables.join("+")}
                          </span>
                          {clusterStatus === "all" && (
                            <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0">
                              ✓ Chọn
                            </span>
                          )}
                          {clusterStatus === "partial" && (
                            <span className="text-[10px] bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0">
                              1 phần
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-purple-700">
                          {cluster.totalDishes} món · {cluster.selectedDishes}{" "}
                          chọn
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tables in this cluster */}
                <div
                  className={
                    isMultiTableCluster
                      ? "pl-4 space-y-3 border-l-4 border-purple-200"
                      : "space-y-3"
                  }
                >
                  {cluster.tableGroups.map((group) => {
                    const tableSelectionStatus = getTableSelectionStatus(
                      group.tableNumber
                    );
                    const checkboxState =
                      tableSelectionStatus === "all"
                        ? true
                        : tableSelectionStatus === "partial"
                        ? "indeterminate"
                        : false;
                    const isExpanded = expandedTables.has(group.tableNumber);

                    return (
                      <div
                        key={group.tableNumber}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                      >
                        <div className="px-4 py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={checkboxState}
                              onCheckedChange={() =>
                                toggleTableSelection(group.tableNumber)
                              }
                              className="size-5 border-2 border-blue-600 data-[state=checked]:bg-blue-600"
                            />
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Bàn {group.tableNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                {group.totalCount} món · {group.selectedCount}{" "}
                                món đã chọn
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-200 hover:bg-gray-100"
                            onClick={() =>
                              toggleTableExpansion(group.tableNumber)
                            }
                            aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3">
                            {group.dishes.map((dish) => {
                              const style = getCategoryStyle(
                                dish.categoryName || "Khác"
                              );
                              const tableStatus = getTableSelectionStatus(
                                dish.tableNumber
                              );
                              const isTablePartiallySelected =
                                tableStatus === "partial";
                              const isTableFullySelected =
                                tableStatus === "all";
                              const isRobotLimitReached =
                                useRobotDelivery &&
                                activeTab === "bắt đầu phục vụ" &&
                                selectedCount >= robotTrayLimit;
                              // Disable selection for quick serve items in "đã phục vụ" tab
                              const isQuickServeInServedTab =
                                activeTab === "đã phục vụ" &&
                                dish.isQuickServe === true;
                              const cannotSelectDish =
                                !dish.selected &&
                                (isRobotLimitReached ||
                                  isQuickServeInServedTab);

                              return (
                                <div
                                  key={dish.id}
                                  className={`flex items-center px-4 py-3 rounded-xl border ${
                                    style.bg
                                  } ${style.border} ${
                                    cannotSelectDish
                                      ? "opacity-50 cursor-not-allowed"
                                      : "cursor-pointer transition-all hover:bg-accent"
                                  } ${
                                    dish.selected
                                      ? "ring-2 ring-green-500 ring-offset-2 bg-green-50 border-green-300"
                                      : isTablePartiallySelected
                                      ? "ring-1 ring-yellow-400 ring-offset-1 bg-yellow-50 border-yellow-200"
                                      : cannotSelectDish
                                      ? "bg-gray-100 border-gray-300"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    !cannotSelectDish && handleDishClick(dish)
                                  }
                                  title={
                                    cannotSelectDish
                                      ? "🤖 Đã đạt giới hạn robot (3 món)"
                                      : undefined
                                  }
                                >
                                  <div
                                    className={`mr-3 w-6 h-6 border-2 rounded flex items-center justify-center ${
                                      cannotSelectDish
                                        ? "cursor-not-allowed bg-gray-200 border-gray-400"
                                        : "cursor-pointer"
                                    } transition-colors ${
                                      dish.selected
                                        ? "bg-green-500 border-green-700"
                                        : isTablePartiallySelected
                                        ? "bg-yellow-200 border-yellow-400"
                                        : cannotSelectDish
                                        ? "bg-gray-200 border-gray-400"
                                        : "bg-white border-gray-300 hover:border-gray-400"
                                    }`}
                                    onClick={(e) =>
                                      !cannotSelectDish &&
                                      handleIndividualToggle(dish, e)
                                    }
                                  >
                                    {dish.selected && (
                                      <svg
                                        className="w-4 h-4 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                    {isTablePartiallySelected &&
                                      !dish.selected && (
                                        <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                                      )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {/* Primary Info: Name + Size + Quantity + Table on same line */}
                                    <div className="flex items-start sm:items-center justify-between gap-2 mb-2 flex-wrap">
                                      <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-tight flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0 flex-1">
                                        <span className="truncate max-w-[120px] sm:max-w-none">
                                          {dish.name}
                                        </span>
                                        {dish.sizeName && (
                                          <span className="px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full border border-blue-200 flex-shrink-0">
                                            {dish.sizeName
                                              .charAt(0)
                                              .toUpperCase()}
                                          </span>
                                        )}
                                        <span className="text-xs sm:text-sm font-semibold text-gray-600 flex-shrink-0">
                                          x
                                          {dish.quantity > 0
                                            ? dish.quantity
                                            : 1}
                                        </span>
                                        <span className="text-gray-400 font-normal flex-shrink-0">
                                          -
                                        </span>
                                        <span className="text-xs sm:text-sm font-semibold text-gray-600 flex-shrink-0">
                                          Bàn {dish.tableNumber}
                                        </span>
                                      </h3>
                                      <div className="flex-shrink-0">
                                        {isTableFullySelected && (
                                          <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                            Toàn bàn
                                          </span>
                                        )}
                                        {isTablePartiallySelected && (
                                          <span className="text-[10px] sm:text-xs bg-yellow-100 text-yellow-700 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                            Một phần
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Note & Toppings */}
                                    {dish.note && (
                                      <div className="mt-1 text-[10px] sm:text-xs text-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 px-2 py-1 rounded-md border border-amber-200 break-words">
                                        <span className="font-semibold">
                                          Ghi chú:
                                        </span>{" "}
                                        <span className="break-words">
                                          {dish.note}
                                        </span>
                                      </div>
                                    )}
                                    {dish.toppings &&
                                      dish.toppings.length > 0 && (
                                        <div className="mt-1 text-[10px] sm:text-xs text-emerald-800 bg-gradient-to-r from-emerald-50 to-green-50 px-2 py-1 rounded-md border border-emerald-200 break-words">
                                          <span className="font-semibold">
                                            Toppings:
                                          </span>{" "}
                                          <span className="break-words">
                                            {dish.toppings.join(", ")}
                                          </span>
                                        </div>
                                      )}

                                    {/* Time badges - Horizontal layout with labels - Responsive */}
                                    <div className="flex items-center gap-1.5 sm:gap-3 mt-2 flex-wrap">
                                      <TooltipProvider>
                                        {dish.orderTime && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-gray-500 cursor-help hover:text-gray-700 transition-colors px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md hover:bg-gray-50 flex-shrink-0">
                                                <svg
                                                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 4v16m8-8H4"
                                                  />
                                                </svg>
                                                <span className="text-gray-600 font-semibold hidden sm:inline">
                                                  Tạo:
                                                </span>
                                                <span className="text-gray-500 truncate max-w-[100px] sm:max-w-none">
                                                  {formatTimeOnly(
                                                    dish.orderTime
                                                  )}
                                                </span>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Ngày giờ tạo món</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                        {dish.readyTime && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-emerald-600 cursor-help hover:text-emerald-700 transition-colors px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md hover:bg-emerald-50 flex-shrink-0">
                                                <svg
                                                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500 flex-shrink-0"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                  />
                                                </svg>
                                                <span className="text-emerald-700 font-semibold hidden sm:inline">
                                                  Ra món:
                                                </span>
                                                <span className="text-emerald-600 truncate max-w-[100px] sm:max-w-none">
                                                  {formatTimeOnly(
                                                    dish.readyTime
                                                  )}
                                                </span>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Ngày giờ ra món</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                        {activeTab === "đã phục vụ" &&
                                          dish.servedTime && (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-green-600 cursor-help hover:text-green-700 transition-colors px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md hover:bg-green-50 flex-shrink-0">
                                                  <svg
                                                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-500 flex-shrink-0"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                  </svg>
                                                  <span className="text-green-700 font-semibold hidden sm:inline">
                                                    Đã phục vụ:
                                                  </span>
                                                  <span className="text-green-600 truncate max-w-[100px] sm:max-w-none">
                                                    {formatTimeOnly(
                                                      dish.servedTime
                                                    )}
                                                  </span>
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Ngày giờ đã phục vụ</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          )}
                                      </TooltipProvider>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

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
                <h2 className="text-lg font-semibold">
                  Xác nhận yêu cầu làm lại
                </h2>
              </div>

              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn yêu cầu làm lại các món đã chọn? Hành động
                này sẽ chuyển các món sang trạng thái "Đang thực hiện".
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do làm lại
                </label>

                {/* Gợi ý */}
                {showSuggestions && remakeReason === "" && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Gợi ý lý do (nhấn để chọn):
                    </p>
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
                  readOnly
                  disabled
                  placeholder={
                    remakeReason === "" ? "Chọn lý do từ gợi ý bên trên..." : ""
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2
                             bg-gray-50 text-gray-700 cursor-not-allowed resize-none
                             focus:outline-none"
                />

                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {remakeReason === ""
                      ? "Vui lòng chọn lý do từ gợi ý bên trên"
                      : "Lý do đã chọn"}
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
                        description:
                          "Yêu cầu đã được gửi và món đã chuyển về trạng thái đang thực hiện.",
                      });
                      setShowRemakeConfirmation(false);
                      setRemakeReason("");
                      setShowSuggestions(true);
                    } else {
                      toast("Lỗi yêu cầu làm lại", {
                        description: "Có lỗi xảy ra khi gửi yêu cầu làm lại.",
                      });
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
