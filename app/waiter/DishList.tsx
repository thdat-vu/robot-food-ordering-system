"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderStatus } from "@/types/kitchen";
import { useWaiterOrders, WaiterDish } from "@/hooks/use-waiter-orders";

interface DishListProps {
  activeTab: OrderStatus;
  searchQuery: string;
  onDishToggle: (dishId: number) => void;
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
}) => {
  const { getDishesByStatus } = useWaiterOrders();

  // Get dishes for the active tab
  const dishesForTab = getDishesByStatus(activeTab);

  // Filter dishes by search query
  const filteredDishes = dishesForTab.filter((dish) => {
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
                  <label
                    className={`flex items-center px-4 py-3 rounded-xl border ${
                      style.bg
                    } ${
                      style.border
                    } cursor-pointer transition hover:bg-accent ${
                      dish.selected ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                  >
                    <Checkbox
                      checked={dish.selected}
                      onCheckedChange={() => onDishToggle(dish.id)}
                      className="mr-3"
                    />
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
                  </label>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default DishList;
