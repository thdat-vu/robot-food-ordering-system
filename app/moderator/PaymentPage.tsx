import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePayment } from "@/hooks/use-payment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  ChevronDown,
  CreditCard,
  Loader2,
  Printer,
  Receipt,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Payment } from "@/lib/api/payments";
import { useToastKitchen } from "@/hooks/use-toast-kitchen";

export const PaymentPage: React.FC<{ idTable: string }> = ({ idTable }) => {
  const {
    selectedTable,
    selectedTableName,
    setSelectedTable,
    tableOrders,
    isLoading,
    paymentStatus,
    calculateTotal,
    initiatePayment,
    refreshOrders,
    confirmMoneyReceived,
  } = usePayment();

  const [showList, setShowList] = useState(true);
  const total = calculateTotal();

  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showIframe, setShowIframe] = useState(false);

  const { addToast } = useToastKitchen();

  const [invoiceOrders, setInvoiceOrders] = useState<typeof tableOrders>([]);
  const [invoiceTotal, setInvoiceTotal] = useState<number>(0);

  const [localPaid, setLocalPaid] = useState(false);

  const lastFetchedTableRef = useRef<string | null>(null);

  const normalize = (v: any) =>
    String(v ?? "")
      .trim()
      .toLowerCase();

  useEffect(() => {
    setSelectedTable(idTable);
  }, [idTable, setSelectedTable]);

  // refresh đúng 1 lần mỗi khi đổi bàn
  useEffect(() => {
    if (!selectedTable) return;
    if (lastFetchedTableRef.current === selectedTable) return;
    lastFetchedTableRef.current = selectedTable;

    refreshOrders();
  }, [selectedTable, refreshOrders]);

  // reset UI khi đổi bàn
  useEffect(() => {
    setShowIframe(false);
    setPaymentUrl(null);
    setShowList(true);
    setInvoiceOrders([]);
    setInvoiceTotal(0);
    setLocalPaid(false);
  }, [selectedTable]);

  // snapshot invoice khi có data
  useEffect(() => {
    if (tableOrders?.length > 0) {
      setInvoiceOrders(tableOrders);
      setInvoiceTotal(total);
    }
  }, [tableOrders, total]);

  const isPaidFromHook = useMemo(() => {
    const v = normalize(paymentStatus);
    return v === "paid" || v === "success" || v === "completed";
  }, [paymentStatus]);

  // ✅ SỬA CHỖ QUAN TRỌNG: ưu tiên paymentStatus trước, KHÔNG ưu tiên status
  const isPaidFromOrders = useMemo(() => {
    if (!tableOrders || tableOrders.length === 0) return false;

    return tableOrders.every((o: any) => {
      const pay = normalize(o?.paymentStatus); // Paid / Unpaid ...
      if (pay)
        return pay === "paid" || pay === "success" || pay === "completed";

      // fallback nếu BE dùng field khác
      const s = normalize(o?.status);
      return s === "paid" || s === "success" || s === "completed";
    });
  }, [tableOrders]);

  const showInvoice = localPaid || isPaidFromHook || isPaidFromOrders;

  const ordersForView = tableOrders.length > 0 ? tableOrders : invoiceOrders;
  const totalForView = tableOrders.length > 0 ? total : invoiceTotal;

  const hasData = tableOrders.length > 0;

  useEffect(() => {
    if (showInvoice) setShowIframe(false);
  }, [showInvoice]);

  const mapSize = (size?: string | null) => {
    if (!size) return "";
    const v = size.toLowerCase();
    if (v.startsWith("s")) return "S";
    if (v.startsWith("m")) return "M";
    if (v.startsWith("l")) return "L";
    return size;
  };

  const handlePrint = () => {
    if (!selectedTable || ordersForView.length === 0) return;

    const tableName = selectedTableName || `Bàn ${selectedTable}`;
    const surchargeAmount = 0;
    const grandTotal = totalForView + surchargeAmount;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html><head><title>Hóa đơn ${tableName}</title>
      <style>
        body{font-family:'Segoe UI';margin:0;padding:10px;}
        .bill{width:80mm;margin:auto;}
        .title{text-align:center;font-size:16px;font-weight:bold;}
        table{width:100%;font-size:12px;border-collapse:collapse;margin-top:10px;}
        th,td{padding:4px;text-align:left;}
        .total{text-align:right;font-weight:bold;}
      </style></head>
      <body><div class="bill">
      <div class="title">HÓA ĐƠN THANH TOÁN</div>
      <table>
        <tr><th>Món</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr>
        ${ordersForView
          .flatMap((order) =>
            order.items.map((item) => {
              const qty = item.quantity || 1;
              const itemPrice = (item.price || 0) * qty;

              const toppingUnit = item.toppings.reduce(
                (sum, t) => sum + (t.price || 0),
                0
              );
              const toppingsPrice = toppingUnit * qty;

              const totalItemPrice = itemPrice + toppingsPrice;

              return `<tr>
                <td>${item.productName} ${
                item.sizeName ? `(${mapSize(item.sizeName)})` : ""
              }</td>
                <td>${qty}</td>
                <td>${(item.price || 0).toLocaleString("vi-VN")}đ</td>
                <td>${totalItemPrice.toLocaleString("vi-VN")}đ</td>
              </tr>`;
            })
          )
          .join("")}
      </table>
      <div class="total">Tổng cộng: ${grandTotal.toLocaleString("vi-VN")}đ</div>
      <p style="text-align:center;font-size:11px;margin-top:10px;">Xin cảm ơn quý khách!</p>
      </div><script>window.print();window.onafterprint=()=>window.close();<\/script></body></html>`);

    printWindow.document.close();
  };

  const handlePayment = async () => {
    if (!selectedTable) return;

    if (showInvoice) {
      addToast("Bàn này đã thanh toán. Vui lòng xem hóa đơn.", "warning");
      return;
    }

    if (!hasData) {
      addToast("Không có đơn hàng nào để thanh toán", "warning");
      return;
    }

    try {
      const results = await Promise.all(
        tableOrders.map((order) => initiatePayment(order.id))
      );

      const successCount = results.filter((r) => r.success).length;

      if (successCount === tableOrders.length) {
        setLocalPaid(true);
        setShowIframe(false);

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
    } catch {
      toast("Lỗi", { description: "Có lỗi xảy ra khi thanh toán" });
    }
  };

  const handleOnlinePayment = async () => {
    if (!selectedTable) return;

    if (showInvoice) {
      toast("Thông báo", {
        description: "Bàn này đã thanh toán. Vui lòng xem hóa đơn.",
      });
      return;
    }

    if (!hasData) {
      toast("Lỗi", { description: "Không có đơn hàng nào để thanh toán" });
      return;
    }

    try {
      const firstOrder = tableOrders[0];
      const res = await Payment(firstOrder.id);
      const url = res?.data?.paymentUrl;

      if (url) {
        setPaymentUrl(url);
        setShowIframe(true);
      } else {
        throw new Error("paymentUrl is null");
      }
    } catch {
      toast("Lỗi", { description: "Có lỗi khi thanh toán online" });
      await handlePayment();
    }
  };

  const handleConfirmMoneyReceived = () => {
    const result = confirmMoneyReceived();
    if (result.success) {
      toast("Xác nhận thành công", {
        description: "Đã nhận tiền và trả tiền thừa",
      });
      setSelectedTable(null);
    }
  };

  // ✅ Nếu đã Paid -> KHÔNG show UI thanh toán (component trên), chỉ show “đã thanh toán” + invoice
  if (selectedTable && showInvoice) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40">
        <Card className="h-full shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 border-b-4 border-emerald-400/50 relative overflow-hidden">
            <CardTitle className="text-3xl font-bold flex items-center gap-3 text-white relative z-10">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  Đơn hàng đã thanh toán
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-sm font-medium text-emerald-100 mt-1">
                  {selectedTableName || `Bàn ${selectedTable}`}
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 overflow-y-auto">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Thanh toán thành công. Bạn chỉ cần in hóa đơn nếu cần.
            </div>

            <div className="mt-6 bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-md">
              <Button
                variant="ghost"
                onClick={() => setShowList(!showList)}
                className="w-full justify-between p-5 font-semibold text-gray-800 hover:bg-emerald-50/50 transition-all duration-200 rounded-none"
              >
                <span className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <Receipt className="w-5 h-5 text-emerald-700" />
                  </div>
                  <span className="text-lg">Chi tiết hóa đơn</span>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                    {ordersForView.length}
                  </span>
                </span>
                <div
                  className={`transition-transform duration-200 ${
                    showList ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                </div>
              </Button>

              {showList && (
                <div className="px-5 pb-5 space-y-3 max-h-[450px] overflow-y-auto">
                  {ordersForView.length === 0 ? (
                    <div className="p-4 text-sm text-gray-600">
                      Không có dữ liệu hóa đơn để hiển thị.
                    </div>
                  ) : (
                    ordersForView
                      .flatMap((order) => order.items)
                      .map((item, i) => {
                        const qty = item.quantity || 1;
                        const itemPrice = (item.price || 0) * qty;
                        const toppingUnit = item.toppings.reduce(
                          (sum, t) => sum + (t.price || 0),
                          0
                        );
                        const totalItemPrice = itemPrice + toppingUnit * qty;

                        return (
                          <div
                            key={i}
                            className="flex justify-between items-start bg-white rounded-xl p-4 border border-gray-100"
                          >
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800 text-base mb-1">
                                {item.productName}
                              </div>
                              {item.sizeName && (
                                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md font-medium mb-1">
                                  Size {mapSize(item.sizeName)}
                                </span>
                              )}
                              <div className="text-sm text-gray-500 mt-2">
                                Số lượng:{" "}
                                <span className="font-semibold text-gray-700">
                                  {qty}
                                </span>
                              </div>
                            </div>

                            <div className="text-right ml-4">
                              <div className="text-xl font-bold text-emerald-600">
                                {totalItemPrice.toLocaleString("vi-VN")}đ
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200/60 shadow-xl">
              <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-emerald-200">
                <span className="text-xl font-bold text-gray-800">
                  Tổng thanh toán
                </span>
                <span className="text-4xl font-black text-emerald-600 tracking-tight">
                  {totalForView.toLocaleString("vi-VN")}đ
                </span>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handlePrint}
                  disabled={ordersForView.length === 0}
                  variant="outline"
                  className="w-full h-12 text-blue-700 border-2 border-blue-300 hover:bg-blue-50 rounded-xl font-semibold transition-all"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  In hóa đơn
                </Button>

                {normalize(paymentStatus) === "success" && (
                  <Button
                    onClick={handleConfirmMoneyReceived}
                    variant="outline"
                    className="w-full h-12 border-2 border-green-300 text-green-700 hover:bg-green-50 rounded-xl font-semibold transition-all"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Xác nhận đã nhận tiền
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ✅ Chưa paid -> render UI thanh toán như bình thường
  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40">
      {selectedTable ? (
        <Card className="h-full shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/95">
          <CardHeader className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 border-b-4 border-emerald-400/50 relative overflow-hidden">
            <CardTitle className="text-3xl font-bold flex items-center gap-3 text-white relative z-10">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  Thanh toán
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-sm font-medium text-emerald-100 mt-1">
                  {selectedTableName || `Bàn ${selectedTable}`}
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 h-[calc(100%-100px)] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <Loader2 className="animate-spin w-12 h-12 text-emerald-600 mb-4" />
                <p className="text-lg text-gray-600 font-medium">
                  Đang tải đơn hàng...
                </p>
              </div>
            ) : (
              <div
                className={`grid gap-8 ${
                  showIframe ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
                }`}
              >
                <div
                  className={`space-y-6 ${
                    showIframe ? "lg:pr-6" : "max-w-4xl mx-auto w-full"
                  }`}
                >
                  <div className="bg-gradient-to-br from-white to-gray-50/50 shadow-lg rounded-2xl border border-gray-200/60 overflow-hidden">
                    <Button
                      variant="ghost"
                      onClick={() => setShowList(!showList)}
                      className="w-full justify-between p-5 font-semibold text-gray-800 hover:bg-emerald-50/50 transition-all duration-200 rounded-none"
                    >
                      <span className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-emerald-100 rounded-lg">
                          <Receipt className="w-5 h-5 text-emerald-700" />
                        </div>
                        <span className="text-lg">Chi tiết đơn hàng</span>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                          {ordersForView.length}
                        </span>
                      </span>
                      <div
                        className={`transition-transform duration-200 ${
                          showList ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      </div>
                    </Button>

                    {showList && (
                      <div className="px-5 pb-5 space-y-3 max-h-[450px] overflow-y-auto">
                        {ordersForView.length === 0 ? (
                          <div className="p-4 text-sm text-gray-600">
                            Không có đơn hàng.
                          </div>
                        ) : (
                          ordersForView
                            .flatMap((order) => order.items)
                            .map((item, i) => {
                              const qty = item.quantity || 1;
                              const itemPrice = (item.price || 0) * qty;
                              const toppingUnit = item.toppings.reduce(
                                (sum, t) => sum + (t.price || 0),
                                0
                              );
                              const totalItemPrice =
                                itemPrice + toppingUnit * qty;

                              return (
                                <div
                                  key={i}
                                  className="flex justify-between items-start bg-white rounded-xl p-4 border border-gray-100"
                                >
                                  <div className="flex-1">
                                    <div className="font-semibold text-gray-800 text-base mb-1">
                                      {item.productName}
                                    </div>
                                    {item.sizeName && (
                                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md font-medium mb-1">
                                        Size {mapSize(item.sizeName)}
                                      </span>
                                    )}
                                    <div className="text-sm text-gray-500 mt-2">
                                      Số lượng:{" "}
                                      <span className="font-semibold text-gray-700">
                                        {qty}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="text-right ml-4">
                                    <div className="text-xl font-bold text-emerald-600">
                                      {totalItemPrice.toLocaleString("vi-VN")}đ
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200/60 shadow-xl">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-emerald-200">
                      <span className="text-xl font-bold text-gray-800">
                        Tổng thanh toán
                      </span>
                      <span className="text-4xl font-black text-emerald-600 tracking-tight">
                        {totalForView.toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Ẩn 2 nút nếu không có data */}
                      {hasData && (
                        <>
                          <Button
                            onClick={handlePayment}
                            disabled={isLoading}
                            className="w-full h-16 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white text-lg font-bold rounded-xl shadow-lg"
                          >
                            <CreditCard className="mr-2 w-5 h-5" />
                            Thanh toán tiền mặt
                          </Button>

                          <Button
                            onClick={handleOnlinePayment}
                            disabled={isLoading}
                            className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md"
                          >
                            <CreditCard className="w-5 h-5 mr-2" />
                            Chuyển khoản PayOs
                          </Button>
                        </>
                      )}

                      {!hasData && (
                        <div className="text-sm text-gray-600 px-3 py-2 rounded-lg bg-white border border-gray-200">
                          Không có đơn hàng để thanh toán.
                        </div>
                      )}

                      <Button
                        onClick={handlePrint}
                        disabled={ordersForView.length === 0}
                        variant="outline"
                        className="w-full h-12 text-blue-700 border-2 border-blue-300 hover:bg-blue-50 rounded-xl font-semibold transition-all"
                      >
                        <Printer className="w-5 h-5 mr-2" />
                        In hóa đơn
                      </Button>
                    </div>
                  </div>
                </div>

                {!showInvoice && showIframe && paymentUrl && (
                  <div className="hidden lg:flex flex-col bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-3 overflow-hidden">
                    <iframe
                      src={paymentUrl}
                      className="w-full h-[calc(85vh-60px)] rounded-xl border-2 border-gray-200 shadow-inner"
                      title="VNPay Payment"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="h-full shadow-xl border-0 bg-white/95 backdrop-blur-sm flex items-center justify-center">
          <CardContent className="text-center py-20 px-8">
            <div className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6 shadow-lg">
              <CreditCard className="w-20 h-20 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              Chưa chọn bàn
            </h3>
            <p className="text-gray-500 text-lg">
              Vui lòng chọn một bàn để xem chi tiết thanh toán
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
