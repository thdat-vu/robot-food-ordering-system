"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import PaymentPanel from "./PaymentPanel";
import { useWaiterOrders, WaiterDish } from "@/hooks/use-waiter-orders";
import { NavigationTabs } from "@/components/waiter/NavigationTabs";

const MapPanel = ({ selectedTable }: { selectedTable: number | null }) => (
  <div className="w-full h-[340px] md:h-[460px] flex flex-col bg-muted rounded-2xl shadow-inner border border-border overflow-hidden">
    {selectedTable ? (
      <>
        <div className="bg-primary text-primary-foreground px-4 py-2 text-center font-semibold">
          Bàn {selectedTable}
        </div>
        <iframe
          src={`https://mapdto-production.up.railway.app/${selectedTable}`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="w-full flex-1"
          title="Map Embed"
          style={{ border: "none" }}
        />
      </>
    ) : (
      <div className="flex items-center justify-center text-muted-foreground flex-1">
        <p>Chọn món để xem vị trí bàn</p>
      </div>
    )}
  </div>
);

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
  "Đồ Uống": { label: "Đồ Uống", bg: "bg-blue-50", border: "border-blue-200" },
  Khác: { label: "Khác", bg: "bg-gray-50", border: "border-gray-200" },
};

const ServePanel: React.FC = () => {
  const [panel, setPanel] = useState<"control" | "payment">("control");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [search, setSearch] = useState(""); // State cho ô tìm kiếm
  const {
    dishes,
    groupedDishes,
    categories,
    hasSelected,
    isLoading,
    error,
    toggleDish,
    handleServe,
    refreshOrders,
  } = useWaiterOrders();

  const handleServeClick = async () => {
    const success = await handleServe();
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

  const handlePaymentComplete = () => {
    // Refresh orders after payment completion
    refreshOrders();
    setPanel("control");
  };

  const handleDishToggle = (dishId: number) => {
    // Find the dish to get its table number before toggling
    const dish = dishes.find((d) => d.id === dishId);
    const isCurrentlySelected = dish?.selected || false;

    toggleDish(dishId);

    if (dish) {
      if (!isCurrentlySelected) {
        // Dish is being selected, update the selected table
        setSelectedTable(dish.tableNumber);
      } else {
        // Dish is being deselected, check if there are other selected dishes
        const otherSelectedDishes = dishes.filter(
          (d) => d.selected && d.id !== dishId
        );
        if (otherSelectedDishes.length === 0) {
          // No dishes selected, clear the table
          setSelectedTable(null);
        } else {
          // Use the table number of the first selected dish
          setSelectedTable(otherSelectedDishes[0].tableNumber);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row p-4 gap-6 min-h-screen w-full bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Đang tải danh sách món ăn...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col md:flex-row p-4 gap-6 min-h-screen w-full bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={refreshOrders} variant="outline">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row p-4 gap-6 min-h-screen w-full bg-background">
      <div className="flex flex-col gap-4 items-center mr-4">
        <Button
          variant={panel === "control" ? "default" : "outline"}
          className="w-32"
          onClick={() => setPanel("control")}
        >
          Điều khiển
        </Button>
        <Button
          variant={panel === "payment" ? "default" : "outline"}
          className="w-32"
          onClick={() => setPanel("payment")}
        >
          Thanh toán
        </Button>
      </div>

      {panel === "control" ? (
        <>
          <div className="w-full md:max-w-[300px] overflow-y-auto max-h-[80vh] pr-2 space-y-6">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm món ăn..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-primary"
              />
            </div>
            {Object.entries(groupedDishes).map(([categoryName, items]) => {
              const style =
                categoryStyle[categoryName] || categoryStyle["Khác"];
              const filteredItems = items.filter((dish) =>
                dish.name.toLowerCase().includes(search.toLowerCase())
              );
              if (filteredItems.length === 0) return null;
              return (
                <div key={categoryName} className="w-full">
                  <div className="mb-2 text-sm font-semibold text-foreground uppercase tracking-wide">
                    {style.label}
                  </div>
                  <ul className="space-y-3 w-full">
                    {filteredItems
                      .filter((dish) => !dish.served)
                      .map((dish) => (
                        <li key={dish.id}>
                          <label
                            className={`flex items-center px-4 py-3 rounded-xl border ${
                              style.bg
                            } ${
                              style.border
                            } cursor-pointer transition hover:bg-accent ${
                              dish.selected
                                ? "ring-2 ring-primary ring-offset-2"
                                : ""
                            }`}
                          >
                            <Checkbox
                              checked={dish.selected}
                              onCheckedChange={() => handleDishToggle(dish.id)}
                              className="mr-3"
                            />
                            <span className="text-sm font-medium text-foreground">
                              {dish.name} - Bàn {dish.tableNumber}{" "}
                              {dish.quantity > 1 && `(${dish.quantity})`}
                            </span>
                          </label>
                        </li>
                      ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="flex-1 px-2 md:px-4 flex flex-col items-center">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-foreground text-center">
              Chọn món để phục vụ
            </h2>

            <div className="w-full min-h-[320px]">
              {hasSelected ? (
                <MapPanel selectedTable={selectedTable} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-base italic">
                  {dishes.length === 0
                    ? "Không có món nào sẵn sàng phục vụ"
                    : "Vui lòng chọn ít nhất 1 món..."}
                </div>
              )}
            </div>

            {hasSelected && (
              <div className="w-full flex justify-center">
                <Button
                  onClick={handleServeClick}
                  className="mt-6 mb-4 px-6 py-3 text-lg rounded-full"
                >
                  🚀 Phục vụ
                </Button>
              </div>
            )}

            {dishes.some((d) => d.served) && (
              <div className="w-full mt-2 bg-muted rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-sm text-foreground mb-2">
                  Món đã phục vụ
                </h3>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {dishes
                    .filter((d) => d.served)
                    .map((d) => (
                      <li key={d.id}>
                        {d.name} - Bàn {d.tableNumber}{" "}
                        {d.quantity > 1 && `(${d.quantity})`}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </>
      ) : (
        <PaymentPanel onPaymentComplete={handlePaymentComplete} />
      )}
    </div>
  );
};

export default ServePanel;
