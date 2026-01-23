import React, { useState } from "react";
import { AlertCircle, CheckCircle, X, RefreshCcw, Award } from "lucide-react";
import { OrderData, TableItem } from "@/entites/moderator/tableModel";
import OrderCard from "./OrderCard";
import ReasonCard from "./ReasonCard";

// Props interface
export interface OrderDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableItem | null;
  orders: OrderData[];
  loading: boolean;
  onConfirmStatusChange: (reason?: string) => void;
  onCancelStatusChange: () => void;
  newStatus: string | number; // 0: Available, 1: Occupied, 2: Reserved
  // Optional props for customization
  reasonSuggestions?: string[];
  reasonPlaceholder?: string;
  reasonTitle?: string;
  reasonSubtitle?: string;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
  isOpen,
  onClose,
  table,
  orders,
  loading,
  onConfirmStatusChange,
  onCancelStatusChange,
  newStatus,
  reasonSuggestions,
  reasonPlaceholder,
  reasonTitle,
  reasonSubtitle,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [showFinalConfirm, setShowFinalConfirm] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [showPendingDetails, setShowPendingDetails] = useState<boolean>(false);

  // 🔹 Tính thống kê từ orders để cảnh báo
  const orderStats = React.useMemo(() => {
    let totalOrders = orders.length;
    let totalItems = 0;
    let notServedItems = 0;
    let pendingItemsList: { name: string; qty: number }[] = [];

    console.log("Calculating order stats from orders:", orders);

    orders.forEach((order) => {
      const o: any = order as any;
      const items: any[] = o.items ?? o.orderItems ?? o.orderDetails ?? [];

      items.forEach((item: any) => {
        const qty: number = item.quantity ?? item.qty ?? 1;
        totalItems += qty;

        const st = (item.status ?? item.itemStatus ?? "")
          .toString()
          .toLowerCase();

        const isServed = st === "served" || st === "delivered" || st === "done";
        const isCancelled = st === "cancelled" || st === "void";

        if (!isServed && !isCancelled) {
          notServedItems += qty;
          const itemName = item.productName ?? item.name ?? "Món không tên";
          // Grouping logic (optional)
          const existing = pendingItemsList.find((p) => p.name === itemName);
          if (existing) {
            existing.qty += qty;
          } else {
            pendingItemsList.push({ name: itemName, qty });
          }
        }
      });
    });

    return { totalOrders, totalItems, notServedItems, pendingItemsList };
  }, [orders]);

  const normalizedNewStatus = newStatus.toString().toLowerCase();
  const isSwitchingToEmpty =
    normalizedNewStatus === "0" || normalizedNewStatus === "available";

  // 🔹 Lý do hợp lệ khi khác rỗng
  const isReasonValid = reason.trim().length > 0;

  // 🔹 Timer logic for final confirmation delay
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (
      showFinalConfirm &&
      isSwitchingToEmpty &&
      orderStats.notServedItems > 0 &&
      countdown > 0
    ) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    showFinalConfirm,
    countdown,
    isSwitchingToEmpty,
    orderStats.notServedItems,
  ]);

  // Early return if not open or no table
  if (!isOpen || !table) return null;

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleConfirmClick = () => {
    // Chỉ mở dialog confirm cuối nếu đã có lý do
    if (!isReasonValid) return;

    // Reset countdown if there are pending items
    if (isSwitchingToEmpty && orderStats.notServedItems > 0) {
      setCountdown(10);
    } else {
      setCountdown(0);
    }

    setShowFinalConfirm(true);
  };

  const handleFinalYes = () => {
    // Xác nhận cuối cùng - thực hiện thay đổi
    const finalReason = reason.trim();
    if (!finalReason) return; // phòng hờ
    setShowFinalConfirm(false);
    onConfirmStatusChange(finalReason);
    console.log("Final Reason:", finalReason);
  };

  const handleFinalNo = () => {
    // Không xác nhận - quay lại dialog đầu
    setShowFinalConfirm(false);
  };

  const handleCancelStatusChange = () => {
    setReason("");
    setShowFinalConfirm(false);
    onCancelStatusChange();
  };

  const getStatusText = (status: string | number): string => {
    switch (status.toString().toLowerCase()) {
      case "available":
      case "0":
        return "Trống";
      case "occupied":
      case "1":
        return "Có Khách";
      case "reserved":
      case "2":
        return "Đã Đặt";
      default:
        return status.toString();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-blue-900/20 to-indigo-900/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center">
          <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-700 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Dialog */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-blue-900/20 to-indigo-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-6xl overflow-hidden border border-gray-200/50">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600"></div>
          </div>

          {/* Dialog Header */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200/80 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 backdrop-blur-sm">
            <div className="flex-1 mb-3 sm:mb-0">
              <div className="flex items-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Xem Lại Thay Đổi Trạng Thái
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-lg font-semibold text-gray-800">
                      {table.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                <p className="text-sm text-gray-700">
                  Đổi từ{" "}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                    {getStatusText(table.status)}
                  </span>{" "}
                  sang{" "}
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {getStatusText(newStatus)}
                  </span>
                </p>
              </div>
            </div>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/80 transition-all duration-300 text-gray-500 hover:text-gray-700 self-end sm:self-center shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20"
              onClick={handleCancelStatusChange}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dialog Body */}
          <div
            className="flex-1 overflow-y-auto p-3 sm:p-6 relative"
            style={{ maxHeight: "calc(95vh - 200px)" }}
          >
            <div className="space-y-6">
              {/* 🔹 Warning từ OrderData khi chuẩn bị chuyển sang Trống */}
              {isSwitchingToEmpty && orderStats.totalOrders > 0 && (
                <div
                  className={`rounded-2xl border px-5 py-4 flex items-center gap-5 transition-all duration-500 shadow-lg ${
                    orderStats.notServedItems > 0
                      ? "bg-gradient-to-r from-red-500 to-red-600 border-red-300 animate-pulse ring-4 ring-red-400/20"
                      : "bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <AlertCircle
                    className={`mt-1 w-12 h-12 flex-shrink-0 ${
                      orderStats.notServedItems > 0
                        ? "text-white animate-pulse"
                        : "text-emerald-600"
                    }`}
                  />

                  <div className="text-sm sm:text-base text-left leading-relaxed">
                    {orderStats.notServedItems > 0 ? (
                      <>
                        <p className="font-black text-white uppercase tracking-tighter text-2xl mb-2 flex items-center gap-2">
                          <span>🚨</span> BÀN NÀY VẪN CHƯA HOÀN TẤT PHỤC VỤ!
                        </p>

                        <div className="bg-black/20 backdrop-blur-sm p-4 rounded-xl border border-white/30 text-white space-y-2">
                          <p className="text-lg">
                            <span className="font-bold">Hiện có:</span>{" "}
                            <span className="font-extrabold text-yellow-300">
                              {orderStats.totalOrders} order
                            </span>
                            {orderStats.totalItems > 0 && (
                              <>
                                {" "}
                                –{" "}
                                <span className="font-extrabold text-yellow-300">
                                  {orderStats.totalItems} món ăn
                                </span>
                              </>
                            )}
                          </p>

                          <p
                            className="text-xl font-bold border-l-4 border-yellow-400 pl-3 py-1 cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-between"
                            onClick={() =>
                              setShowPendingDetails(!showPendingDetails)
                            }
                          >
                            <span>
                              ⚠️ CÒN {orderStats.notServedItems} MÓN CHƯA XONG
                            </span>
                            <span className="text-xs font-normal underline">
                              {showPendingDetails ? "Thu gọn" : "Xem chi tiết"}
                            </span>
                          </p>

                          {showPendingDetails && (
                            <div className="bg-black/30 rounded-lg p-3 mt-2 space-y-1 border border-white/20 max-h-40 overflow-y-auto animate-in slide-in-from-top-2 duration-300">
                              {orderStats.pendingItemsList.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between text-sm py-1 border-b border-white/10 last:border-0"
                                >
                                  <span className="font-medium">
                                    {item.name}
                                  </span>
                                  <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-md font-bold text-xs flex items-center">
                                    x{item.qty}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-sm font-medium opacity-90 italic">
                            Bạn PHẢI kiểm tra lại tất cả order trước khi cho
                            phép chuyển bàn sang trạng thái
                            <span className="bg-white text-red-700 px-2 py-0.5 rounded ml-1 font-bold">
                              TRỐNG
                            </span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-bold text-emerald-800 uppercase tracking-wide">
                          ✅ Tất cả món đã được đánh dấu hoàn tất
                        </p>

                        <p className="text-emerald-800 mt-2">
                          Bàn đang có{" "}
                          <span className="font-extrabold text-emerald-900">
                            {orderStats.totalOrders} order
                          </span>
                          {orderStats.totalItems > 0 && (
                            <>
                              {" "}
                              với tổng khoảng{" "}
                              <span className="font-extrabold text-emerald-900">
                                {orderStats.totalItems} món
                              </span>
                              .
                            </>
                          )}
                        </p>

                        <p className="text-emerald-700 mt-2">
                          Bạn có thể{" "}
                          <span className="font-bold underline">
                            an tâm chuyển trạng thái bàn sang TRỐNG
                          </span>
                          .
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Reason Card Component */}
              <ReasonCard
                reason={reason}
                onReasonChange={setReason}
                required
                fromStatus={table.status}
                toStatus={newStatus}
                title="Lý do thay đổi trạng thái"
                subtitle="Vui lòng chọn hoặc nhập lý do (bắt buộc)"
              />
            </div>
          </div>

          {/* Enhanced Dialog Footer */}
          <div className="relative flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/30 backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600"></div>

            <button
              onClick={handleCancelStatusChange}
              className="group w-full sm:w-auto px-8 py-3 bg-white text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center font-semibold text-sm sm:text-base border border-gray-300/50 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <X className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Hủy Bỏ
            </button>

            <button
              onClick={handleConfirmClick}
              disabled={!isReasonValid}
              className={`group w-full sm:w-auto px-8 py-3 rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center transition-all duration-300
                ${
                  !isReasonValid
                    ? "bg-gray-300 text-gray-500 border border-gray-300/60 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                }`}
            >
              <CheckCircle className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              Xác Nhận Thay Đổi Trạng Thái
            </button>
          </div>
        </div>
      </div>

      {/* Final Yes/No Confirmation Dialog */}
      {showFinalConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div
            className={`bg-white rounded-3xl shadow-[0_0_30px_rgba(239,68,68,0.25)] w-full max-w-md overflow-hidden border-4 transition-all duration-300 ${
              isSwitchingToEmpty && orderStats.notServedItems > 0
                ? "border-red-500 scale-105"
                : "border-amber-400"
            }`}
          >
            {/* Header */}
            <div
              className={`p-6 text-white ${
                isSwitchingToEmpty && orderStats.notServedItems > 0
                  ? "bg-gradient-to-br from-red-500 via-red-600 to-red-700 ring-inset ring-4 ring-white/10"
                  : "bg-gradient-to-r from-amber-500 to-orange-500"
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                {isSwitchingToEmpty && orderStats.notServedItems > 0 ? (
                  <AlertCircle className="w-16 h-16 animate-[ping_1.5s_infinite] text-white" />
                ) : (
                  <AlertCircle className="w-12 h-12 animate-bounce" />
                )}
              </div>
              <h3 className="text-3xl font-black text-center uppercase tracking-tighter">
                {isSwitchingToEmpty && orderStats.notServedItems > 0
                  ? "⚠️ CẢNH BÁO NGUY HIỂM"
                  : "⚠️ Bạn chắc chứ?"}
              </h3>
            </div>

            {/* Body */}
            <div className="p-8 text-center space-y-4">
              <p className="text-xl font-semibold text-gray-900">
                Bạn có chắc chắn muốn thay đổi trạng thái của{" "}
                <strong>{table.name}</strong> không?
              </p>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800 font-medium">
                  Từ:{" "}
                  <span className="font-bold">
                    {getStatusText(table.status)}
                  </span>{" "}
                  → Sang:{" "}
                  <span className="font-bold">{getStatusText(newStatus)}</span>
                </p>

                {/* Tóm tắt nhanh từ orders trong confirm cuối */}
                {isSwitchingToEmpty && orderStats.totalOrders > 0 && (
                  <div
                    className={`mt-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                      orderStats.notServedItems > 0
                        ? "bg-red-500 text-white border-white/40 shadow-inner"
                        : "bg-emerald-100 text-emerald-900 border-emerald-200"
                    }`}
                  >
                    {orderStats.notServedItems > 0 ? (
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-center animate-pulse leading-none py-1">
                          DỪNG LẠI!
                        </p>
                        <p
                          className="text-lg font-bold text-center border-y border-white/30 py-2 cursor-pointer hover:bg-black/10 transition-colors"
                          onClick={() =>
                            setShowPendingDetails(!showPendingDetails)
                          }
                        >
                          BẠN VẪN CHƯA PHỤC VỤ HẾT MÓN!
                          <span className="block text-[10px] font-normal uppercase opacity-80 mt-1">
                            {showPendingDetails
                              ? "↑ Nhấn để đóng danh sách"
                              : "↓ Nhấn xem món nào chưa xong"}
                          </span>
                        </p>

                        {showPendingDetails && (
                          <div className="bg-black/20 rounded-lg p-2 space-y-1 max-h-32 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 shadow-inner">
                            {orderStats.pendingItemsList.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-xs py-1 border-b border-white/10 last:border-0"
                              >
                                <span className="font-semibold truncate mr-2">
                                  {item.name}
                                </span>
                                <span className="bg-yellow-400 text-red-900 px-1.5 py-0.5 rounded font-black">
                                  x{item.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-sm bg-black/20 p-2 rounded text-left font-medium">
                          Bàn này vẫn còn{" "}
                          <span className="text-yellow-300 font-bold underline text-base">
                            {orderStats.notServedItems} món chưa hoàn tất
                          </span>
                          . Việc chuyển sang TRỐNG bây giờ sẽ làm mất dấu vết
                          phục vụ!
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-center py-1">
                        ✅ Tất cả {orderStats.totalItems} món đều đã hoàn tất.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {reason.trim() && (
                <div className="mt-3 text-left">
                  <p className="text-xs font-semibold text-amber-900 mb-1">
                    Lý do thay đổi:
                  </p>
                  <p className="text-sm text-amber-900 bg-white/80 border border-amber-200 rounded-lg px-3 py-2">
                    "{reason.trim()}"
                  </p>
                </div>
              )}

              <p className="text-gray-600 text-sm pt-2">
                Hành động này không thể hoàn tác.
              </p>
            </div>

            {/* Footer with Yes/No */}
            <div className="flex gap-4 p-6 bg-gray-50 border-t-2 border-gray-200">
              <button
                onClick={handleFinalNo}
                className="flex-1 px-6 py-4 bg-white border-2 border-red-300 text-red-600 rounded-2xl hover:bg-red-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleFinalYes}
                disabled={countdown > 0}
                className={`flex-1 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center ${
                  countdown > 0
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed border-2 border-gray-500"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                }`}
              >
                {countdown > 0 ? `Chờ xác nhận (${countdown}s)` : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailDialog;
