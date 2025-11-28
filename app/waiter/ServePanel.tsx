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
}

/* Legacy MapPanel with iframe embed is kept for reference.
const MapPanel = ({ mapUrl }: { mapUrl: string | null }) => {
  ...
};
*/

interface MapPanelProps {
  readyTables: number[];
  servedTables: number[];
  selectedTables: number[];
  tableSequence: number[];
  isRobotMode: boolean;
  legacyMapUrl: string | null;
  dishes?: WaiterDish[];
}

const MapPanel = ({
  readyTables,
  servedTables,
  selectedTables,
  tableSequence,
  isRobotMode,
  legacyMapUrl,
  dishes = [],
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
          <RestaurantMap
            readyTables={readyTables}
            servedTables={servedTables}
            selectedTables={selectedTables}
            tableSequence={tableSequence}
            isRobotMode={isRobotMode}
            dishes={dishes}
            tableLastUpdateTimes={tableLastUpdateTimes}
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
    return "Khác";
  };

  const categoryOrder = ["Đồ Uống", "Món Chính", "Tráng Miệng", "Khác"];

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
  const { requests, loading, productMapReady, fetchQuickRequestsForActiveTables, serveQuickRequest } = useQuickServe();
  
  // Always fetch - regardless of product map ready state
  // Quick-serve refresh is handled within useQuickServe via SignalR
  // Get ALL selected dishes (not just from current tab)
  const allSelectedDishes = dishes.filter((dish) => dish.selected);

  // Get selected dishes for the current tab
  const selectedDishes = dishes.filter((dish) => dish.selected && dish.status === activeTab);

  // Get table numbers by status
  const tableNumbersByStatus = React.useMemo(() => {
    // Get tables with orders ready to serve (blue)
    const readyTables = Array.from(
      new Set(
        dishes
          .filter((dish) => dish.status === "bắt đầu phục vụ")
          .map((dish) => dish.tableNumber)
      )
    ).sort((a, b) => a - b);

    // Get tables with served orders (yellow)
    const servedTables = Array.from(
      new Set(
        dishes
          .filter((dish) => dish.status === "đã phục vụ")
          .map((dish) => dish.tableNumber)
      )
    ).sort((a, b) => a - b);

    // Get selected tables (red pathways) - multiple tables can be selected
    const selectedTables = Array.from(
      new Set(allSelectedDishes.map((dish) => dish.tableNumber))
    ).sort((a, b) => a - b);

    return {
      ready: readyTables,
      served: servedTables,
      selected: selectedTables,
    };
  }, [dishes, allSelectedDishes]);

  const selectedTableSequence = React.useMemo(() => {
    const sequence: number[] = [];
    const seen = new Set<number>();

    const sortedDishes = [...allSelectedDishes].sort((a, b) => {
      const timeA = a.orderTime ? new Date(a.orderTime).getTime() : Number.MAX_SAFE_INTEGER;
      const timeB = b.orderTime ? new Date(b.orderTime).getTime() : Number.MAX_SAFE_INTEGER;
      if (timeA !== timeB) return timeA - timeB;
      return a.tableNumber - b.tableNumber;
    });

    sortedDishes.forEach((dish) => {
      if (!seen.has(dish.tableNumber)) {
        sequence.push(dish.tableNumber);
        seen.add(dish.tableNumber);
      }
    });

    return sequence;
  }, [allSelectedDishes]);

  const robotTableSequence = React.useMemo(() => {
    return [...tableNumbersByStatus.selected].sort((a, b) => {
      const rowA = Math.floor((a - 1) / 5);
      const rowB = Math.floor((b - 1) / 5);
      if (rowA !== rowB) return rowA - rowB;
      return a - b;
    });
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
          {/* Quick Serve Requests Panel - Only show when NOT in quick-serve tab */}
          {requests.length > 0 && activeTab !== "phục vụ nhanh" && (
            <div className="w-full mb-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border-2 border-blue-300 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Yêu cầu phục vụ nhanh</h3>
                      <p className="text-xs text-blue-100">
                        {requests.length} yêu cầu đang chờ xử lý
                      </p>
                    </div>
                  </div>
                  {loading && (
                    <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-white">Đang tải...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Request List */}
              <div className="p-4 space-y-3">
                {requests.map((r, index) => (
                  <div 
                    key={r.complainId} 
                    className="bg-white rounded-xl shadow-md border border-blue-200 overflow-hidden hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between p-4">
                      {/* Request Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full text-white font-bold text-lg shadow-md">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-bold text-gray-900 text-base">
                              {r.tableName}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              Bàn
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 font-medium capitalize">
                              {r.productName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl"
                        onClick={async () => {
                          try {
                            await serveQuickRequest(r);
                            toast.success("Đã thêm món phục vụ nhanh", { 
                              description: `${r.tableName} - ${r.productName}`,
                              duration: 3000,
                            });
                            fetchQuickRequestsForActiveTables();
                          } catch (e) {
                            toast.error("Lỗi", { 
                              description: "Không thể phục vụ nhanh. Vui lòng thử lại.",
                              duration: 3000,
                            });
                          }
                        }}
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Phục vụ ngay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer hint */}
              <div className="bg-blue-600/10 px-5 py-2 border-t border-blue-200">
                <p className="text-xs text-blue-700 text-center">
                  💡 Bấm "Phục vụ ngay" để tự động thêm món vào order và đánh dấu đã xử lý
                </p>
              </div>
            </div>
          )}

          {/* Robot delivery mode UI has been moved to DishList (left sidebar) */}
          
          {activeTab === "bắt đầu phục vụ" || activeTab === "phục vụ nhanh" ? (
            <MapPanel
              readyTables={tableNumbersByStatus.ready}
              servedTables={tableNumbersByStatus.served}
              selectedTables={tableNumbersByStatus.selected}
            tableSequence={useRobotDelivery ? robotTableSequence : selectedTableSequence}
              isRobotMode={useRobotDelivery}
              legacyMapUrl={mapUrl}
              dishes={dishes}
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
                                {d.orderTime && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Đặt lúc: {d.orderTime}
                                  </div>
                                )}
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
                  servedTables={tableNumbersByStatus.served}
                  selectedTables={tableNumbersByStatus.selected}
                  tableSequence={useRobotDelivery ? robotTableSequence : selectedTableSequence}
                  isRobotMode={useRobotDelivery}
                  dishes={dishes}
                  tableLastUpdateTimes={tableLastUpdateTimes}
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
