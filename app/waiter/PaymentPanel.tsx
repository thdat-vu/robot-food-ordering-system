"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePayment, PaymentOrder } from "@/hooks/use-payment";

export default function PaymentPanel({
  onPaymentComplete,
}: {
  onPaymentComplete: () => void;
}) {
  const [showList, setShowList] = useState(true);
  const {
    tables,
    selectedTable,
    selectedTableName,
    setSelectedTable,
    tableOrders,
    isLoading,
    error,
    paymentStatus,
    calculateTotal,
    initiatePayment,
    confirmMoneyReceived,
    refreshOrders,
  } = usePayment();

  const total = calculateTotal();

 const handlePrint = () => {
  if (!selectedTable || tableOrders.length === 0) return;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    const tableName = selectedTableName || `Bàn ${selectedTable}`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Hóa đơn ${tableName}</title>
          <style>
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              background: #f8fafc;
              padding: 0;
              margin: 0;
            }
            .bill-container {
              max-width: 420px;
              margin: 32px auto;
              background: #fff;
              border-radius: 16px;
              box-shadow: 0 4px 24px #0001;
              padding: 32px 28px 24px 28px;
              border: 1.5px solid #e2e8f0;
            }
            .bill-header {
              text-align: center;
              margin-bottom: 18px;
            }
            .bill-logo {
              width: 54px;
              margin-bottom: 8px;
              opacity: 0.95;
            }
            .bill-title {
              font-size: 1.5rem;
              font-weight: bold;
              color: #059669;
              letter-spacing: 1px;
              margin-bottom: 2px;
            }
            .bill-table {
              font-size: 1.1rem;
              font-weight: 500;
              color: #334155;
              margin-bottom: 8px;
            }
            .bill-status {
              font-size: 0.98rem;
              color: #64748b;
              margin-bottom: 12px;
            }
            ul.bill-list {
              list-style: none;
              padding: 0;
              margin: 0 0 12px 0;
              border-top: 1.5px solid #e2e8f0;
              border-bottom: 1.5px solid #e2e8f0;
            }
            ul.bill-list li {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 10px 0;
              border-bottom: 1px dashed #e2e8f0;
              font-size: 1rem;
            }
            ul.bill-list li:last-child {
              border-bottom: none;
            }
            .item-info {
              max-width: 220px;
            }
            .item-name {
              font-weight: 500;
              color: #0f172a;
            }
            .item-detail {
              font-size: 0.93em;
              color: #64748b;
              margin-left: 2px;
            }
            .item-topping {
              font-size: 0.92em;
              color: #16a34a;
              margin-left: 2px;
            }
            .item-price {
              font-weight: 600;
              color: #059669;
              white-space: nowrap;
              margin-left: 8px;
            }
            .bill-total {
              font-size: 1.18rem;
              font-weight: bold;
              color: #059669;
              text-align: right;
              margin-top: 16px;
              margin-bottom: 8px;
            }
            .bill-footer {
              font-size: 0.98rem;
              color: #64748b;
              text-align: center;
              margin-top: 18px;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="bill-container">
            <div class="bill-header">
              <img class="bill-logo" src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png" alt="Logo" />
              <div class="bill-title">HÓA ĐƠN THANH TOÁN</div>
              <div class="bill-table">${tableName}</div>
              <div class="bill-status">Trạng thái: Đơn hàng đang phục vụ (Delivering)</div>
            </div>
            <ul class="bill-list">
              ${tableOrders
                .flatMap((order) =>
                  order.items.map((item) => {
                    const itemPrice = (item.price || 0) * (item.quantity || 1);
                    const toppingsPrice = item.toppings.reduce(
                      (sum, t) => sum + (t.price || 0) * (item.quantity || 1),
                      0
                    );
                    const totalItemPrice = itemPrice + toppingsPrice;
                    return `<li>
                      <div class="item-info">
                        <span class="item-name">${item.productName}</span>
                        ${item.sizeName ? `<span class="item-detail">(${item.sizeName})</span>` : ""}
                        ${item.quantity > 1 ? `<span class="item-detail">x${item.quantity}</span>` : ""}
                        ${
                          item.toppings.length > 0
                            ? `<div class="item-topping">+ ${item.toppings.map((t) => t.name).join(", ")}</div>`
                            : ""
                        }
                      </div>
                      <span class="item-price">${totalItemPrice.toLocaleString("vi-VN")}đ</span>
                    </li>`;
                  })
                )
                .join("")}
            </ul>
            <div class="bill-total">Tổng cộng: ${total.toLocaleString("vi-VN")}đ</div>
            <div class="bill-footer">
              Thời gian: ${new Date().toLocaleString()}<br/>
              Xin cảm ơn quý khách!<br/>
              --- SEB Waiter ---
            </div>
          </div>
          <script>
            window.onload = function () {
              window.print();
              window.onafterprint = function () {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  }
};

  const handlePayment = async () => {
    if (!selectedTable || tableOrders.length === 0) {
      toast("Lỗi", { description: "Không có đơn hàng nào để thanh toán" });
      return;
    }

    try {
      // Process payment for each order
      const paymentPromises = tableOrders.map((order) =>
        initiatePayment(order.id)
      );
      const results = await Promise.all(paymentPromises);

      const successCount = results.filter((r) => r.success).length;

      if (successCount === tableOrders.length) {
        handlePrint();
        toast("Thanh toán thành công", {
          description: `${
            selectedTableName || `Bàn ${selectedTable}`
          } - ${total.toLocaleString("vi-VN")}đ`,
        });
      } else {
        toast("Lỗi thanh toán", {
          description: "Một số đơn hàng không thể thanh toán",
        });
      }
    } catch (err) {
      toast("Lỗi thanh toán", {
        description: "Có lỗi xảy ra khi thanh toán",
      });
    }
  };

  const handleConfirmMoneyReceived = () => {
    const result = confirmMoneyReceived();
    if (result.success) {
      toast("Xác nhận thành công", {
        description: "Đã xác nhận nhận tiền và trả tiền thừa",
      });
      setSelectedTable(null);
      onPaymentComplete();
    }
  };

  if (error) {
    return (
      <div className="flex flex-col md:flex-row gap-6 w-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Thử lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap- w-full">
      {/* Table Selection */}
      {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:w-1/2"> */}
      {/* <div className="flex flex-wrap md:w-1/2 p-0 m-0">
        {tables.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-muted-foreground w-full">
            <p>Không có bàn nào</p>
          </div>
        ) : (
          tables.map((table) => (
            <Button
              key={table.id}
              variant={selectedTable === table.id ? "default" : "outline"}
              className="h-20 text-lg font-bold rounded-none border-0 m-0 p-0 w-[100px] flex-shrink-0"
              onClick={() => setSelectedTable(table.id)}
              style={{}}
            >
              {table.name}
            </Button>
          ))
        )}
      </div> */}
      <div className="grid grid-cols-6 w-full">
        {tables.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-muted-foreground w-full">
            <p>Không có bàn nào</p>
          </div>
        ) : (
          tables.map((table) => (
            <Button
              key={table.id}
              variant={selectedTable === table.id ? "default" : "outline"}
              className="text-lg font-bold rounded-none border-0 w-[100px] h-[60px] flex-shrink-0"
              onClick={() => setSelectedTable(table.id)}
            >
              {table.name}
            </Button>
          ))
        )}
      </div>

      {/* Payment Details */}
      <div className="w-full md:w-1/2 space-y-6">
        {selectedTable && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Thanh toán - {selectedTableName || `Bàn ${selectedTable}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Chỉ hiển thị đơn hàng đang phục vụ (Delivering)
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Đang tải đơn hàng...</span>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="px-0 mb-3"
                    onClick={() => setShowList(!showList)}
                  >
                    {showList ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" /> Ẩn món đã đặt
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" /> Xem món đã đặt
                      </>
                    )}
                  </Button>

                  {showList && (
                    <div className="max-h-80 overflow-y-auto pr-2 mb-4">
                      {tableOrders.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">
                          Không có đơn hàng đang phục vụ cho bàn này.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {tableOrders.map((order) => (
                            <div key={order.id} className="space-y-2">
                              <h4 className="font-semibold text-sm text-gray-600">
                                Đơn hàng #{order.id.slice(0, 8)} -{" "}
                                {order.status}
                              </h4>
                              <ul className="space-y-2">
                                {order.items.map((item) => {
                                  const itemPrice =
                                    (item.price || 0) * (item.quantity || 1); // Add safety checks
                                  const toppingsPrice = item.toppings.reduce(
                                    (sum, t) =>
                                      sum +
                                      (t.price || 0) * (item.quantity || 1),
                                    0
                                  );
                                  const totalItemPrice =
                                    itemPrice + toppingsPrice;

                                  return (
                                    <li
                                      key={item.id}
                                      className="flex justify-between border-b pb-2 text-sm"
                                    >
                                      <div className="flex-1">
                                        <span className="font-medium">
                                          {item.productName}
                                        </span>
                                        {item.sizeName && (
                                          <span className="text-gray-500 ml-1">
                                            ({item.sizeName})
                                          </span>
                                        )}
                                        {item.quantity > 1 && (
                                          <span className="text-gray-500 ml-1">
                                            x{item.quantity}
                                          </span>
                                        )}
                                        {item.toppings.length > 0 && (
                                          <div className="text-xs text-gray-500 ml-2">
                                            +{" "}
                                            {item.toppings
                                              .map((t) => t.name)
                                              .join(", ")}
                                          </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                          {(item.price || 0).toLocaleString(
                                            "vi-VN"
                                          )}
                                          đ × {item.quantity || 1} ={" "}
                                          {itemPrice.toLocaleString("vi-VN")}đ
                                          {toppingsPrice > 0 &&
                                            ` + ${toppingsPrice.toLocaleString(
                                              "vi-VN"
                                            )}đ (toppings)`}
                                        </div>
                                      </div>
                                      <span className="font-semibold text-emerald-600">
                                        {totalItemPrice.toLocaleString("vi-VN")}
                                        đ
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                              <div className="text-right text-sm font-medium text-gray-700 pt-2 border-t">
                                Tổng đơn hàng:{" "}
                                {order.totalPrice.toLocaleString("vi-VN")}đ
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <Separator className="my-4" />
                  <div className="flex justify-between text-base font-semibold mb-4">
                    <span>Tổng cộng</span>
                    <span className="text-emerald-700">
                      {total.toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  {/* Payment Buttons */}
                  {tableOrders.length > 0 && (
                    <div className="space-y-3">
                      <Button
                        className="w-full text-base font-semibold"
                        onClick={handlePayment}
                        disabled={paymentStatus === "processing"}
                      >
                        {paymentStatus === "processing" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          "Xác nhận thanh toán"
                        )}
                      </Button>

                      {paymentStatus === "success" && (
                        <Button
                          variant="outline"
                          className="w-full text-base font-semibold"
                          onClick={handleConfirmMoneyReceived}
                        >
                          Xác nhận đã nhận tiền
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
