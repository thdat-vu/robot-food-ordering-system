"use client";

import { useState } from "react";
import { Play, Loader2, CheckCircle2, XCircle, RefreshCw, Code, Table, ShoppingCart } from "lucide-react";
import apiClient from "@/lib/axios";
import AuthGuard from "@/components/common/AuthGuard";

interface ScriptResult {
  deviceId: string;
  tableId: string;
  scanResult: {
    statusCode: number;
    message: string;
    data?: any;
  };
  orderResult: {
    statusCode: number;
    message: string;
    data?: any;
  };
}

export default function ScriptPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tableId, setTableId] = useState<string>("");

  const handleRunScript = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = tableId.trim() ? { tableId: tableId.trim() } : {};
      const response = await apiClient.get("/Table/random-scan-and-order", { params });
      
      if (response.data?.data) {
        setResult(response.data.data);
      } else {
        setResult(response.data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.message || 
        "Đã xảy ra lỗi khi chạy script"
      );
      console.error("Script error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setTableId("");
  };

  return (
    <AuthGuard allowRoles={['Admin', 'Moderator', 'Chef', 'Waiter']}>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Trang web tạo quét bàn và đặt món ngẫu nhiên
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  quét bàn và đặt món ngẫu nhiên
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Cấu hình
              </h2>

              {/* Table ID Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID Bàn (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  placeholder="Để trống để chọn bàn ngẫu nhiên"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-gray-400 dark:placeholder-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Nếu để trống, một bàn khả dụng sẽ được chọn ngẫu nhiên
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleRunScript}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 
                           bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                           text-white font-medium rounded-lg
                           transition-colors duration-200
                           disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang chạy...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Chạy Script</span>
                    </>
                  )}
                </button>

                {(result || error) && (
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 
                             bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                             text-gray-700 dark:text-gray-300 font-medium rounded-lg
                             transition-colors duration-200"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Đặt lại</span>
                  </button>
                )}
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Script này làm gì:
                </h3>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
                  <li>Tạo ID thiết bị ngẫu nhiên</li>
                  <li>Quét một bàn (ngẫu nhiên hoặc chỉ định)</li>
                  <li>Chọn 1-3 sản phẩm ngẫu nhiên</li>
                  <li>Tạo đơn hàng không có topping</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                            rounded-lg p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">
                    Lỗi
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Success Result */}
            {result && (
              <div className="space-y-6">
                {/* Success Header */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                              rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-green-900 dark:text-green-300">
                      Script đã chạy thành công!
                    </h3>
                    <p className="text-xs text-green-800 dark:text-green-400 mt-1">
                      Đơn hàng đã được tạo với sản phẩm ngẫu nhiên
                    </p>
                  </div>
                </div>

                {/* Device & Table Info */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Chi tiết thực thi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID Thiết bị</div>
                      <div className="text-sm font-mono text-gray-900 dark:text-white break-all">
                        {result.deviceId}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                        <Table className="w-3 h-3" />
                        ID Bàn
                      </div>
                      <div className="text-sm font-mono text-gray-900 dark:text-white break-all">
                        {result.tableId}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scan Result */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Table className="w-5 h-5" />
                    Kết quả quét bàn
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Mã trạng thái</span>
                      <span className={`text-sm font-semibold ${
                        result.scanResult.statusCode === 200 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {result.scanResult.statusCode}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thông báo</div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {result.scanResult.message || "Không có"}
                      </div>
                    </div>
                    {result.scanResult.data && (
                      <details className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          Xem chi tiết
                        </summary>
                        <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                          {JSON.stringify(result.scanResult.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>

                {/* Order Result */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Kết quả đơn hàng
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Mã trạng thái</span>
                      <span className={`text-sm font-semibold ${
                        result.orderResult.statusCode === 200 || result.orderResult.statusCode === 201
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {result.orderResult.statusCode}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thông báo</div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {result.orderResult.message || "Không có"}
                      </div>
                    </div>
                    {result.orderResult.data && (
                      <details className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          Xem chi tiết đơn hàng
                        </summary>
                        <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-96">
                          {JSON.stringify(result.orderResult.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!result && !error && !loading && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 border border-gray-200 dark:border-gray-700 
                            text-center">
                <Code className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Sẵn sàng chạy Script
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nhấn nút "Chạy Script" để bắt đầu kiểm thử
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </AuthGuard>
  );
}

