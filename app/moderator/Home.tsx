"use client";
import React, { useEffect, useState } from "react";
import {
  QrCode,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Download,
  Printer,
  Shield,
  Info,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { getApiUrl } from "@/env.config";
import axios from "axios";
import { useToastModerator } from "@/hooks/use-toast-moderator";
import { ToastContainer } from "@/components/moderator/ToastContainer";
import OrderDetailDialog from "@/components/moderator/OrderDetailDialog";
import { OrderData } from "@/entites/moderator/tableModel";

export interface TableDetail {
  id: string;
  name: string;
  status: number;
  qrCode: string;
  isBlocked?: boolean;
}

export const Home: React.FC<{ idTable: string }> = ({ idTable }) => {
  const { toasts, addToast, removeToast } = useToastModerator();
  const [tableData, setTableData] = useState<TableDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrImageError, setQrImageError] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  // Status change states
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderData, setOrderData] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<number | null>(null);

  const API_BASE = getApiUrl();

  useEffect(() => {
    if (idTable) {
      fetchTableDetail();
    }
  }, [idTable]);

  const fetchTableDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/Table/${idTable}`);
      setTableData(response.data);
      setQrImageError(false);
    } catch (error: any) {
      addToast(
        error?.response?.data?.errorMessage || "Không thể tải thông tin bàn",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersForTable = async () => {
    if (!idTable) return;

    try {
      setLoadingOrders(true);
      const response = await fetch(
        `${API_BASE}/Order/table/${idTable}/for_moderator_checkout`
      );
      if (!response.ok) throw new Error("Failed to fetch orders");
      const orders = await response.json();

      setOrderData(orders?.data || []);
    } catch (err) {
      setOrderData([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // ✅ FIX: Helper function để get status value
  const getStatusValue = (status: string | number): number => {
    const strStatus = status.toString().toLowerCase();

    switch (strStatus) {
      case "available":
      case "0":
        return 0;
      case "occupied":
      case "1":
        return 1;
      case "reserved":
      case "2":
        return 2;
      default:
        return 0;
    }
  };

  // ✅ FIX: Logic để toggle giữa Available (0) và Occupied (1)
  const getNextStatus = (currentStatus: number): number => {
    const statusValue = getStatusValue(currentStatus);

    // Toggle: 0 ↔ 1
    if (statusValue === 0) {
      return 1; // Available → Occupied
    } else if (statusValue === 1) {
      return 0; // Occupied → Available
    } else {
      // Reserved (2) → Available (0)
      return 0;
    }
  };

  const handleToggleStatus = () => {
    if (!tableData) return;

    const currentStatus = tableData.status;
    const newStatus = getNextStatus(currentStatus);

    setPendingStatus(newStatus);

    // Fetch orders if not already loaded
    if (orderData.length === 0) {
      fetchOrdersForTable();
    }

    setOrderDialogOpen(true);
  };

  const confirmStatusChange = async (reason?: string) => {
    if (!tableData || pendingStatus === null) return;

    const { id: tableId, name: tableName } = tableData;
    const newStatus = pendingStatus;

    try {
      setActionLoading(true);

      const response = await axios.put(`${API_BASE}/Table/${tableId}/status`, {
        status: newStatus,
        reason: reason,
      });

      // Update local state
      setTableData((prev) => (prev ? { ...prev, status: newStatus } : null));

      addToast(`Đã cập nhật trạng thái bàn ${tableName} thành công`, "success");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.errorMessage ||
        "Không thể cập nhật trạng thái bàn";
      addToast(errorMessage, "error");
    } finally {
      setActionLoading(false);
      setPendingStatus(null);
      setOrderDialogOpen(false);
    }
  };

  const cancelStatusChange = () => {
    setPendingStatus(null);
    setOrderDialogOpen(false);
  };

  const handleToggleBlock = async () => {
    if (!tableData) return;

    const willBeBlocked = !tableData.isBlocked;

    if (willBeBlocked) {
      setShowReasonDialog(true);
    } else {
      if (window.confirm("Bạn có chắc muốn mở khóa bàn này?")) {
        await executeToggleBlock("");
      }
    }
  };

  const executeToggleBlock = async (reason?: string) => {
    if (!tableData) return;

    const willBeBlocked = !tableData.isBlocked;

    try {
      setActionLoading(true);

      // ⚠️ MOCK - Fake API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTableData((prev) =>
        prev ? { ...prev, isBlocked: willBeBlocked } : null
      );

      addToast(
        `${
          willBeBlocked ? "🔒 Đã khóa" : "🔓 Đã mở khóa"
        } bàn thành công (DEMO - chưa lưu vào backend)`,
        "success"
      );

      setShowReasonDialog(false);
      setBlockReason("");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.errorMessage ||
        error?.response?.data?.message ||
        error?.message ||
        `Không thể ${
          willBeBlocked ? "khóa" : "mở khóa"
        } bàn. Vui lòng thử lại.`;

      addToast(errorMessage, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getQRCodeUrl = (size: number = 400) => {
    if (!tableData) return "";
    const targetUrl = `https://seb123123.up.railway.app/${tableData.id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
      targetUrl
    )}`;
  };

  const handleDownloadQR = async () => {
    if (!tableData) return;

    try {
      const qrUrl = getQRCodeUrl(500);
      const response = await fetch(qrUrl);
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `QR-${tableData.name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
      addToast("Đã tải xuống mã QR", "success");
    } catch (error) {
      addToast("Không thể tải xuống mã QR", "error");
    }
  };

  const handlePrintQR = () => {
    if (!tableData) return;

    const qrUrl = getQRCodeUrl(600);
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>In mã QR - ${tableData.name}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        display: flex; align-items: center; justify-content: center;
                        min-height: 100vh; background: white; padding: 20px;
                    }
                    .qr-container {
                        text-align: center; border: 3px solid #333; padding: 40px;
                        border-radius: 15px; background: white;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px;
                    }
                    h1 { margin: 0 0 30px 0; color: #333; font-size: 36px; font-weight: bold; }
                    .qr-wrapper {
                        background: white; padding: 20px; border-radius: 10px;
                        display: inline-block; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    }
                    img { width: 400px; height: 400px; display: block; image-rendering: crisp-edges; }
                    .instruction { margin-top: 30px; padding: 15px; background: #f0f0f0; border-radius: 8px; }
                    p { color: #666; font-size: 20px; margin: 10px 0; line-height: 1.5; }
                    .footer {
                        margin-top: 20px; padding-top: 20px; border-top: 2px dashed #ccc;
                        font-size: 14px; color: #999;
                    }
                    @media print {
                        body { background: white; }
                        .qr-container { box-shadow: none; }
                        @page { margin: 1cm; size: A4 portrait; }
                    }
                </style>
            </head>
            <body>
                <div class="qr-container">
                    <h1>${tableData.name}</h1>
                    <div class="qr-wrapper">
                        <img src="${qrUrl}" alt="QR Code" />
                    </div>
                    <div class="instruction">
                        <p><strong>Quét mã QR để đặt món</strong></p>
                        <p>Đặt mã này ở vị trí dễ nhìn trên bàn</p>
                    </div>
                    <div class="footer">
                        <p>Restaurant Management System</p>
                    </div>
                </div>
            </body>
            </html>
        `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const getStatusInfo = (status: number) => {
    const statusValue = getStatusValue(status);

    switch (statusValue) {
      case 0:
        return {
          label: "Trống",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
        };
      case 1:
        return {
          label: "Có Khách",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: AlertCircle,
        };
      case 2:
        return {
          label: "Đã Đặt",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: AlertCircle,
        };
      default:
        return {
          label: "Không xác định",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: AlertCircle,
        };
    }
  };

  const getStatusText = (status: number) => {
    const statusValue = getStatusValue(status);

    switch (statusValue) {
      case 0:
        return "Trống";
      case 1:
        return "Có Khách";
      case 2:
        return "Đã Đặt";
      default:
        return "Không xác định";
    }
  };

  // ✅ FIX: Check if status is Available (0)
  const isAvailableStatus = (status: number): boolean => {
    const statusValue = getStatusValue(status);
    return statusValue === 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải thông tin bàn...</p>
        </div>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Không tìm thấy bàn
          </h3>
          <p className="text-gray-600 mb-4">Không thể tải thông tin bàn này</p>
          <button
            onClick={fetchTableDetail}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(tableData.status);
  const StatusIcon = statusInfo.icon;
  const qrCodeUrl = tableData.qrCode || getQRCodeUrl();
  const computedStatus =
    pendingStatus !== null ? pendingStatus : getNextStatus(tableData.status);

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="h-full">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {/* Left: name + badges on ONE row */}
            <div className="flex items-center gap-4 min-w-0">
              <h2 className="text-3xl font-bold text-gray-800 truncate">
                {tableData.name}
              </h2>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${statusInfo.color}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  <span>{statusInfo.label}</span>
                </span>

                {tableData.isBlocked && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800 border-2 border-red-200 animate-pulse">
                    <Lock className="w-4 h-4" />
                    <span>Đã khóa</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right: refresh */}
            <button
              onClick={fetchTableDetail}
              disabled={loading}
              className="p-3 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 flex-shrink-0"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-600 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code Section */}
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Mã QR Đặt Món</h3>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200">
                {qrImageError ? (
                  <div className="w-80 h-80 flex flex-col items-center justify-center text-gray-400">
                    <AlertCircle className="w-16 h-16 mb-4" />
                    <p className="text-sm text-center font-medium">
                      Không thể tải mã QR
                    </p>
                    <button
                      onClick={() => {
                        setQrImageError(false);
                        fetchTableDetail();
                      }}
                      className="mt-3 px-4 py-2 text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : (
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code ${tableData.name}`}
                    className="w-80 h-80 object-contain"
                    style={{ imageRendering: "crisp-edges" }}
                    onError={() => setQrImageError(true)}
                  />
                )}
              </div>
            </div>

            <div className="text-center mb-4">
              <p className="text-gray-600 mb-2 font-medium">
                Khách hàng quét mã QR này để xem menu và đặt món
              </p>
              <p className="text-sm text-gray-500">
                Đặt mã QR ở vị trí dễ nhìn trên bàn
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadQR}
                disabled={qrImageError}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span>Tải xuống</span>
              </button>

              <button
                onClick={handlePrintQR}
                disabled={qrImageError}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-5 h-5" />
                <span>In mã QR</span>
              </button>
            </div>
          </div>

          {/* Status & Block Management Section */}
          <div className="space-y-6">
            {/* Status Toggle Card */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  {isAvailableStatus(tableData.status) ? (
                    <ToggleRight className="w-6 h-6 text-white" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-white" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Thay Đổi Trạng Thái Bàn
                </h3>
              </div>

              <div
                className={`rounded-xl p-6 mb-6 border-2 ${
                  isAvailableStatus(tableData.status)
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start space-x-4 mb-4">
                  <StatusIcon
                    className={`w-8 h-8 flex-shrink-0 mt-1 ${
                      isAvailableStatus(tableData.status)
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                  <div>
                    <h4
                      className={`text-lg font-bold mb-2 ${
                        isAvailableStatus(tableData.status)
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      Trạng thái hiện tại: {statusInfo.label}
                    </h4>
                    <p
                      className={`text-sm ${
                        isAvailableStatus(tableData.status)
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {isAvailableStatus(tableData.status)
                        ? "Bàn đang trống, sẵn sàng phục vụ khách mới"
                        : "Bàn đang có khách, nhân viên đang phục vụ"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <span>Thông tin trạng thái:</span>
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-xs font-bold">
                        0
                      </span>
                    </div>
                    <span className="text-sm text-gray-700">
                      <strong>Trống:</strong> Bàn sẵn sàng đón khách mới
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-xs font-bold">1</span>
                    </div>
                    <span className="text-sm text-gray-700">
                      <strong>Có Khách:</strong> Bàn đang được sử dụng
                    </span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 ${
                  isAvailableStatus(tableData.status)
                    ? "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white"
                    : "bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white"
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : isAvailableStatus(tableData.status) ? (
                  <>
                    <AlertCircle className="w-6 h-6" />
                    <span>Đánh dấu "Có Khách"</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>Đánh dấu "Trống"</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center space-x-3 mb-2">
              <QrCode className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Mã QR</span>
            </div>
            <p className="text-xs text-blue-700">
              Khách quét để đặt món nhanh chóng
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center space-x-3 mb-2">
              <StatusIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">
                Trạng thái
              </span>
            </div>
            <p className="text-xs text-purple-700">
              {statusInfo.label} - Cập nhật tự động
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200">
            <div className="flex items-center space-x-3 mb-2">
              {tableData.isBlocked ? (
                <Lock className="w-5 h-5 text-red-600" />
              ) : (
                <Unlock className="w-5 h-5 text-emerald-600" />
              )}
              <span className="text-sm font-semibold text-emerald-800">
                Bảo mật
              </span>
            </div>
            <p className="text-xs text-emerald-700">
              {tableData.isBlocked
                ? "Đã khóa truy cập (Demo)"
                : "Cho phép đặt món"}
            </p>
          </div>
        </div>
      </div>

      {/* Block Reason Dialog */}
      {showReasonDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Lock className="w-6 h-6 text-red-600" />
                <span>Khóa bàn {tableData.name}</span>
              </h3>
              <p className="text-sm text-amber-600 mt-2 flex items-center space-x-1">
                <Info className="w-4 h-4" />
                <span>Chế độ Demo - Chỉ lưu tạm thời</span>
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do khóa bàn <span className="text-gray-400">(Tùy chọn)</span>
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ví dụ: Bàn đang bảo trì, dọn dẹp, v.v..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                rows={4}
              />
            </div>

            <div className="flex gap-3 p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowReasonDialog(false);
                  setBlockReason("");
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all font-semibold disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={() => executeToggleBlock(blockReason)}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl hover:from-red-700 hover:to-rose-800 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang khóa...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Xác nhận khóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Dialog for Status Change */}
      <OrderDetailDialog
        isOpen={orderDialogOpen}
        onClose={cancelStatusChange}
        table={
          tableData
            ? {
                id: tableData.id,
                name: tableData.name,
                status: tableData.status.toString(),
                qrCode: tableData.qrCode,
              }
            : null
        }
        orders={orderData}
        loading={loadingOrders}
        onConfirmStatusChange={confirmStatusChange}
        onCancelStatusChange={cancelStatusChange}
        newStatus={computedStatus}
      />
    </>
  );
};
