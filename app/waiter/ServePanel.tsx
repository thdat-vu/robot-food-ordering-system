"use client";

import React, { useState } from "react";
import { MapPin, Eye, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { OrderStatus } from "@/types/kitchen";
import { WaiterDish } from "@/hooks/use-waiter-orders";
import { toast } from "sonner";

interface ServePanelProps {
  activeTab: OrderStatus;
  onServe: () => Promise<boolean>;
  onRequestRemake: (reason?: string) => Promise<boolean>;
  hasSelected: boolean;
  dishes: WaiterDish[]; // Add dishes prop
  getDishesByStatus: (status: OrderStatus) => WaiterDish[];
}

const MapPanel = ({ mapUrl }: { mapUrl: string | null }) => {
  const [showMap, setShowMap] = useState(false);

  // Auto-show map when mapUrl is available
  React.useEffect(() => {
    if (mapUrl) {
      setShowMap(true);
    } else {
      setShowMap(false);
    }
  }, [mapUrl]);

  const handleShowMap = () => {
    setShowMap(true);
  };

  const handleResetMap = () => {
    setShowMap(false);
  };

  const getTableNumbersFromUrl = () => {
    if (!mapUrl) return "";
    const urlParams = new URLSearchParams(mapUrl.split("?")[1]);
    return urlParams.get("tables") || "";
  };

  return (
    <div className="w-full h-full max-h-[800px] md:max-h-[900px] flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Hướng dẫn đến bàn</h3>
              <p className="text-blue-100 text-sm">
                Xem đường đi đến bàn được chọn
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Trực tuyến</span>
          </div>
        </div>

        {/* Map Controls */}
        {mapUrl && showMap && (
          <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleResetMap}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                size="sm"
              >
                Ẩn bản đồ
              </Button>
            </div>
          </div>
        )}

      
      </div>

      {/* Map Content - Only show when needed */}
      {showMap ? (
        <div className="flex-1 relative bg-gray-50 min-h-[600px]">
          {mapUrl ? (
            // Show map with selected table numbers
            <div className="relative h-full w-full">
              <iframe
                src={mapUrl}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full min-h-[600px]"
                title="Map Embed"
                style={{ border: "none", zIndex: 1 }}
              />
            </div>
          ) : null}
        </div>
      ) : (
        // Empty state when map is not shown
        <div className="flex items-center justify-center flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-0">
          <div className="text-center max-w-sm p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Bản đồ nhà hàng
            </h3>
            <p className="text-gray-600 leading-relaxed text-base">
              {mapUrl
                ? `Bản đồ sẽ hiển thị 6 bàn với hướng dẫn đến bàn ${getTableNumbersFromUrl()}`
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
  // Get ALL selected dishes (not just from current tab)
  const allSelectedDishes = dishes.filter((dish) => dish.selected);

  // Get selected dishes for the current tab
  const selectedDishes = dishes.filter(
    (dish) => dish.selected && dish.status === activeTab
  );

  // Get unique table numbers from all selected dishes
  const selectedTableNumbers = React.useMemo(() => {
    const uniqueNumbers = Array.from(
      new Set(allSelectedDishes.map((dish) => dish.tableNumber))
    );
    return uniqueNumbers.sort((a, b) => a - b); // Sort for consistency
  }, [allSelectedDishes]);

  // Generate map URL with all selected table numbers
  const mapUrl = React.useMemo(() => {
    const baseUrl = `https://my-app-henna-three.vercel.app/`;
    if (selectedTableNumbers.length > 0) {
      return `${baseUrl}?tables=${selectedTableNumbers.join(",")}`;
    }
    // Fallback to base map when nothing is selected
    return baseUrl;
  }, [selectedTableNumbers]);

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
    <div className="flex-1 px-4 md:px-6 flex flex-col items-center bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-4xl">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800 text-center">
          {getTabTitle()}
        </h2>

        <p className="text-sm text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          {getTabDescription()}
        </p>

        <div className="w-full mb-6">
          {dishesForTab.length > 0 ? (
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
              <MapPanel mapUrl={mapUrl} />
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
                    : `Không có món nào trong trạng thái "${activeTab}"`}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {activeTab === "đã phục vụ"
                    ? "Các món đã phục vụ sẽ hiển thị ở đây"
                    : "Hãy chờ đợi hoặc chuyển sang tab khác"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Show serve button only for "bắt đầu phục vụ" tab */}
        {activeTab === "bắt đầu phục vụ" && hasSelected && (
          <div className="w-full flex justify-center gap-4 mb-6">
            <Button
              onClick={handleServeClick}
              className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              🚀 Phục vụ
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
