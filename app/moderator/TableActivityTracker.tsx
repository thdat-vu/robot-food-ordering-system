"use client";
import React, { useState, useEffect, useMemo } from "react"; // 💡 Thêm useMemo
import { Clock, Users, QrCode, CheckCircle, Activity } from "lucide-react";
// ⚠️ Giả định tableService đã được update để chấp nhận tham số phân trang

import {
  TableActivityLog,
  TableActivityTrackerProps,
  TableActivityType,
} from "@/entites/moderator/TableActivityLog";
import { tableService } from "@/service/moderator/TableService";

// ⚙️ Cấu hình hằng số phân trang
const ACTIVITIES_PER_PAGE = 10;

export const TableActivityTracker: React.FC<TableActivityTrackerProps> = ({
  propSessionId,
}) => {
  const [activities, setActivities] = useState<TableActivityLog[]>([]);
  const [table, setTable] = useState();
  const [activityLoading, setActivityLoading] = useState(false);

  // 🆕 STATE CHO PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  // -------------------------

  console.log(
    "📝 TableActivityTracker rendered with sessionId:",
    propSessionId
  );

  // 🔄 Cập nhật hàm fetch để hỗ trợ phân trang
  const fetchActivitiesBySessionId = async (
    sessionId: string | null,
    page: number,
    limit: number
  ) => {
    if (!sessionId) {
      console.log("⚠️ Không có sessionId, clear activities");
      setActivities([]);
      setTotalActivities(0);
      setTotalPages(1);
      return;
    }

    try {
      setActivityLoading(true);

      // 📞 GỌI API VỚI PHÂN TRANG
      // ⚠️ Giả định tableService.getActivitiesBySessionId trả về { data: TableActivityLog[], totalCount: number }
      const res = await tableService.getActivitiesBySessionId(
        sessionId,
        page,
        limit
      );

      let list: TableActivityLog[] = [];
      let totalCount = 0;

      if (Array.isArray(res)) {
        list = res;
        totalCount = res.length;
      } else if (res && Array.isArray((res as any)?.data)) {
        list = (res as any).data;
        totalCount = (res as any).totalCount ?? list.length;
      } else {
        console.error("getActivitiesBySessionId không trả về array:", res);
        list = [];
        totalCount = 0;
      }

      const normalized = list.map((a) => ({
        ...a,
        data: a.data ?? {},
      }));

      console.log("🔍 Fetched activities:", normalized);
      // 💾 CẬP NHẬT STATE PHÂN TRANG
      setActivities(normalized);
      setTotalActivities(totalCount);
      setTotalPages(Math.ceil(totalCount / limit));

      console.log(
        `🔄 Fetched ${normalized.length} activities (Total: ${totalCount}) for sessionId: ${sessionId}, Page: ${page}`
      );
    } catch (error) {
      console.error("❌ Lỗi khi tải hoạt động bàn:", error);
      setActivities([]);
      setTotalActivities(0);
      setTotalPages(1);
    } finally {
      setActivityLoading(false);
    }
  };

  // 1. useEffect theo dõi propSessionId (reset trang về 1 nếu thay đổi)
  useEffect(() => {
    if (propSessionId) {
      // Nếu session ID thay đổi, luôn chuyển về trang 1.
      // Nếu đã ở trang 1, gọi fetch ngay.
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchActivitiesBySessionId(
          propSessionId,
          currentPage,
          ACTIVITIES_PER_PAGE
        );
      }
    } else {
      setActivities([]);
      setActivityLoading(false);
      setTotalActivities(0);
      setTotalPages(1);
      setCurrentPage(1);
    }
  }, [propSessionId]);

  // 2. useEffect theo dõi currentPage (chỉ fetch khi currentPage thay đổi)
  useEffect(() => {
    if (propSessionId) {
      fetchActivitiesBySessionId(
        propSessionId,
        currentPage,
        ACTIVITIES_PER_PAGE
      );
    }
  }, [currentPage]);

  // 🎯 LOGIC MAP MÓN ĂN CHUẨN XÁC
  const formatItemsList = (activity: TableActivityLog): string => {
    let itemsArray: any[] = [];

    // Lấy mảng items dựa trên type
    if (activity.type === "CreateOrder" && Array.isArray(activity.data.items)) {
      itemsArray = activity.data.items;
    } else if (
      activity.type === "AddOrderItems" &&
      Array.isArray(activity.data.newItems)
    ) {
      itemsArray = activity.data.newItems;
    } else {
      return ""; // Không phải hoạt động liên quan đến món ăn
    }

    // Map tên sản phẩm (và số lượng nếu có)
    const itemNames = itemsArray.map((item) => {
      // Giả sử số lượng (quantity) là 1 nếu không có trường cụ thể
      const quantity = item.quantity ?? 1;
      return `${item.productName}${quantity > 1 ? ` x${quantity}` : ""}`;
    });

    return itemNames.join(", ");
  };
  // ------------------------------------

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CheckIn":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "ScanAgain":
        return <QrCode className="w-5 h-5 text-blue-500" />;
      case "CreateOrder":
        return (
          <svg
            className="w-5 h-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        );
      case "AddOrderItems":
        return (
          <svg
            className="w-5 h-5 text-indigo-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        );
      case "PartialPayment":
        return (
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      case "FullPayment":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "MoveTable":
        return (
          <svg
            className="w-5 h-5 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        );
      case "ShareStart":
        return (
          <svg
            className="w-5 h-5 text-cyan-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        );
      case "ShareJoin":
        return <Users className="w-5 h-5 text-teal-500" />;
      case "ShareStop":
        return (
          <svg
            className="w-5 h-5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        );
      case "RequestCheckout":
        return (
          <svg
            className="w-5 h-5 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        );
      case "CloseSession":
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "AutoRelease":
        return <Clock className="w-5 h-5 text-slate-500" />;
      case "AttachDeviceFromModerator":
        return (
          <svg
            className="w-5 h-5 text-violet-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "CheckIn":
        return "bg-green-50 border-green-200";
      case "ScanAgain":
        return "bg-blue-50 border-blue-200";
      case "CreateOrder":
        return "bg-purple-50 border-purple-200";
      case "AddOrderItems":
        return "bg-indigo-50 border-indigo-200";
      case "PartialPayment":
        return "bg-yellow-50 border-yellow-200";
      case "FullPayment":
        return "bg-green-100 border-green-300";
      case "MoveTable":
        return "bg-orange-50 border-orange-200";
      case "ShareStart":
        return "bg-cyan-50 border-cyan-200";
      case "ShareJoin":
        return "bg-teal-50 border-teal-200";
      case "ShareStop":
        return "bg-red-50 border-red-200";
      case "RequestCheckout":
        return "bg-amber-50 border-amber-200";
      case "CloseSession":
        return "bg-gray-50 border-gray-300";
      case "AutoRelease":
        return "bg-slate-50 border-slate-200";
      case "AttachDeviceFromModerator":
        return "bg-violet-50 border-violet-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const activityLabels: Record<TableActivityType, string> = {
    CheckIn: "Check-in",
    ScanAgain: "Quét lại QR",
    CreateOrder: "Tạo order",
    AddOrderItems: "Thêm món vào order",
    PartialPayment: "Thanh toán một phần",
    FullPayment: "Thanh toán toàn bộ",
    MoveTable: "Chuyển bàn",
    ShareStart: "Bắt đầu chia sẻ bàn",
    ShareJoin: "Thiết bị join share bàn",
    ShareStop: "Dừng chia sẻ bàn",
    RequestCheckout: "Khách yêu cầu checkout",
    CloseSession: "Đóng phiên bàn",
    AutoRelease: "Hệ thống auto release",
    AttachDeviceFromModerator: "Moderator gán thiết bị",
  };

  const getActivityLabel = (type: TableActivityType): string => {
    return activityLabels[type];
  };

  const formatDateTime = (dateString: string) => {
    return dateString;
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Theo dõi hoạt động bàn
          </h1>
          <p className="text-gray-600">
            {propSessionId
              ? `Đang hiển thị hoạt động cho session: ${propSessionId.substring(
                  0,
                  12
                )}...`
              : "Không có session ID nào được cung cấp"}
          </p>
        </div>

        {/* Chi tiết hoạt động */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Lịch sử hoạt động
            </h2>

            {activityLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải hoạt động...</p>
              </div>
            ) : !propSessionId ? (
              <div className="text-center py-16 text-gray-500">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Vui lòng cung cấp một session ID để xem hoạt động</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Không có hoạt động nào được ghi nhận</p>
              </div>
            ) : (
              // ⚠️ Xóa max-h và overflow-y-auto khi dùng phân trang để dễ đọc
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className={`p-4 rounded-lg border-2 ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">
                            {getActivityLabel(activity.type)}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDateTime(activity.createdTime)}
                          </span>
                        </div>

                        {activity.data && (
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            {activity.data.tableId && (
                              <div>
                                <span className="font-medium">Bàn:</span>{" "}
                                {activity.data.tableId.substring(0, 16)}...
                              </div>
                            )}
                            {activity.data.tableName && (
                              <div>
                                <span className="font-medium">Tên :</span>{" "}
                                {activity.data.tableName}
                              </div>
                            )}
                            {activity.data.orderId && (
                              <div>
                                <span className="font-medium">Đơn hàng:</span>{" "}
                                {activity.data.orderId.substring(0, 16)}...
                              </div>
                            )}
                            {/* Hiển thị TỔNG TIỀN của đơn hàng mới (từ CreateOrder) */}
                            {(activity.type === "CreateOrder" ||
                              activity.type === "AddOrderItems") &&
                              activity.data.newTotalPrice !== undefined && (
                                <div>
                                  <span className="font-medium">
                                    Tổng tiền mới:
                                  </span>{" "}
                                  {activity.data.newTotalPrice.toLocaleString(
                                    "vi-VN"
                                  )}{" "}
                                  đ
                                </div>
                              )}
                            {/* Hiển thị số tiền đã thêm (từ AddOrderItems) */}
                            {activity.type === "AddOrderItems" &&
                              activity.data.addedTotal !== undefined && (
                                <div>
                                  <span className="font-medium">Thêm:</span>{" "}
                                  {activity.data.addedTotal.toLocaleString(
                                    "vi-VN"
                                  )}{" "}
                                  đ
                                </div>
                              )}
                            {/* 🎯 LOGIC MAP MÓN ĂN CHUẨN */}
                            {(activity.type === "CreateOrder" ||
                              activity.type === "AddOrderItems") && (
                              <div>
                                <span className="font-medium">Món:</span>{" "}
                                {formatItemsList(activity)}
                              </div>
                            )}
                            {/* --------------------------- */}
                            {activity.data.paidAmount !== undefined && (
                              <div>
                                <span className="font-medium">
                                  Đã thanh toán:
                                </span>{" "}
                                {activity.data.paidAmount.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                đ
                              </div>
                            )}
                            {activity.data.remainingAmount !== undefined && (
                              <div>
                                <span className="font-medium">Còn lại:</span>{" "}
                                {activity.data.remainingAmount.toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                đ
                              </div>
                            )}
                            {activity.data.fromTableName &&
                              activity.data.toTableName && (
                                <div>
                                  <span className="font-medium">
                                    Chuyển từ:
                                  </span>{" "}
                                  {activity.data.fromTableName} →{" "}
                                  {activity.data.toTableName}
                                </div>
                              )}
                            {activity.data.shareCode && (
                              <div>
                                <span className="font-medium">Mã chia sẻ:</span>{" "}
                                {activity.data.shareCode}
                              </div>
                            )}
                            {activity.data.joinedUser && (
                              <div>
                                <span className="font-medium">
                                  Người tham gia:
                                </span>{" "}
                                {activity.data.joinedUser}
                              </div>
                            )}
                            {activity.data.paymentMethod && (
                              <div>
                                <span className="font-medium">
                                  Phương thức:
                                </span>{" "}
                                {activity.data.paymentMethod}
                              </div>
                            )}
                            {activity.data.sessionDuration && (
                              <div>
                                <span className="font-medium">Thời gian:</span>{" "}
                                {activity.data.sessionDuration}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 🆕 GIAO DIỆN PHÂN TRANG */}
            {propSessionId && totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Đang hiển thị {(currentPage - 1) * ACTIVITIES_PER_PAGE + 1}
                  đến
                  {Math.min(currentPage * ACTIVITIES_PER_PAGE, totalActivities)}
                  {totalActivities}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1 || activityLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trang trước
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-gray-900 bg-gray-100 rounded-md border border-gray-300">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages || activityLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            )}
            {/* --------------------------- */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableActivityTracker;
