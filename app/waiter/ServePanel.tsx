"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useWaiterOrders, WaiterDish } from "@/hooks/use-waiter-orders";
import { OrderStatus } from "@/types/kitchen";
import {
  MapPin,
  Navigation,
  ArrowRight,
  Users,
  Clock,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServePanelProps {
  activeTab: OrderStatus;
  onServe: () => Promise<boolean>;
  hasSelected: boolean;
}

const MapPanel = ({ selectedTable }: { selectedTable: number | null }) => {
  const [fromTable, setFromTable] = useState<string>("");
  const [toTable, setToTable] = useState<string>("");
  const [showNavigation, setShowNavigation] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const tables = Array.from({ length: 6 }, (_, i) => i + 1);

  const handleShowNavigation = () => {
    if (fromTable && toTable) {
      setShowNavigation(true);
      setShowMap(true);
    }
  };

  const handleResetNavigation = () => {
    setShowNavigation(false);
    setShowMap(false);
    setFromTable("");
    setToTable("");
  };

  const handleShowSingleTableMap = () => {
    setShowMap(true);
    setShowNavigation(false);
  };

  const getNavigationUrl = () => {
    if (!fromTable || !toTable) return "";
    return `https://mapdto-production.up.railway.app/navigation?from=${fromTable}&to=${toTable}`;
  };

  return (
    <div className="w-full h-full max-h-[800px] md:max-h-[900px] flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Hướng dẫn đường đi</h3>
              <p className="text-blue-100 text-sm">Tìm đường đi giữa các bàn</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Trực tuyến</span>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-blue-100 mb-2">
                Điểm xuất phát
              </label>
              <Select value={fromTable} onValueChange={setFromTable}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 hover:bg-white/30 transition-colors">
                  <SelectValue placeholder="Chọn bàn từ..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {tables.map((table) => (
                    <SelectItem key={table} value={table.toString()}>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {table}
                          </span>
                        </div>
                        <span>Bàn {table}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
              <div className="text-xs text-blue-200 font-medium">Đến</div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-blue-100 mb-2">
                Điểm đến
              </label>
              <Select value={toTable} onValueChange={setToTable}>
                <SelectTrigger className="bg-white/20 border-white/30 text-white placeholder:text-blue-200 hover:bg-white/30 transition-colors">
                  <SelectValue placeholder="Chọn bàn đến..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {tables.map((table) => (
                    <SelectItem key={table} value={table.toString()}>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-sm">
                            {table}
                          </span>
                        </div>
                        <span>Bàn {table}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={handleShowNavigation}
              disabled={!fromTable || !toTable}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Tìm đường đi
            </Button>

            {selectedTable && !showMap && (
              <Button
                onClick={handleShowSingleTableMap}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                size="sm"
              >
                <MapPin className="w-4 h-4 mr-1" />
                Xem bản đồ
              </Button>
            )}

            {showMap && (
              <Button
                onClick={handleResetNavigation}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                size="sm"
              >
                Ẩn bản đồ
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Map Content - Only show when needed */}
      {showMap ? (
        <div className="flex-1 relative bg-gray-50 min-h-0">
          {showNavigation && fromTable && toTable ? (
            // Show navigation map
            <div className="relative h-full">
              <iframe
                src={getNavigationUrl()}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full"
                title="Navigation Map"
                style={{ border: "none" }}
              />

              {/* Navigation info overlay */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-xs border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-bold text-gray-800">
                    Hướng dẫn đường đi
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Từ:</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Bàn {fromTable}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Đến:</span>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Bàn {toTable}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedTable ? (
            // Show single table map
            <div className="relative h-full">
              <iframe
                src={`https://mapdto-production.up.railway.app/${selectedTable}`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full"
                title="Map Embed"
                style={{ border: "none" }}
              />

              {/* Single table info overlay */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">
                      Vị trí hiện tại
                    </span>
                    <div className="text-sm text-gray-600">
                      Bàn {selectedTable}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Loading indicator */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-gray-700 text-sm">
                {showNavigation
                  ? "Đang tải hướng dẫn..."
                  : "Đang tải bản đồ..."}
              </span>
            </div>
          </div>
        </div>
      ) : (
        // Empty state when map is not shown
        <div className="flex items-center justify-center flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-0">
          <div className="text-center max-w-sm p-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">
              Chọn tùy chọn để xem bản đồ
            </h3>
            <p className="text-gray-600 leading-relaxed text-base">
              {selectedTable
                ? "Chọn điểm xuất phát và điểm đến để tìm đường đi, hoặc nhấn 'Xem bản đồ' để xem vị trí hiện tại"
                : "Chọn món để xem vị trí bàn hoặc sử dụng hướng dẫn đường đi ở trên"}
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
  hasSelected,
}) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const { dishes, getDishesByStatus } = useWaiterOrders();

  // Get dishes for current tab
  const dishesForTab = getDishesByStatus(activeTab);

  // Get selected dishes for the current tab
  const selectedDishes = dishes.filter(
    (dish) => dish.selected && dish.status === activeTab
  );

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
    } else {
      toast("Lỗi phục vụ", {
        description: "Có lỗi xảy ra khi phục vụ món ăn.",
      });
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "đang thực hiện":
        return "Món đang được thực hiện";
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
                <ul className="space-y-3">
                  {dishesForTab.map((d) => (
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
            ) : (
              // For other tabs, show the map
              <MapPanel selectedTable={selectedTable} />
            )
          ) : (
            <div className="w-full h-[400px] flex items-center justify-center bg-white rounded-2xl shadow-lg border-2 border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
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
          <div className="w-full flex justify-center mb-6">
            <Button
              onClick={handleServeClick}
              className="px-8 py-4 text-lg rounded-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              🚀 Phục vụ
            </Button>
          </div>
        )}

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
            <p className="text-orange-700 leading-relaxed">
              Khách hàng đã yêu cầu làm lại các món này. Vui lòng liên hệ với
              bếp để xử lý.
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
