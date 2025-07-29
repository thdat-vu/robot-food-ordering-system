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
    refreshOrders
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
              body { font-family: sans-serif; padding: 20px; }
              h2 { margin-bottom: 8px; }
              ul { list-style: none; padding: 0; margin: 8px 0; }
              li { display: flex; justify-content: space-between; margin-bottom: 4px; }
              .total { font-weight: bold; margin-top: 10px; font-size: 16px; }
              .footer { font-size: 12px; margin-top: 8px; }
            </style>
          </head>
          <body>
            <h2>HÓA ĐƠN THANH TOÁN</h2>
            <p><strong>Bàn:</strong> ${tableName}</p>
            <p><strong>Trạng thái:</strong> Đơn hàng đang phục vụ (Delivering)</p>
            <ul>
              ${tableOrders.flatMap(order => 
                order.items.map(item => {
                  const itemPrice = (item.price || 0) * (item.quantity || 1);
                  const toppingsPrice = item.toppings.reduce((sum, t) => sum + ((t.price || 0) * (item.quantity || 1)), 0);
                  const totalItemPrice = itemPrice + toppingsPrice;
                  return `<li><span>${item.productName} ${item.sizeName}${item.quantity > 1 ? ` (${item.quantity})` : ''}${item.toppings.length > 0 ? ` + ${item.toppings.map(t => t.name).join(', ')}` : ''}</span><span>${totalItemPrice.toLocaleString('vi-VN')}đ</span></li>`;
                })
              ).join("")}
            </ul>
            <div class="total">Tổng cộng: ${total.toLocaleString("vi-VN")}đ</div>
            <div class="footer">Thời gian: ${new Date().toLocaleString()}</div>
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
      const paymentPromises = tableOrders.map(order => initiatePayment(order.id));
      const results = await Promise.all(paymentPromises);
      
      const successCount = results.filter(r => r.success).length;
      
      if (successCount === tableOrders.length) {
        handlePrint();
        toast("Thanh toán thành công", {
          description: `${selectedTableName || `Bàn ${selectedTable}`} - ${total.toLocaleString("vi-VN")}đ`,
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
    <div className="flex flex-col md:flex-row gap-6 w-full">
      {/* Table Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:w-1/2">
        {tables.length === 0 ? (
          <div className="col-span-2 md:col-span-3 flex items-center justify-center h-20 text-muted-foreground">
            <p>Không có bàn nào</p>
          </div>
        ) : (
          tables.map((table) => (
            <Button
              key={table.id}
              variant={selectedTable === table.id ? "default" : "outline"}
              className="h-20 text-lg font-bold"
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
                    <>
                      {tableOrders.length === 0 ? (
                        <p className="text-muted-foreground text-sm italic">
                          Không có đơn hàng đang phục vụ cho bàn này.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {tableOrders.map((order) => (
                            <div key={order.id} className="space-y-2">
                              <h4 className="font-semibold text-sm text-gray-600">
                                Đơn hàng #{order.id.slice(0, 8)} - {order.status}
                              </h4>
                              <ul className="space-y-2">
                                {order.items.map((item) => {
                                  const itemPrice = (item.price || 0) * (item.quantity || 1); // Add safety checks
                                  const toppingsPrice = item.toppings.reduce((sum, t) => sum + ((t.price || 0) * (item.quantity || 1)), 0);
                                  const totalItemPrice = itemPrice + toppingsPrice;
                                  
                                  return (
                                    <li
                                      key={item.id}
                                      className="flex justify-between border-b pb-2 text-sm"
                                    >
                                      <div className="flex-1">
                                        <span className="font-medium">{item.productName}</span>
                                        {item.sizeName && <span className="text-gray-500 ml-1">({item.sizeName})</span>}
                                        {item.quantity > 1 && <span className="text-gray-500 ml-1">x{item.quantity}</span>}
                                        {item.toppings.length > 0 && (
                                          <div className="text-xs text-gray-500 ml-2">
                                            + {item.toppings.map(t => t.name).join(', ')}
                                          </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                          {(item.price || 0).toLocaleString('vi-VN')}đ × {item.quantity || 1} = {itemPrice.toLocaleString('vi-VN')}đ
                                          {toppingsPrice > 0 && ` + ${toppingsPrice.toLocaleString('vi-VN')}đ (toppings)`}
                                        </div>
                                      </div>
                                      <span className="font-semibold text-emerald-600">
                                        {totalItemPrice.toLocaleString('vi-VN')}đ
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                              <div className="text-right text-sm font-medium text-gray-700 pt-2 border-t">
                                Tổng đơn hàng: {order.totalPrice.toLocaleString('vi-VN')}đ
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
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
                        disabled={paymentStatus === 'processing'}
                      >
                        {paymentStatus === 'processing' ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          "Xác nhận thanh toán"
                        )}
                      </Button>

                      {paymentStatus === 'success' && (
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
