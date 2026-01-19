"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
  Users,
  QrCode,
  CheckCircle,
  Activity,
  ShoppingCart,
  Edit,
  ArrowRight,
  XCircle,
  DollarSign,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { TableActivityLog } from "@/entites/moderator/TableActivityLog";
import { tableService } from "@/service/moderator/TableService";
import { translateReasonVI } from "@/components/moderator/translateReasonVI";
import { humanizeAutoReleaseNoOrderTimeout } from "@/components/moderator/AutoReleaseNoOrderTimeout";
import { ActivityNote } from "@/components/moderator/ActivityNote";
import InvoiceActivityItem from "@/components/moderator/Activity/InvoiceActivityItem";

const ACTIVITIES_PER_PAGE = 10;

export type TableActivityTrackerProps = {
  propSessionId: string | null;
  propSessionCode: string | null;
  variant?: "page" | "embedded";
};

export const TableActivityTracker: React.FC<TableActivityTrackerProps> = ({
  propSessionId,
  propSessionCode,
  variant = "page",
}) => {
  const [activities, setActivities] = useState<TableActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  /* ================= FETCH ================= */

  const fetchActivitiesBySessionId = async (
    sessionId: string | null,
    page: number,
    limit: number
  ) => {
    if (!sessionId) {
      setActivities([]);
      setTotalActivities(0);
      setTotalPages(1);
      return;
    }

    try {
      setActivityLoading(true);
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
      }

      setActivities(
        list.map((a) => ({
          ...a,
          data: (a as any).data ?? {},
        }))
      );
      setTotalActivities(totalCount);
      setTotalPages(Math.max(1, Math.ceil(totalCount / limit)));
    } catch (err) {
      setActivities([]);
      setTotalActivities(0);
      setTotalPages(1);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (!propSessionId) return;
    fetchActivitiesBySessionId(propSessionId, currentPage, ACTIVITIES_PER_PAGE);
  }, [propSessionId, currentPage]);

  useEffect(() => {
    if (propSessionId && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [propSessionId]);

  /* ================= HELPERS ================= */

  const toggleRowExpansion = (activityCode: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [activityCode]: !prev[activityCode],
    }));
  };

  const getActivityLabel = (type: string) =>
  ((
    {
      CheckIn: "Check-in",
      ScanAgain: "Quét lại QR",
      CreateOrder: "Tạo đơn hàng",
      AddOrderItems: "Thêm món",
      UpdateOrderItemStatus: "Cập nhật món",
      CancelOrderItem: "Huỷ món",
      RemakeOrderItem: "Làm lại món",
      PartialPayment: "Thanh toán một phần",
      FullPayment: "Thanh toán đầy đủ",
      MoveTable: "Chuyển bàn",
      ShareStart: "Chia sẻ bàn",
      ShareJoin: "Thiết bị tham gia",
      ShareStop: "Dừng chia sẻ",
      RequestCheckout: "Yêu cầu thanh toán",
      CreateInvoice: "Tạo hóa đơn",
      CloseSession: "Đóng phiên",
      AutoRelease: "Tự động giải phóng",
      AutoReleaseNoOrderTimeout: "Tự động (không đơn)",
      AttachDeviceFromModerator: "Gán thiết bị",
    } as Record<string, string>
  )[type] || type);

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      CheckIn: <CheckCircle className="w-5 h-5" />,
      ScanAgain: <QrCode className="w-5 h-5" />,
      CreateOrder: <ShoppingCart className="w-5 h-5" />,
      AddOrderItems: <ShoppingCart className="w-5 h-5" />,
      UpdateOrderItemStatus: <Edit className="w-5 h-5" />,
      CancelOrderItem: <XCircle className="w-5 h-5" />,
      RemakeOrderItem: <Edit className="w-5 h-5" />,
      MoveTable: <ArrowRight className="w-5 h-5" />,
      ShareJoin: <Users className="w-5 h-5" />,
      ShareStart: <Users className="w-5 h-5" />,
      ShareStop: <Users className="w-5 h-5" />,
      CloseSession: <XCircle className="w-5 h-5" />,
      FullPayment: <DollarSign className="w-5 h-5" />,
      PartialPayment: <DollarSign className="w-5 h-5" />,
      CreateInvoice: <FileText className="w-5 h-5" />,
      AutoRelease: <Clock className="w-5 h-5" />,
      AutoReleaseNoOrderTimeout: <Clock className="w-5 h-5" />,
    };
    return icons[type] || <Activity className="w-5 h-5" />;
  };

  const getActivityColor = (type: string) => {
    const colorMap: Record<string, string> = {
      CheckIn: "text-emerald-600",
      CreateOrder: "text-blue-600",
      AddOrderItems: "text-indigo-600",
      UpdateOrderItemStatus: "text-amber-600",
      CancelOrderItem: "text-red-600",
      RemakeOrderItem: "text-purple-600",
      MoveTable: "text-purple-600",
      CloseSession: "text-rose-600",
      FullPayment: "text-green-600",
      PartialPayment: "text-green-600",
      CreateInvoice: "text-teal-600",
      AutoRelease: "text-amber-600",
      AutoReleaseNoOrderTimeout: "text-red-600",
    };
    return colorMap[type] || "text-gray-500";
  };

  const getBadgeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      CheckIn: "bg-emerald-50 text-emerald-700 border-emerald-200",
      CreateOrder: "bg-blue-50 text-blue-700 border-blue-200",
      AddOrderItems: "bg-indigo-50 text-indigo-700 border-indigo-200",
      UpdateOrderItemStatus: "bg-amber-50 text-amber-700 border-amber-200",
      CancelOrderItem: "bg-red-50 text-red-700 border-red-200",
      RemakeOrderItem: "bg-purple-50 text-purple-700 border-purple-200",
      MoveTable: "bg-purple-50 text-purple-700 border-purple-200",
      CloseSession: "bg-rose-50 text-rose-700 border-rose-200",
      FullPayment: "bg-green-50 text-green-700 border-green-200",
      PartialPayment: "bg-green-50 text-green-700 border-green-200",
      CreateInvoice: "bg-teal-50 text-teal-700 border-teal-200",
      AutoRelease: "bg-amber-50 text-amber-700 border-amber-200",
      AutoReleaseNoOrderTimeout: "bg-red-50 text-red-700 border-red-200",
    };
    return colorMap[type] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusLabel = (status: number) => {
    const labels: Record<number, string> = {
      1: "Chờ xác nhận",
      2: "Đang chế biến",
      3: "Đã hoàn thành",
      4: "Đã giao",
    };
    return labels[status] || status.toString();
  };

  const hasExpandableContent = (activity: TableActivityLog) => {
    const data: any = activity.data ?? {};
    return (
      (activity.type === "CreateOrder" && data.items) ||
      (activity.type === "AddOrderItems" && data.newItems) ||
      (activity.type === "UpdateOrderItemStatus" && data.updatedItems)
    );
  };

  const getCurrentTableName = () => {
    if (activities.length === 0) return "-";
    const latestActivity = activities[0];
    const data: any = latestActivity.data ?? {};
    return data.tableName || data.snapshot?.tablename || "-";
  };

  const getCurrentOrderCode = () => {
    if (activities.length === 0) return "-";
    const orderActivity = activities.find((a) => (a.data as any)?.orderCode);
    return (orderActivity?.data as any)?.orderCode || "-";
  };

  /* ================= RENDER ================= */

  return (
    <div
      className={
        variant === "page"
          ? "min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8"
          : ""
      }
    >
      <div className={variant === "page" ? "max-w-[1400px] mx-auto" : ""}>
        {/* Header */}
        {variant === "page" && (
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Lịch sử hoạt động bàn
                </h1>
                <p className="text-gray-600 mt-1">
                  Theo dõi chi tiết các hoạt động của phiên bàn
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Table Header Info */}
          <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Tổng hoạt động
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalActivities}
                  </p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Phiên hiện tại
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getCurrentTableName()}
                  </p>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                    Mã đơn hàng
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {getCurrentOrderCode()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading / Empty / Table */}
          {activityLoading ? (
            <div className="py-24 text-center text-gray-500">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
              <p className="text-lg">Đang tải hoạt động...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="py-24 text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có hoạt động nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left w-12"></th>
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Thời gian
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Hoạt động
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Chi tiết
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Nguồn
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activities.map((activity, idx) => {
                    const data: any = activity.data ?? {};
                    const actor =
                      data?.actor?.type === "System" ? "Hệ thống" : "Điều phối";
                    const isExpanded =
                      expandedRows[(activity as any).activityCode];
                    const canExpand = hasExpandableContent(activity);

                    return (
                      <React.Fragment key={(activity as any).id || idx}>
                        <tr className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                          {/* Expand Button */}
                          <td className="px-6 py-5 align-top">
                            {canExpand && (
                              <button
                                onClick={() =>
                                  toggleRowExpansion(
                                    (activity as any).activityCode
                                  )
                                }
                                className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                            )}
                          </td>

                          {/* Time Column */}
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-start gap-3">
                              <div
                                className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-white to-gray-50 border shadow-sm group-hover:shadow-md transition-shadow ${getActivityColor(
                                  activity.type
                                )}`}
                              >
                                {getActivityIcon(activity.type)}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {(activity as any).createdTime}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5 font-mono">
                                  {(activity as any).activityCode}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Activity Type Column */}
                          <td className="px-6 py-5 align-top">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold border ${getBadgeColor(
                                activity.type
                              )}`}
                            >
                              {getActivityLabel(activity.type)}
                            </span>
                          </td>

                          {/* Details Column */}
                          <td className="px-6 py-5">
                            <div className="space-y-2.5 text-sm">
                              {data.tableName && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 font-medium min-w-[80px]">
                                    Bàn:
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {data.tableName}
                                  </span>
                                </div>
                              )}

                              {data.orderCode && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500 font-medium min-w-[80px]">
                                    Đơn hàng:
                                  </span>
                                  <span className="text-gray-900 font-semibold">
                                    {data.orderCode}
                                  </span>
                                </div>
                              )}

                              {activity.type === "MoveTable" && (
                                <div className="bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                                  <div className="flex items-center gap-2">
                                    <span className="text-purple-900 font-semibold">
                                      {data.fromTableName}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-purple-600" />
                                    <span className="text-purple-900 font-semibold">
                                      {data.toTableName}
                                    </span>
                                  </div>
                                  {data.reason && (
                                    <p className="text-xs text-purple-700 mt-1.5 italic">
                                      {data.reason}
                                    </p>
                                  )}
                                </div>
                              )}

                              {(activity.type === "CreateOrder" ||
                                activity.type === "AddOrderItems") && (
                                  <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xs text-blue-700">
                                        <span className="font-semibold">
                                          {data.itemCount || data.newItemCount}
                                        </span>{" "}
                                        món
                                      </span>
                                      <span className="text-xs text-blue-700">
                                        •
                                      </span>
                                      <span className="text-xs font-semibold text-blue-900">
                                        {(
                                          data.totalPrice || data.addedTotal
                                        )?.toLocaleString("vi-VN")}{" "}
                                        ₫
                                      </span>
                                    </div>
                                  </div>
                                )}

                              {activity.type === "UpdateOrderItemStatus" && (
                                <div className="bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                                  <span className="text-xs text-amber-700">
                                    Cập nhật{" "}
                                    <span className="font-semibold">
                                      {data.updatedItems?.length || 0}
                                    </span>{" "}
                                    món
                                  </span>
                                </div>
                              )}

                              {activity.type === "CreateInvoice" &&
                                data.invoiceId && (
                                  <InvoiceActivityItem
                                    activity={{
                                      type: "CreateInvoice",
                                      data,
                                    }}
                                    timeStamp={(activity as any).createdTime}
                                  />
                                )}

                              {activity.type === "CloseSession" && (
                                <ActivityNote
                                  tone="rose"
                                  title="Đóng phiên bàn"
                                  message={translateReasonVI(data.reason).body}
                                  badges={[`Nguồn: ${actor}`]}
                                />
                              )}

                              {activity.type ===
                                "AutoReleaseNoOrderTimeout" && (
                                  <ActivityNote
                                    tone="amber"
                                    title="Tự động giải phóng"
                                    message={humanizeAutoReleaseNoOrderTimeout(
                                      data
                                    )}
                                    badges={["Hệ thống"]}
                                  />
                                )}
                            </div>
                          </td>

                          {/* Source Column */}
                          <td className="px-6 py-5 align-top">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${actor === "Hệ thống"
                                  ? "bg-gray-100 text-gray-700 border border-gray-200"
                                  : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                }`}
                            >
                              {actor}
                            </span>
                          </td>
                        </tr>

                        {/* Expanded Details Row */}
                        {isExpanded && canExpand && (
                          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <td></td>
                            <td colSpan={4} className="px-6 py-4">
                              <div className="bg-white rounded-lg border-2 border-blue-200 p-4 shadow-sm">
                                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                                  Danh sách món
                                </h4>

                                {activity.type === "CreateOrder" &&
                                  data.items && (
                                    <div className="space-y-2">
                                      {data.items.map(
                                        (item: any, i: number) => (
                                          <div
                                            key={i}
                                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                          >
                                            <div className="flex items-center gap-3">
                                              <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded">
                                                #{i + 1}
                                              </span>
                                              <span className="text-sm font-medium text-gray-900">
                                                {item.productName}
                                              </span>
                                            </div>
                                            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                                              Size: {item.sizeName}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}

                                {activity.type === "AddOrderItems" &&
                                  data.newItems && (
                                    <div className="space-y-2">
                                      {data.newItems.map(
                                        (item: any, i: number) => (
                                          <div
                                            key={i}
                                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                          >
                                            <div className="flex items-center gap-3">
                                              <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded">
                                                #{i + 1}
                                              </span>
                                              <span className="text-sm font-medium text-gray-900">
                                                {item.productName}
                                              </span>
                                            </div>
                                            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                                              Size: {item.sizeName}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}

                                {activity.type === "UpdateOrderItemStatus" &&
                                  data.updatedItems && (
                                    <div className="space-y-2">
                                      {data.updatedItems.map(
                                        (item: any, i: number) => (
                                          <div
                                            key={i}
                                            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                          >
                                            <div className="flex items-center gap-3">
                                              <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded">
                                                #{i + 1}
                                              </span>
                                              <span className="text-sm font-medium text-gray-900">
                                                {item.productName}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded font-medium">
                                                {getStatusLabel(
                                                  item.previousStatus
                                                )}
                                              </span>
                                              <ArrowRight className="w-3 h-3 text-gray-400" />
                                              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-semibold">
                                                {getStatusLabel(item.newStatus)}
                                              </span>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-8 py-5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-medium">
                  Trang{" "}
                  <span className="font-bold text-gray-900">{currentPage}</span>{" "}
                  / {totalPages}
                </span>
                <div className="flex gap-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-5 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ← Trước
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="px-5 py-2.5 rounded-lg border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableActivityTracker;
