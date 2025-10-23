import React, {useEffect, useState} from "react";
import {usePayment} from "@/hooks/use-payment";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {CheckCircle, ChevronDown, ChevronUp, CreditCard, Loader2, Printer, Receipt, Sparkles} from "lucide-react";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";
import {Payment} from "@/lib/api/payments";

export const PaymentPage: React.FC<{ idTable: string }> = ({idTable}) => {
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


    useEffect(() => setSelectedTable(idTable), [idTable]);
    useEffect(() => {
        refreshOrders();
    }, [selectedTable]);

    const handlePayment = async () => {
        if (!selectedTable || tableOrders.length === 0) {
            toast("Lỗi", {description: "Không có đơn hàng nào để thanh toán"});
            return;
        }

        try {
            const results = await Promise.all(tableOrders.map(order => initiatePayment(order.id)));
            const successCount = results.filter(r => r.success).length;

            if (successCount === tableOrders.length) {
                handlePrint();
                toast("Thanh toán thành công", {
                    description: `${selectedTableName || `Bàn ${selectedTable}`} - ${total.toLocaleString("vi-VN")}đ`,
                });
            } else {
                toast("Lỗi thanh toán", {description: "Một số đơn hàng không thể thanh toán"});
            }
        } catch {
            toast("Lỗi", {description: "Có lỗi xảy ra khi thanh toán"});
        }
    };

    const handleOnlinePayment = async () => {
        if (!selectedTable || tableOrders.length === 0) {
            toast("Lỗi", {description: "Không có đơn hàng nào để thanh toán"});
            return;
        }

        try {
            const firstOrder = tableOrders[0];
            const res = await Payment(firstOrder.id);
            const paymentUrl = res?.data?.paymentUrl;
            if (paymentUrl) {
                setPaymentUrl(paymentUrl);
                setShowIframe(true);
            }
        } catch {
            toast("Lỗi", {description: "Có lỗi khi thanh toán online"});
            await handlePayment();
        }
    };

    const handlePrint = () => {
        if (!selectedTable || tableOrders.length === 0) return;
        const tableName = selectedTableName || `Bàn ${selectedTable}`;
        const surchargeAmount = 0;
        const grandTotal = total + surchargeAmount;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const mapSize = (size?: string | null) => {
            if (!size) return "";
            const v = size.toLowerCase();
            if (v.startsWith("s")) return "S";
            if (v.startsWith("m")) return "M";
            if (v.startsWith("l")) return "L";
            return size;
        };

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
        ${tableOrders
            .flatMap(order => order.items.map(item => {
                const itemPrice = (item.price || 0) * (item.quantity || 1);
                const toppingsPrice = item.toppings.reduce((sum, t) => sum + (t.price || 0), 0);
                const totalItemPrice = itemPrice + toppingsPrice;
                return `<tr><td>${item.productName} ${item.sizeName ? `(${mapSize(item.sizeName)})` : ""}</td><td>${item.quantity}</td><td>${(item.price || 0).toLocaleString("vi-VN")}đ</td><td>${totalItemPrice.toLocaleString("vi-VN")}đ</td></tr>`;
            }))
            .join("")}
      </table>
      <div class="total">Tổng cộng: ${grandTotal.toLocaleString("vi-VN")}đ</div>
      <p style="text-align:center;font-size:11px;margin-top:10px;">Xin cảm ơn quý khách!</p>
      </div><script>window.print();window.onafterprint=()=>window.close();<\/script></body></html>`);

        printWindow.document.close();
    };

    const handleConfirmMoneyReceived = () => {
        const result = confirmMoneyReceived();
        if (result.success) {
            toast("Xác nhận thành công", {description: "Đã nhận tiền và trả tiền thừa"});
            setSelectedTable(null);
        }
    };

    return (
        <div className="h-full bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/40">
            {selectedTable ? (
                <Card className="h-full shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/95">
                    <CardHeader
                        className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 border-b-4 border-emerald-400/50 relative overflow-hidden">
                        <div
                            className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRIMS43OWMtMi4yMSAwLTQgMS43OS00IDR2NGMwIDIuMjEgMS43OSA0IDQgNGgyLjIxYzIuMjEgMCA0LTEuNzkgNC00di00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
                        <CardTitle className="text-3xl font-bold flex items-center gap-3 text-white relative z-10">
                            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm shadow-lg">
                                <CreditCard className="w-7 h-7"/>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    Thanh toán
                                    <Sparkles className="w-5 h-5 animate-pulse"/>
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
                                <Loader2 className="animate-spin w-12 h-12 text-emerald-600 mb-4"/>
                                <p className="text-lg text-gray-600 font-medium">Đang tải đơn hàng...</p>
                            </div>
                        ) : (
                            <div className={`grid gap-8 ${showIframe ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                                {/* Cột bên trái - Hóa đơn */}
                                <div className={`space-y-6 ${showIframe ? "lg:pr-6" : "max-w-4xl mx-auto w-full"}`}>
                                    {/* Chi tiết đơn hàng */}
                                    <div
                                        className="bg-gradient-to-br from-white to-gray-50/50 shadow-lg rounded-2xl border border-gray-200/60 overflow-hidden">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowList(!showList)}
                                            className="w-full justify-between p-5 font-semibold text-gray-800 hover:bg-emerald-50/50 transition-all duration-200 rounded-none"
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                                    <Receipt className="w-5 h-5 text-emerald-700"/>
                                                </div>
                                                <span className="text-lg">Chi tiết đơn hàng</span>
                                                <span
                                                    className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                                                    {tableOrders.length}
                                                </span>
                                            </span>
                                            <div
                                                className={`transition-transform duration-200 ${showList ? 'rotate-180' : ''}`}>
                                                <ChevronDown className="w-5 h-5 text-gray-600"/>
                                            </div>
                                        </Button>

                                        {showList && (
                                            <div className="px-5 pb-5 space-y-3 max-h-[450px] overflow-y-auto">
                                                {tableOrders.flatMap(order => order.items).map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex justify-between items-start bg-white rounded-xl p-4 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
                                                    >
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-gray-800 text-base mb-1">
                                                                {item.productName}
                                                            </div>
                                                            {item.sizeName && (
                                                                <span
                                                                    className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md font-medium mb-1">
                                                                    Size {item.sizeName}
                                                                </span>
                                                            )}
                                                            {item.toppings.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {item.toppings.map((t, idx) => (
                                                                        <span key={idx}
                                                                              className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-md border border-emerald-200">
                                                                            + {t.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="text-sm text-gray-500 mt-2">
                                                                Số lượng: <span
                                                                className="font-semibold text-gray-700">{item.quantity}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <div className="text-xl font-bold text-emerald-600">
                                                                {((item.price || 0) * (item.quantity || 1)).toLocaleString("vi-VN")}đ
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tổng cộng + nút hành động */}
                                    <div
                                        className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200/60 shadow-xl">
                                        <div
                                            className="flex justify-between items-center mb-6 pb-4 border-b-2 border-emerald-200">
                                            <span className="text-xl font-bold text-gray-800">Tổng thanh toán</span>
                                            <span className="text-4xl font-black text-emerald-600 tracking-tight">
                                                {total.toLocaleString("vi-VN")}đ
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <Button
                                                onClick={handlePayment}
                                                disabled={isLoading}
                                                className="w-full h-16 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                            >
                                                {paymentStatus === "processing" ? (
                                                    <>
                                                        <Loader2 className="animate-spin mr-2 w-5 h-5"/>
                                                        Đang xử lý...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CreditCard className="mr-2 w-5 h-5"/>
                                                        Thanh toán tiền mặt
                                                    </>
                                                )}
                                            </Button>

                                            <Button
                                                onClick={handleOnlinePayment}
                                                disabled={isLoading}
                                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                            >
                                                <CreditCard className="w-5 h-5 mr-2"/>
                                                Chuyển khoản VNPay
                                            </Button>

                                            {showIframe && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowIframe(false)}
                                                    className="w-full h-12 text-red-600 border-2 border-red-300 hover:bg-red-50 rounded-xl font-semibold transition-all"
                                                >
                                                    Ẩn giao diện thanh toán
                                                </Button>
                                            )}

                                            <Button
                                                onClick={handlePrint}
                                                disabled={tableOrders.length === 0}
                                                variant="outline"
                                                className="w-full h-12 text-blue-700 border-2 border-blue-300 hover:bg-blue-50 rounded-xl font-semibold transition-all"
                                            >
                                                <Printer className="w-5 h-5 mr-2"/>
                                                In hóa đơn
                                            </Button>

                                            {paymentStatus === "success" && (
                                                <Button
                                                    onClick={handleConfirmMoneyReceived}
                                                    variant="outline"
                                                    className="w-full h-12 border-2 border-green-300 text-green-700 hover:bg-green-50 rounded-xl font-semibold transition-all"
                                                >
                                                    <CheckCircle className="w-5 h-5 mr-2"/>
                                                    Xác nhận đã nhận tiền
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Cột bên phải - Iframe */}
                                {showIframe && paymentUrl && (
                                    <div
                                        className="hidden lg:flex flex-col bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-3 overflow-hidden">
                                        <div className="mb-3 px-2">
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                Cổng thanh toán VNPay
                                            </h3>
                                        </div>
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
                <Card
                    className="h-full shadow-xl border-0 bg-white/95 backdrop-blur-sm flex items-center justify-center">
                    <CardContent className="text-center py-20 px-8">
                        <div
                            className="inline-flex p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6 shadow-lg">
                            <CreditCard className="w-20 h-20 text-gray-400"/>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-3">Chưa chọn bàn</h3>
                        <p className="text-gray-500 text-lg">Vui lòng chọn một bàn để xem chi tiết thanh toán</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};