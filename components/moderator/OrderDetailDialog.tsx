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

  // Early return if not open or no table
  if (!isOpen || !table) return null;

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleConfirmClick = () => {
    // Mở dialog xác nhận Yes/No
    setShowFinalConfirm(true);
  };

  const handleFinalYes = () => {
    // Xác nhận cuối cùng - thực hiện thay đổi
    const finalReason = reason.trim() || "Không có lý do cụ thể";
    setShowFinalConfirm(false);
    onConfirmStatusChange(finalReason);
    setReason("");
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
              {/* Order Card Component */}
              <OrderCard
                tableId={table.id}
                orders={orders}
                onToggleExpand={toggleOrderExpand}
                expandedOrderId={expandedOrderId}
                showDateFilter={true}
              />

              {/* Reason Card Component */}
              <ReasonCard
                reason={reason}
                onReasonChange={setReason}
                reasonSuggestions={reasonSuggestions}
                placeholder={reasonPlaceholder}
                title={reasonTitle}
                subtitle={reasonSubtitle}
                showCharacterCount={true}
                maxLength={500}
              />
            </div>
          </div>

          {/* Enhanced Dialog Footer */}
          <div className="relative flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50/30 backdrop-blur-sm">
            {/* Decorative line */}
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
              className="group w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center font-semibold text-sm sm:text-base transform hover:scale-105"
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-4 border-amber-400">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="w-12 h-12 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold text-center">
                ⚠️ Bạn chắc chứ?
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
              </div>
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
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailDialog;
