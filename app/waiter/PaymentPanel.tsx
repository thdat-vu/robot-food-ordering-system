"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  CreditCard,
  Receipt,
  CheckCircle,
  DollarSign,
  Printer,
} from "lucide-react";
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
                        ${
                          item.sizeName
                            ? `<span class="item-detail">(${item.sizeName})</span>`
                            : ""
                        }
                        ${
                          item.quantity > 1
                            ? `<span class="item-detail">x${item.quantity}</span>`
                            : ""
                        }
                        ${
                          item.toppings.length > 0
                            ? `<div class="item-topping">+ ${item.toppings
                                .map((t) => t.name)
                                .join(", ")}</div>`
                            : ""
                        }
                      </div>
                      <span class="item-price">${totalItemPrice.toLocaleString(
                        "vi-VN"
                      )}đ</span>
                    </li>`;
                  })
                )
                .join("")}
            </ul>
            <div class="bill-total">Tổng cộng: ${total.toLocaleString(
              "vi-VN"
            )}đ</div>
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
    <div className="flex flex-col lg:flex-row gap-6 w-full h-full overflow-hidden">
      {/* Table Selection - Left Side */}
      <div className="lg:w-1/3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Chọn Bàn Thanh Toán
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Chọn bàn để xem chi tiết đơn hàng và thanh toán
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {tables.length === 0 ? (
                <div className="col-span-3 flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Không có bàn nào</p>
                  </div>
                </div>
              ) : (
                tables.map((table) => (
                  <Button
                    key={table.id}
                    variant={selectedTable === table.id ? "default" : "outline"}
                    className={`h-20 text-lg font-bold transition-all duration-200 ${
                      selectedTable === table.id
                        ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105"
                        : "hover:bg-gray-50 hover:scale-102"
                    }`}
                    onClick={() => setSelectedTable(table.id)}
                  >
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{table.name}</span>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Details - Right Side */}
      <div className="lg:w-2/3 overflow-hidden">
        {selectedTable ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b flex-shrink-0">
              <CardTitle className="text-2xl flex items-center">
                <CreditCard className="w-6 h-6 mr-3 text-green-600" />
                Thanh toán - {selectedTableName || `Bàn ${selectedTable}`}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Chi tiết đơn hàng đang phục vụ (Delivering)
              </p>
            </CardHeader>
            <CardContent className="p-6 flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  <span className="ml-3 text-lg">Đang tải đơn hàng...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Order Details Section */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-left font-semibold text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowList(!showList)}
                    >
                      <span className="flex items-center">
                        <Receipt className="w-4 h-4 mr-2" />
                        Chi tiết đơn hàng ({tableOrders.length} đơn)
                      </span>
                      {showList ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>

                    {showList && (
                      <div className="mt-4 max-h-96 overflow-y-auto pr-2 space-y-4">
                        {tableOrders.length === 0 ? (
                          <div className="text-center py-8">
                            <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-muted-foreground text-sm">
                              Không có đơn hàng đang phục vụ cho bàn này.
                            </p>
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-gray-800 flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                Danh sách món đã đặt
                              </h4>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {tableOrders.length} đơn hàng
                              </span>
                            </div>

                            {/* Gộp tất cả món từ các đơn hàng */}
                            <ul className="space-y-3">
                              {tableOrders
                                .flatMap((order) => order.items)
                                .map((item, index) => {
                                  const itemPrice =
                                    (item.price || 0) * (item.quantity || 1);
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
                                      key={`${item.id}-${index}`}
                                      className="flex justify-between items-start border-b border-gray-100 pb-3"
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center">
                                          <span className="font-medium text-gray-900">
                                            {item.productName}
                                          </span>
                                          {item.sizeName && (
                                            <span className="text-sm text-blue-600 ml-2 px-2 py-1 bg-blue-50 rounded">
                                              {item.sizeName}
                                            </span>
                                          )}
                                          {item.quantity > 1 && (
                                            <span className="text-sm text-gray-500 ml-2 px-2 py-1 bg-gray-100 rounded">
                                              x{item.quantity}
                                            </span>
                                          )}
                                        </div>
                                        {item.toppings.length > 0 && (
                                          <div className="text-xs text-green-600 mt-1 flex items-center">
                                            <span className="w-1 h-1 bg-green-500 rounded-full mr-1"></span>
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
                                      <span className="font-semibold text-green-600 text-lg">
                                        {totalItemPrice.toLocaleString("vi-VN")}
                                        đ
                                      </span>
                                    </li>
                                  );
                                })}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Total Amount Section */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-gray-800">
                        Tổng cộng
                      </span>
                      <span className="text-3xl font-bold text-green-700">
                        {total.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    {/* Payment Buttons - Always show when table is selected */}
                    <div className="space-y-4">
                      <Button
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        onClick={handlePayment}
                        disabled={
                          paymentStatus === "processing" ||
                          tableOrders.length === 0
                        }
                      >
                        {paymentStatus === "processing" ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            Đang xử lý thanh toán...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-3" />
                            Thanh toán
                          </>
                        )}
                      </Button>

                      {/* Print Receipt Button - Always visible when table is selected */}
                      <Button
                        variant="outline"
                        className="w-full h-12 text-base font-semibold border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={handlePrint}
                        disabled={tableOrders.length === 0}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        In biên lai
                      </Button>

                      {paymentStatus === "success" && (
                        <Button
                          variant="outline"
                          className="w-full h-12 text-base font-semibold border-green-300 text-green-700 hover:bg-green-50"
                          onClick={handleConfirmMoneyReceived}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Xác nhận đã nhận tiền
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Chưa chọn bàn
                </h3>
                <p className="text-gray-500">
                  Vui lòng chọn một bàn để xem chi tiết thanh toán
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
