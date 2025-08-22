"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderStatus } from "@/types/kitchen";
import { WaiterDish } from "@/hooks/use-waiter-orders";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DishListProps {
  activeTab: OrderStatus;
  searchQuery: string;
  onDishToggle: (dishId: string) => void; // Changed from number to string
  dishes: WaiterDish[]; // Add dishes prop
  getDishesByStatus: (status: OrderStatus) => WaiterDish[]; // Add function prop
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

const DishList: React.FC<DishListProps> = ({
  activeTab,
  searchQuery,
  onDishToggle,
  dishes, // Destructure dishes prop
  getDishesByStatus, // Destructure getDishesByStatus prop
  onRequestRemake,
}) => {
  const [showRemakeConfirmation, setShowRemakeConfirmation] = useState(false);
  const [remakeReason, setRemakeReason] = useState("");
  // Get dishes for the active tab only - don't include selected dishes from other tabs
  const dishesForTab = getDishesByStatus(activeTab);
  const allDishesToShow = dishesForTab;


  // Filter dishes by search query
  const filteredDishes = allDishesToShow.filter((dish) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true; // Show all dishes if no search query
    
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
      <div className="p-4 text-center text-gray-500">
        {searchQuery
          ? "Không tìm thấy món ăn phù hợp"
          : "Không có món ăn nào trong trạng thái này"}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {Object.entries(groupedDishes).map(([categoryName, items]) => {
        const style = categoryStyle[categoryName] || categoryStyle["Khác"];

        return (
          <div key={categoryName} className="w-full">
            <div className="mb-2 text-sm font-semibold text-foreground uppercase tracking-wide">
              {style.label}
            </div>
            <ul className="space-y-3 w-full">
              {items.map((dish) => (
                <li key={dish.id}>
                  <div
                    className={`flex items-center px-4 py-3 rounded-xl border ${
                      style.bg
                    } ${
                      style.border
                    } cursor-pointer transition hover:bg-accent ${
                      dish.selected 
                        ? "ring-2 ring-green-500 ring-offset-2 bg-green-50 border-green-300" 
                        : ""
                    }`}
                    onClick={() => onDishToggle(dish.id)}
                  >
                    <div 
                      className={`mr-3 w-4 h-4 border-2 rounded flex items-center justify-center cursor-pointer transition-colors ${
                        dish.selected 
                          ? 'bg-green-500 border-green-500' 
                          : 'bg-white border-gray-300'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDishToggle(dish.id);
                      }}
                      title={`Selected: ${dish.selected}`}
                    >
                      {dish.selected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {dish.name} - Bàn {dish.tableNumber}{" "}
                        {dish.quantity > 1 && `(${dish.quantity})`}
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
              ))}
            </ul>
          </div>
        );
      })}
      {activeTab === "đã phục vụ" && (
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
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Xác nhận yêu cầu làm lại
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn yêu cầu làm lại các món đã chọn? Hành động này sẽ chuyển các món sang trạng thái "Yêu cầu làm lại".
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
                <Button onClick={() => setShowRemakeConfirmation(false)} variant="outline" className="flex-1">
                  Hủy
                </Button>
                <Button
                  disabled={remakeReason.trim().length === 0}
                  onClick={async () => {
                    if (remakeReason.trim().length === 0) return;
                    const ok = await onRequestRemake(remakeReason.trim());
                    if (ok) {
                      toast("Yêu cầu làm lại", { description: "Yêu cầu làm lại đã được gửi đi!" });
                      setShowRemakeConfirmation(false);
                      setRemakeReason("");
                    } else {
                      toast("Lỗi yêu cầu làm lại", { description: "Có lỗi xảy ra khi gửi yêu cầu làm lại." });
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
