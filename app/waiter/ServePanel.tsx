"use client";

import React, { useState } from "react";
import { MapPin, RotateCcw, Loader2, Send, Package, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { OrderStatus } from "@/types/kitchen";
import { WaiterDish } from "@/hooks/use-waiter-orders";
import { toast } from "sonner";
import { useQuickServe } from "@/hooks/use-quick-serve";
import { RestaurantMap } from "@/features/restaurant-map/RestaurantMap";
import { TABLE_POSITIONS } from "@/features/restaurant-map/constants";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

// Format time string to show only time (HH:mm:ss) - remove date
const formatTimeOnly = (timeStr?: string | null): string => {
  if (!timeStr) return '';

  // Try parsing format: "HH:mm:ss dd/MM/yyyy"
  const match1 = timeStr.match(/^(\d{2}):(\d{2}):(\d{2})\s+(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match1) {
    return `${match1[1]}:${match1[2]}:${match1[3]}`;
  }

  // Try parsing format: "dd/MM/yyyy HH:mm:ss"
  const match2 = timeStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
  if (match2) {
    const hours = match2[4].padStart(2, '0');
    return `${hours}:${match2[5]}:${match2[6]}`;
  }

  // Try parsing as ISO date
  const parsed = new Date(timeStr);
  if (!Number.isNaN(parsed.getTime())) {
    const pad = (value: number) => value.toString().padStart(2, '0');
    return `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
  }

  return timeStr;
};

interface ServePanelProps {
  activeTab: OrderStatus;
  onServe: () => Promise<boolean>;
  onRequestRemake: (reason?: string) => Promise<boolean>;
  hasSelected: boolean;
  dishes: WaiterDish[]; // Add dishes prop
  getDishesByStatus: (status: OrderStatus) => WaiterDish[];
  useRobotDelivery: boolean; // Robot delivery mode
  robotTrayLimit: number; // Max dishes for robot (3 trays)
  onToggleRobotMode: (enabled: boolean) => void; // Toggle robot mode
  tableLastUpdateTimes?: Record<number, string | null>; // Map tableNumber -> lastOrderUpdatedTime from API
  onTableSelect?: (tableNumbers: number[]) => void; // Select dishes by clicking on table in map
  onClearAllSelections?: () => void; // Clear all selections
}

/* Legacy MapPanel with iframe embed is kept for reference.
const MapPanel = ({ mapUrl }: { mapUrl: string | null }) => {
  ...
};
*/

interface MapPanelProps {
  readyTables: number[];
  readyTablesForCluster?: number[]; // Tables with Ready status for cluster highlighting
  servedTables: number[];
  selectedTables: number[];
  tableSequence: number[];
  isRobotMode: boolean;
  legacyMapUrl: string | null;
  dishes?: WaiterDish[];
  tableLastUpdateTimes?: Record<number, string | null>; // Map tableNumber -> lastOrderUpdatedTime from API
  onTableSelect?: (tableNumbers: number[]) => void; // Select dishes by clicking on table
  activeTab?: string; // Current tab for filtering selectable tables
  onClearAllSelections?: () => void; // Clear all selections
}

const MapPanel = ({
  readyTables,
  readyTablesForCluster,
  servedTables,
  selectedTables,
  tableSequence,
  isRobotMode,
  legacyMapUrl,
  dishes = [],
  tableLastUpdateTimes = {},
  onTableSelect,
  activeTab = "bắt đầu phục vụ",
  onClearAllSelections,
}: MapPanelProps) => {
  const [showMap, setShowMap] = useState(false);

  React.useEffect(() => {
    if (selectedTables.length > 0 || readyTables.length > 0 || servedTables.length > 0) {
      setShowMap(true);
    } else {
      setShowMap(false);
    }
  }, [readyTables, servedTables, selectedTables]);

  const getSelectedTableNumbers = () => {
    if (selectedTables.length > 0) {
      return selectedTables.join(", ");
    }
    if (!legacyMapUrl) return "";
    const urlParams = new URLSearchParams(legacyMapUrl.split("?")[1]);
    return urlParams.get("selected") || "";
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <div className="flex items-center justify-end gap-2 md:gap-3 mb-2">
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2 py-1 text-[10px] md:text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>Sẵn sàng</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2 py-1 text-[10px] md:text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Đang chọn</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2 py-1 text-[10px] md:text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <span>Đã phục vụ</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2 py-1 text-[10px] md:text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Không có món</span>
          </div>
        </div>
      </div>

      {showMap ? (
        <div className="flex-1 relative bg-gray-50 min-h-[260px] sm:min-h-[340px] md:min-h-[420px] lg:min-h-[520px]">
          {/* Clear all selections button - top right corner */}
          {onClearAllSelections && selectedTables.length > 0 && (
            <button
              onClick={onClearAllSelections}
              className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all"
              title="Xóa hết lựa chọn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xóa hết lựa chọn
            </button>
          )}
          <RestaurantMap
            readyTables={readyTables}
            readyTablesForCluster={readyTablesForCluster}
            servedTables={servedTables}
            selectedTables={selectedTables}
            tableSequence={tableSequence}
            isRobotMode={isRobotMode}
            dishes={dishes}
            tableLastUpdateTimes={tableLastUpdateTimes}
            onTableSelect={onTableSelect}
            activeTab={activeTab}
          />

          {/* Legacy iframe embed kept for fallback reference */}
          {/* {legacyMapUrl ? (
            <div className="absolute inset-0">
              <iframe
                key={legacyMapUrl}
                src={legacyMapUrl}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 w-full h-full rounded-2xl"
                title="Legacy Map Embed"
                style={{ border: "none", zIndex: 0 }}
              />
            </div>
          ) : null} */}
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-0">
          <div className="text-center max-w-sm p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Bản đồ nhà hàng</h3>
            <p className="text-gray-600 leading-relaxed text-base">
              {selectedTables.length > 0
                ? `Đang hiển thị đường đi cho bàn ${getSelectedTableNumbers()}`
                : "Chọn món để xem bản đồ với hướng dẫn đến bàn tương ứng"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const ServePanel: React.FC<ServePanelProps> = ({
  activeTab,
  onServe,
  onRequestRemake,
  hasSelected,
  dishes, // Destructure dishes prop
  getDishesByStatus, // Destructure getDishesByStatus prop
  useRobotDelivery,
  robotTrayLimit,
  onToggleRobotMode,
  tableLastUpdateTimes = {},
  onTableSelect,
  onClearAllSelections,
}) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  // Remake action is now handled in the left sidebar (DishList)
  // Remove the duplicate useWaiterOrders call

  // Get dishes for current tab
  const dishesForTab = getDishesByStatus(activeTab);

  console.log(dishesForTab);

  const normalizeCategory = (cat?: string) => {
    if (!cat) return "Khác";
    const c = cat.toLowerCase();
    if (
      c.includes("uống") ||
      c.includes("nuoc") ||
      c.includes("drink") ||
      c.includes("beverage")
    )
      return "Đồ Uống";
    if (c.includes("chính") || c.includes("main")) return "Món Chính";
    if (c.includes("tráng") || c.includes("dessert")) return "Tráng Miệng";
    if (c.includes("phục vụ nhanh") || c.includes("quick")) return "Phục vụ nhanh";
    return "Khác";
  };

  const categoryOrder = ["Đồ Uống", "Món Chính", "Tráng Miệng", "Phục vụ nhanh", "Khác"];

  const sortedDishesForTab = [...dishesForTab].sort(
    (a, b) =>
      categoryOrder.indexOf(normalizeCategory(a.categoryName)) -
      categoryOrder.indexOf(normalizeCategory(b.categoryName))
  );
  // console.log(
  //   "DishesForTab:",
  //   dishesForTab.map((d) => d.categoryName)
  // );
  // console.log(
  //   "Normalized:",
  //   dishesForTab.map((d) => normalizeCategory(d.categoryName))
  // );
  const groupedDishes = React.useMemo(() => {
    const groups: Record<string, WaiterDish[]> = {};
    sortedDishesForTab.forEach((dish) => {
      const cat = normalizeCategory(dish.categoryName);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(dish);
    });
    return groups;
  }, [sortedDishesForTab]);

  // Quick-serve requests
  const { requests, loading, fetchQuickRequestsForActiveTables, serveQuickRequest } = useQuickServe();

  // Always fetch - regardless of product map ready state
  // Quick-serve refresh is handled within useQuickServe via SignalR
  // Get ALL selected dishes (not just from current tab)
  const allSelectedDishes = dishes.filter((dish) => dish.selected);

  // Get selected dishes for the current tab
  const selectedDishes = dishes.filter((dish) => dish.selected && dish.status === activeTab);

  // Get table numbers by status
  const tableNumbersByStatus = React.useMemo(() => {
    // Get tables with orders ready to serve (blue) - for color display
    // Include tables with dishes in: "bắt đầu phục vụ", "đang chờ", or "đang thực hiện"
    const readyTablesForColor = Array.from(
      new Set(
        dishes
          .filter((dish) =>
            dish.status === "bắt đầu phục vụ" ||
            dish.status === "đang chờ" ||
            dish.status === "đang thực hiện"
          )
          .map((dish) => dish.tableNumber)
      )
    ).sort((a, b) => a - b);

    // Get tables with orders ready to serve (blue) - for cluster highlighting
    // Only include tables that have at least one dish with status "bắt đầu phục vụ" (Ready)
    const readyTablesForCluster = Array.from(
      new Set(
        dishes
          .filter((dish) => dish.status === "bắt đầu phục vụ")
          .map((dish) => dish.tableNumber)
      )
    ).sort((a, b) => a - b);

    // Get tables with served orders (yellow)
    // Exclude tables that ONLY have served quick-serve items (these are checked-out tables)
    const servedTables = Array.from(
      new Set(
        dishes
          .filter((dish) => dish.status === "đã phục vụ")
          .map((dish) => dish.tableNumber)
      )
    ).filter((tableNumber) => {
      // Check if this table has any non-quick-serve dishes OR any non-served dishes
      // If it only has served quick-serve items, it's a checked-out table
      const tableDishes = dishes.filter((dish) => dish.tableNumber === tableNumber);
      const hasNonQuickServeDish = tableDishes.some((dish) => !dish.isQuickServe);
      const hasNonServedDish = tableDishes.some((dish) => dish.status !== "đã phục vụ");
      // Show as yellow only if table has regular dishes or non-served items
      return hasNonQuickServeDish || hasNonServedDish;
    }).sort((a, b) => a - b);

    // Get selected tables (red pathways) - multiple tables can be selected
    const selectedTables = Array.from(
      new Set(allSelectedDishes.map((dish) => dish.tableNumber))
    ).sort((a, b) => a - b);

    return {
      ready: readyTablesForColor,
      readyForCluster: readyTablesForCluster,
      served: servedTables,
      selected: selectedTables,
    };
  }, [dishes, allSelectedDishes]);

  const selectedTableSequence = React.useMemo(() => {
    const selectedTablesList = Array.from(new Set(allSelectedDishes.map(dish => dish.tableNumber)));

    if (selectedTablesList.length === 0) {
      return [];
    }

    // Waiter mode staff position: { x: 90, y: 300 }
    const staffPosition = { x: 90, y: 300 };

    // Calculate Euclidean distance between two positions
    const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }): number => {
      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Nearest neighbor algorithm with STRICT priority for Bàn 1
    const sequence: number[] = [];
    const remaining = new Set(selectedTablesList);
    let currentPosition = staffPosition;

    // STRICT PRIORITY: If Bàn 1 is in the selected list, ALWAYS start from Bàn 1 first
    // This ensures Bàn 1 goes first regardless of distance
    if (remaining.has(1)) {
      sequence.push(1);
      remaining.delete(1);
      currentPosition = TABLE_POSITIONS[1];
    } else {
      // If Bàn 1 is not selected, start from nearest table to staff
      let nearestToStaff: number | null = null;
      let nearestDistanceToStaff = Infinity;

      remaining.forEach((tableId) => {
        const tablePos = TABLE_POSITIONS[tableId];
        if (!tablePos) return;

        const distance = calculateDistance(staffPosition, tablePos);
        if (distance < nearestDistanceToStaff) {
          nearestDistanceToStaff = distance;
          nearestToStaff = tableId;
        }
      });

      if (nearestToStaff !== null) {
        sequence.push(nearestToStaff);
        remaining.delete(nearestToStaff);
        currentPosition = TABLE_POSITIONS[nearestToStaff];
      }
    }

    // Continue with nearest neighbor algorithm from current position
    // This will sort remaining tables by distance from the current position
    while (remaining.size > 0) {
      let nearestTable: number | null = null;
      let nearestDistance = Infinity;
      const TOLERANCE = 0.01; // Small tolerance for floating point comparison
      const SAME_ROW_THRESHOLD = 100; // If two tables are in the same row and within 100px distance difference, prefer smaller number

      // Find the nearest table from current position
      // If multiple tables have the same distance (within tolerance), prefer the one with smaller table number
      remaining.forEach((tableId) => {
        const tablePos = TABLE_POSITIONS[tableId];
        if (!tablePos) return;

        const distance = calculateDistance(currentPosition, tablePos);
        const currentNearestPos = nearestTable ? TABLE_POSITIONS[nearestTable] : null;

        // If this table is closer, choose it
        if (distance < nearestDistance - TOLERANCE) {
          nearestDistance = distance;
          nearestTable = tableId;
        } else if (Math.abs(distance - nearestDistance) <= TOLERANCE) {
          // Same distance (within tolerance), prefer smaller table number
          if (tableId < (nearestTable ?? Infinity)) {
            nearestDistance = distance;
            nearestTable = tableId;
          }
        } else if (
          currentNearestPos &&
          Math.abs(tablePos.y - currentNearestPos.y) < 5 && // Same row (within 5px tolerance)
          distance < nearestDistance + SAME_ROW_THRESHOLD && // Within threshold
          tableId < (nearestTable ?? Infinity) // Smaller table number
        ) {
          // If two tables are in the same row and the farther one is within threshold, prefer smaller number
          nearestDistance = distance;
          nearestTable = tableId;
        }
      });

      // Add nearest table to sequence and update current position
      if (nearestTable !== null) {
        sequence.push(nearestTable);
        remaining.delete(nearestTable);
        currentPosition = TABLE_POSITIONS[nearestTable];
      } else {
        // Fallback: if no valid table found, break
        break;
      }
    }

    return sequence;
  }, [allSelectedDishes]);

  // Robot table sequence: Sort by nearest distance using nearest neighbor algorithm
  // Priority: ALWAYS start from Bàn 1 if it's in the selected list, regardless of selection order
  // Then sort remaining tables by nearest distance from Bàn 1 (or from staff if Bàn 1 not selected)
  const robotTableSequence = React.useMemo(() => {
    const selectedTablesList = [...tableNumbersByStatus.selected];

    if (selectedTablesList.length === 0) {
      return [];
    }

    // Robot mode staff position: { x: 90, y: 40 }
    const staffPosition = { x: 90, y: 40 };

    // Calculate Euclidean distance between two positions
    const calculateDistance = (pos1: { x: number; y: number }, pos2: { x: number; y: number }): number => {
      const dx = pos2.x - pos1.x;
      const dy = pos2.y - pos1.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Nearest neighbor algorithm with STRICT priority for Bàn 1
    const sequence: number[] = [];
    const remaining = new Set(selectedTablesList);
    let currentPosition = staffPosition;

    // STRICT PRIORITY: If Bàn 1 is in the selected list, ALWAYS start from Bàn 1 first
    // This ensures Bàn 1 goes first regardless of when it was selected
    if (remaining.has(1)) {
      sequence.push(1);
      remaining.delete(1);
      currentPosition = TABLE_POSITIONS[1];
    } else {
      // If Bàn 1 is not selected, start from nearest table to staff
      let nearestToStaff: number | null = null;
      let nearestDistanceToStaff = Infinity;

      remaining.forEach((tableId) => {
        const tablePos = TABLE_POSITIONS[tableId];
        if (!tablePos) return;

        const distance = calculateDistance(staffPosition, tablePos);
        if (distance < nearestDistanceToStaff) {
          nearestDistanceToStaff = distance;
          nearestToStaff = tableId;
        }
      });

      if (nearestToStaff !== null) {
        sequence.push(nearestToStaff);
        remaining.delete(nearestToStaff);
        currentPosition = TABLE_POSITIONS[nearestToStaff];
      }
    }

    // Continue with nearest neighbor algorithm from current position
    // This will sort remaining tables by distance from the current position
    while (remaining.size > 0) {
      let nearestTable: number | null = null;
      let nearestDistance = Infinity;
      const TOLERANCE = 0.01; // Small tolerance for floating point comparison
      const SAME_ROW_THRESHOLD = 100; // If two tables are in the same row and within 100px distance difference, prefer smaller number

      // Find the nearest table from current position
      // If multiple tables have the same distance (within tolerance), prefer the one with smaller table number
      remaining.forEach((tableId) => {
        const tablePos = TABLE_POSITIONS[tableId];
        if (!tablePos) return;

        const distance = calculateDistance(currentPosition, tablePos);
        const currentNearestPos = nearestTable ? TABLE_POSITIONS[nearestTable] : null;

        // If this table is closer, choose it
        if (distance < nearestDistance - TOLERANCE) {
          nearestDistance = distance;
          nearestTable = tableId;
        } else if (Math.abs(distance - nearestDistance) <= TOLERANCE) {
          // Same distance (within tolerance), prefer smaller table number
          if (tableId < (nearestTable ?? Infinity)) {
            nearestDistance = distance;
            nearestTable = tableId;
          }
        } else if (
          currentNearestPos &&
          Math.abs(tablePos.y - currentNearestPos.y) < 5 && // Same row (within 5px tolerance)
          distance < nearestDistance + SAME_ROW_THRESHOLD && // Within threshold
          tableId < (nearestTable ?? Infinity) // Smaller table number
        ) {
          // If two tables are in the same row and the farther one is within threshold, prefer smaller number
          nearestDistance = distance;
          nearestTable = tableId;
        }
      });

      // Add nearest table to sequence and update current position
      if (nearestTable !== null) {
        sequence.push(nearestTable);
        remaining.delete(nearestTable);
        currentPosition = TABLE_POSITIONS[nearestTable];
      } else {
        // Fallback: if no valid table found, break
        break;
      }
    }

    return sequence;
  }, [tableNumbersByStatus.selected]);

  // Generate map URL with table statuses
  const mapUrl = React.useMemo(() => {
    const baseUrl = `https://my-app-henna-three.vercel.app/`;
    const params = new URLSearchParams();

    // Add ready tables (blue)
    if (tableNumbersByStatus.ready.length > 0) {
      params.append("ready", tableNumbersByStatus.ready.join(","));
    }

    // Add served tables (yellow)
    if (tableNumbersByStatus.served.length > 0) {
      params.append("served", tableNumbersByStatus.served.join(","));
    }

    // Add selected tables (red pathways)
    if (tableNumbersByStatus.selected.length > 0) {
      params.append("selected", tableNumbersByStatus.selected.join(","));
    }

    // Add isRobot parameter when robot delivery mode is enabled
    if (useRobotDelivery) {
      params.append("isRobot", "true");
    }

    const queryString = params.toString();
    if (queryString) {
      return `${baseUrl}?${queryString}`;
    }
    return baseUrl;
  }, [tableNumbersByStatus, useRobotDelivery]);

  // Update selected table when dishes change
  React.useEffect(() => {
    if (selectedDishes.length > 0) {
      setSelectedTable(selectedDishes[0].tableNumber);
    } else if (dishesForTab.length > 0) {
      // If no dishes are selected, use the first dish in the current tab
      setSelectedTable(dishesForTab[0].tableNumber);
    } else {
      setSelectedTable(null);
    }
  }, [selectedDishes, dishesForTab]);

  const handleServeClick = async () => {
    const success = await onServe();
    if (success) {
      toast("Đã phục vụ", {
        description: "Các món đã được phục vụ thành công!",
      });
      // Reset selected table to hide the map
      setSelectedTable(null);
    } else {
      toast("Lỗi phục vụ", {
        description: "Có lỗi xảy ra khi phục vụ món ăn.",
      });
    }
  };

  // Request remake logic moved to DishList; keep no-op here if referenced

  const getTabTitle = () => {
    switch (activeTab) {
      case "đang thực hiện":
        return "Món đang được giao";
      case "bắt đầu phục vụ":
        return "Món sẵn sàng phục vụ";
      case "yêu cầu làm lại":
        return "Món yêu cầu làm lại";
      case "đã phục vụ":
        return "Món đã phục vụ";
      default:
        return "Chọn món để phục vụ";
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case "đang thực hiện":
        return "Các món đang được chế biến trong bếp";
      case "bắt đầu phục vụ":
        return "Các món đã sẵn sàng để phục vụ khách hàng";
      case "yêu cầu làm lại":
        return "Các món khách hàng yêu cầu làm lại";
      case "đã phục vụ":
        return "Các món đã được phục vụ thành công";
      default:
        return "Vui lòng chọn ít nhất 1 món...";
    }
  };

  return (
    <div className="flex-1 px-3 md:px-4 flex flex-col items-center bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-3xl md:max-w-4xl">
        {/* <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800 text-center">
          {getTabTitle()}
        </h2> */}

        {/* <p className="text-sm text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          {getTabDescription()}
        </p> */}

        <div className="w-full mb-6">
          {/* Quick Serve Requests Panel - Hidden per requirement */}

          {/* Robot delivery mode UI has been moved to DishList (left sidebar) */}

          {activeTab === "bắt đầu phục vụ" || activeTab === "phục vụ nhanh" ? (
            <MapPanel
              readyTables={tableNumbersByStatus.ready}
              readyTablesForCluster={tableNumbersByStatus.readyForCluster}
              servedTables={tableNumbersByStatus.served}
              selectedTables={tableNumbersByStatus.selected}
              tableSequence={useRobotDelivery ? robotTableSequence : selectedTableSequence}
              isRobotMode={useRobotDelivery}
              legacyMapUrl={mapUrl}
              dishes={dishes}
              tableLastUpdateTimes={tableLastUpdateTimes}
              onTableSelect={onTableSelect}
              activeTab={activeTab}
              onClearAllSelections={onClearAllSelections}
            />
          ) : dishesForTab.length > 0 ? (
            activeTab === "đã phục vụ" ? (
              // For "đã phục vụ" tab, don't show map, just show the list
              <div className="w-full bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Danh sách món đã phục vụ ({dishesForTab.length})
                </h3>
                {/* <ul className="space-y-3"> */}
                <div>
                  {categoryOrder.map((cat) =>
                    groupedDishes[cat] && groupedDishes[cat].length > 0 ? (
                      <div key={cat} className="mb-4">
                        <div className="font-semibold text-base text-gray-700 mb-2">
                          {cat}
                        </div>
                        <ul className="space-y-3">
                          {groupedDishes[cat].map((d) => (
                            <li
                              key={d.id}
                              className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-100"
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-800 font-medium">
                                    {d.name} - Bàn {d.tableNumber}
                                  </span>
                                  {d.quantity > 1 && (
                                    <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                      {d.quantity}
                                    </span>
                                  )}
                                </div>
                                {/* Time badges - Horizontal layout with labels */}
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <TooltipProvider>
                                    {d.orderTime && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-gray-500 cursor-help hover:text-gray-700 transition-colors px-1.5 py-0.5 rounded-md hover:bg-gray-50 flex-shrink-0">
                                            <svg className="w-3 h-3 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="text-gray-600 font-semibold hidden sm:inline">Tạo:</span>
                                            <span className="text-gray-500">{formatTimeOnly(d.orderTime)}</span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Ngày giờ tạo món</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    {d.readyTime && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-emerald-600 cursor-help hover:text-emerald-700 transition-colors px-1.5 py-0.5 rounded-md hover:bg-emerald-50 flex-shrink-0">
                                            <svg className="w-3 h-3 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-emerald-700 font-semibold hidden sm:inline">Ra món:</span>
                                            <span className="text-emerald-600">{formatTimeOnly(d.readyTime)}</span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Ngày giờ ra món</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    {activeTab === "đã phục vụ" && d.servedTime && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-green-600 cursor-help hover:text-green-700 transition-colors px-1.5 py-0.5 rounded-md hover:bg-green-50 flex-shrink-0">
                                            <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-green-700 font-semibold hidden sm:inline">Đã phục vụ:</span>
                                            <span className="text-green-600">{formatTimeOnly(d.servedTime)}</span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Ngày giờ đã phục vụ</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </TooltipProvider>
                                </div>
                                {d.note && (
                                  <div className="text-xs text-orange-600 mt-1">
                                    Ghi chú: {d.note}
                                  </div>
                                )}
                                {d.sizeName && (
                                  <div className="text-xs text-blue-600">
                                    Size: {d.sizeName}
                                  </div>
                                )}
                                {d.toppings && d.toppings.length > 0 && (
                                  <div className="text-xs text-purple-600">
                                    Toppings: {d.toppings.join(", ")}
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            ) : (
              // For other tabs, show the map
              <div className="flex-1 relative bg-gray-50 min-h-[260px] sm:min-h-[340px] md:min-h-[420px] lg:min-h-[520px]">
                <RestaurantMap
                  readyTables={tableNumbersByStatus.ready}
                  readyTablesForCluster={tableNumbersByStatus.readyForCluster}
                  servedTables={tableNumbersByStatus.served}
                  selectedTables={tableNumbersByStatus.selected}
                  tableSequence={useRobotDelivery ? robotTableSequence : selectedTableSequence}
                  isRobotMode={useRobotDelivery}
                  dishes={dishes}
                  tableLastUpdateTimes={tableLastUpdateTimes}
                  onTableSelect={onTableSelect}
                  activeTab={activeTab}
                />
              </div>
            )
          ) : (
            <div className="w-full h-[400px] flex items-center justify-center bg-white rounded-2xl shadow-lg border-2 border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium text-lg">
                  {activeTab === "đã phục vụ"
                    ? "Không có món nào đã phục vụ"
                    : (activeTab as OrderStatus) === "phục vụ nhanh"
                      ? "Không có yêu cầu phục vụ nhanh"
                      : `Không có món nào trong trạng thái "${activeTab}"`}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {activeTab === "đã phục vụ"
                    ? "Các món đã phục vụ sẽ hiển thị ở đây"
                    : (activeTab as OrderStatus) === "phục vụ nhanh"
                      ? "Các yêu cầu phục vụ nhanh từ moderator sẽ hiển thị ở đây"
                      : "Hãy chờ đợi hoặc chuyển sang tab khác"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Show serve button for "bắt đầu phục vụ" and "phục vụ nhanh" tabs */}
        {(activeTab === "bắt đầu phục vụ" || activeTab === "phục vụ nhanh") && hasSelected && (
          <div className="w-full flex justify-center gap-4 mb-6">
            <Button
              onClick={handleServeClick}
              className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {useRobotDelivery ? '🤖 Phục vụ bằng Robot' : '🚀 Phục vụ'}
            </Button>
            {/* <Button
              onClick={() => setShowRemakeConfirmation(true)}
              className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              🔄 Yêu cầu làm lại
            </Button> */}
          </div>
        )}

        {/* Remake confirmation modal removed; now located in DishList */}

        {/* Show tab-specific information */}
        {activeTab === "đang thực hiện" && dishesForTab.length > 0 && (
          <div className="w-full mb-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-lg text-blue-800 mb-3 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              Món đang chế biến ({dishesForTab.length})
            </h3>
            <p className="text-blue-700 leading-relaxed">
              Các món này đang được chế biến trong bếp. Vui lòng chờ đến khi
              chúng chuyển sang trạng thái "Bắt đầu phục vụ".
            </p>
          </div>
        )}

        {activeTab === "yêu cầu làm lại" && dishesForTab.length > 0 && (
          <div className="w-full mb-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
            <h3 className="font-semibold text-lg text-orange-800 mb-3 flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
              Món yêu cầu làm lại ({dishesForTab.length})
            </h3>
            <p className="text-orange-700 leading-relaxed mb-4">
              Khách hàng đã yêu cầu làm lại các món này. Vui lòng liên hệ với
              bếp để xử lý.
            </p>
            <ul className="space-y-3">
              {categoryOrder.map((cat) =>
                groupedDishes[cat] && groupedDishes[cat].length > 0 ? (
                  <div key={cat} className="mb-4">
                    <div className="font-semibold text-base text-gray-700 mb-2">
                      {cat}
                    </div>
                    <ul className="space-y-3">
                      {groupedDishes[cat].map((d) => (
                        <li
                          key={d.id}
                          className="flex items-center justify-between py-3 px-4 bg-white rounded-lg border border-orange-100"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-800 font-medium">
                                {d.name} - Bàn {d.tableNumber}
                              </span>
                              {d.quantity > 1 && (
                                <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                  {d.quantity}
                                </span>
                              )}
                            </div>
                            {/* Hiển thị lý do yêu cầu làm lại nếu có */}
                            {d.note && (
                              <div className="text-xs text-red-600 mt-1">
                                Lý do khách yêu cầu làm lại: {d.note}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}
            </ul>
          </div>
        )}

        {activeTab === "phục vụ nhanh" && dishesForTab.length > 0 && (
          <div className="w-full mb-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <h3 className="font-semibold text-lg text-purple-800 mb-3 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
              Yêu cầu phục vụ nhanh ({dishesForTab.length})
            </h3>
            <p className="text-purple-700 leading-relaxed">
              Các yêu cầu phục vụ nhanh từ khách hàng (ví dụ: thêm nước mắm, nước tương).
              Vui lòng phục vụ ngay và đánh dấu đã xử lý sau khi hoàn thành.
            </p>
          </div>
        )}

        {activeTab === "đã phục vụ" && dishesForTab.length > 0 && (
          <div className="w-full mb-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-lg text-green-800 mb-3 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Món đã phục vụ thành công ({dishesForTab.length})
            </h3>
            <p className="text-green-700 leading-relaxed">
              Các món này đã được phục vụ thành công cho khách hàng. Hệ thống sẽ
              tự động cập nhật trạng thái.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServePanel;
