"use client";

import React, { useEffect, useState } from "react";
import { Clock, Users, QrCode, CheckCircle, Activity } from "lucide-react";

import { TableActivityLog } from "@/entites/moderator/TableActivityLog";
import { tableService } from "@/service/moderator/TableService";
import { translateReasonVI } from "@/components/moderator/translateReasonVI";
import { humanizeAutoReleaseNoOrderTimeout } from "@/components/moderator/AutoReleaseNoOrderTimeout";
import { ActivityNote } from "@/components/moderator/ActivityNote";

const ACTIVITIES_PER_PAGE = 10;

export type TableActivityTrackerProps = {
  propSessionId: string | null;
  propSessionCode: string | null;
  variant?: "page" | "embedded"; // ✅ thêm mode để nhúng modal
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

  // Fetch activities với phân trang
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

      const normalized = list.map((a) => ({
        ...a,
        data: (a as any).data ?? {},
      }));

      setActivities(normalized);
      setTotalActivities(totalCount);
      setTotalPages(Math.max(1, Math.ceil(totalCount / limit)));
    } catch (error) {
      console.error("Lỗi khi tải hoạt động bàn:", error);
      setActivities([]);
      setTotalActivities(0);
      setTotalPages(1);
    } finally {
      setActivityLoading(false);
    }
  };

  // ✅ 1 useEffect: đổi sessionId hoặc đổi trang đều fetch
  useEffect(() => {
    if (!propSessionId) {
      setActivities([]);
      setTotalActivities(0);
      setTotalPages(1);
      setCurrentPage(1);
      return;
    }

    // nếu đổi sessionId mà đang ở page > 1 thì reset về 1 trước
    // (giúp UX hợp lý + tránh fetch trang không tồn tại)
    if (currentPage !== 1) {
      setCurrentPage(1);
      return;
    }

    fetchActivitiesBySessionId(propSessionId, currentPage, ACTIVITIES_PER_PAGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propSessionId]);

  // ✅ Fetch khi đổi trang (sau khi đã reset xong)
  useEffect(() => {
    if (!propSessionId) return;
    fetchActivitiesBySessionId(propSessionId, currentPage, ACTIVITIES_PER_PAGE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Helper: Tên trạng thái món theo enum C#
  const getOrderItemStatusLabel = (status: number | string): string => {
    const map: Record<number | string, string> = {
      1: "Đang chờ",
      Pending: "Đang chờ",
      2: "Đang chế biến",
      Preparing: "Đang chế biến",
      3: "Đã hoàn thành",
      Ready: "Đã hoàn thành",
      4: "Đã phục vụ",
      Served: "Đã phục vụ",
      5: "Hoàn tất",
      Completed: "Hoàn tất",
      6: "Đã hủy",
      Cancelled: "Đã hủy",
      7: "Ghi chú",
      Remark: "Ghi chú",
      8: "Yêu cầu hủy",
      RequestCancel: "Yêu cầu hủy",
    };
    return map[status] || `Trạng thái ${status}`;
  };

  // Helper: Màu badge theo trạng thái mới
  const getStatusColor = (status: number | string): string => {
    switch (Number(status)) {
      case 1:
        return "bg-gray-100 text-gray-700 border-gray-300";
      case 2:
        return "bg-orange-100 text-orange-800 border-orange-300";
      case 3:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case 4:
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case 5:
        return "bg-green-100 text-green-800 border-green-300";
      case 6:
        return "bg-red-100 text-red-800 border-red-300";
      case 7:
        return "bg-purple-100 text-purple-800 border-purple-300";
      case 8:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-600 border-gray-300";
    }
  };

  // Format danh sách món (CreateOrder & AddOrderItems)
  const formatItemsList = (activity: TableActivityLog): string => {
    const data: any = (activity as any).data ?? {};
    let itemsArray: any[] = [];

    if (activity.type === "CreateOrder" && Array.isArray(data.items)) {
      itemsArray = data.items;
    } else if (
      activity.type === "AddOrderItems" &&
      Array.isArray(data.newItems)
    ) {
      itemsArray = data.newItems;
    } else return "";

    return itemsArray
      .map((item) => {
        const qty = item?.quantity > 1 ? ` x${item.quantity}` : "";
        return `${item?.productName || "Món"}${qty}`;
      })
      .join(", ");
  };

  // Format UpdateOrderItemStatus – SIÊU ĐẸP
  const formatUpdateOrderItemStatus = (
    activity: TableActivityLog
  ): React.ReactNode => {
    if (activity.type !== "UpdateOrderItemStatus") return null;

    const data: any = (activity as any).data ?? {};
    const updatedItems = data.updatedItems;

    if (!Array.isArray(updatedItems) || updatedItems.length === 0) {
      return <span className="text-gray-600">Đã cập nhật trạng thái món</span>;
    }

    return (
      <div className="space-y-3">
        {updatedItems.map((item: any, idx: number) => {
          const name = item?.productName || "Món ăn";
          const qty = item?.quantity > 1 ? ` x${item.quantity}` : "";
          const fromStatus = item?.previousStatus ?? item?.oldStatus;
          const toStatus = item?.newStatus ?? item?.status;

          const fromLabel = getOrderItemStatusLabel(fromStatus);
          const toLabel = getOrderItemStatusLabel(toStatus);

          return (
            <div key={idx} className="flex items-center gap-3 text-sm">
              <span className="font-medium text-gray-800 min-w-36">
                {name}
                {qty}
              </span>
              <span className="text-gray-500">→</span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-50">
                  {fromLabel}
                </span>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${getStatusColor(
                    toStatus
                  )}`}
                >
                  {toLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Icon theo loại
  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      CheckIn: <CheckCircle className="w-5 h-5 text-green-500" />,
      ScanAgain: <QrCode className="w-5 h-5 text-blue-500" />,
      CreateOrder: (
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
      ),
      AddOrderItems: (
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
      ),
      UpdateOrderItemStatus: (
        <svg
          className="w-5 h-5 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      PartialPayment: (
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
      ),
      FullPayment: (
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
      ),
      MoveTable: (
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
      ),
      ShareStart: (
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
      ),
      ShareJoin: <Users className="w-5 h-5 text-teal-500" />,
      ShareStop: (
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
      ),
      RequestCheckout: (
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
      ),
      CloseSession: (
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
      ),
      AutoRelease: <Clock className="w-5 h-5 text-amber-500" />,
      AutoReleaseNoOrderTimeout: <Clock className="w-5 h-5 text-orange-500" />,
      AttachDeviceFromModerator: (
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
      ),
    };

    return icons[type] || <Activity className="w-5 h-5 text-gray-500" />;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      // ✅ Onboarding / entry
      CheckIn: "bg-emerald-50 border-emerald-200",
      ScanAgain: "bg-sky-50 border-sky-200",

      // ✅ Order flow
      CreateOrder: "bg-violet-50 border-violet-200",
      AddOrderItems: "bg-indigo-50 border-indigo-200",
      UpdateOrderItemStatus: "bg-teal-50 border-teal-200",

      // ✅ Payment
      PartialPayment: "bg-amber-50 border-amber-200",
      FullPayment: "bg-lime-50 border-lime-200",

      // ✅ Table operations
      MoveTable: "bg-orange-50 border-orange-200",
      AttachDeviceFromModerator: "bg-fuchsia-50 border-fuchsia-200",

      // ✅ Sharing
      ShareStart: "bg-cyan-50 border-cyan-200",
      ShareJoin: "bg-blue-50 border-blue-200",
      ShareStop: "bg-rose-50 border-rose-200",

      // ✅ Checkout / session lifecycle
      RequestCheckout: "bg-yellow-50 border-yellow-200",
      CloseSession: "bg-slate-50 border-slate-300",

      // ✅ Auto / system
      AutoRelease: "bg-zinc-50 border-zinc-200",
      AutoReleaseNoOrderTimeout: "bg-red-50 border-red-200",
    };

    return colors[type] || "bg-gray-50 border-gray-200";
  };

  const activityLabels: Record<string, string> = {
    CheckIn: "Check-in",
    ScanAgain: "Quét lại QR",
    CreateOrder: "Tạo đơn hàng",
    AddOrderItems: "Thêm món vào đơn",
    UpdateOrderItemStatus: "Cập nhật trạng thái món",
    PartialPayment: "Thanh toán một phần",
    FullPayment: "Thanh toán toàn bộ",
    MoveTable: "Chuyển bàn",
    ShareStart: "Bắt đầu chia sẻ bàn",
    ShareJoin: "Thiết bị tham gia chia sẻ",
    ShareStop: "Dừng chia sẻ bàn",
    RequestCheckout: "Yêu cầu thanh toán",
    CloseSession: "Đóng phiên bàn",
    AutoRelease: "Tự động giải phóng",
    AttachDeviceFromModerator: "Moderator gán thiết bị",
    AutoReleaseNoOrderTimeout: "Tự động giải phóng (không đơn)",
  };

  const getActivityLabel = (type: string) => activityLabels[type] || type;

  const formatDateTime = (dateString: string) => {
    return dateString;
  };

  // Tách prefix + nội dung sau dấu ":" để xuống dòng đẹp
  type ReasonObj = { code?: unknown; text?: unknown };
  type ReasonInput = string | ReasonObj | null | undefined;
  // Có thể đặt ở constants/reasons.ts

  const ReasonTextVI: Record<string, string> = {
    // Mã lỗi chung
    TIMEOUT: "Hết thời gian chờ của phiên bàn.",
    MANUAL_CLOSE: "Phiên bàn đã được đóng thủ công bởi điều phối.",
    CUSTOMER_REQUEST: "Khách hàng yêu cầu đóng phiên bàn.",
    NO_SHOW: "Khách hàng không xuất hiện sau thời gian chờ.",
    ORDER_COMPLETED: "Đơn hàng đã hoàn tất và phiên bàn được đóng.",
    PAYMENT_RECEIVED: "Đã nhận thanh toán và đóng phiên bàn.",

    // Ví dụ mở rộng
    DEVICE_DISCONNECTED: "Thiết bị khách hàng đã ngắt kết nối.",
    MODERATOR_ACTION: "Điều phối đã thực hiện hành động đóng phiên bàn.",
    CLEANUP_TASK: "Hệ thống đã tự động dọn dẹp phiên bàn không hoạt động.",
  };

  return (
    <div className={variant === "page" ? "min-h-screen bg-gray-50 p-6" : "p-0"}>
      <div className={variant === "page" ? "max-w-7xl mx-auto" : ""}>
        {/* ✅ Header chỉ hiện ở page */}
        {variant === "page" && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Theo dõi hoạt động bàn
            </h1>
            <p className="text-gray-600">
              {propSessionId
                ? `Session: ${propSessionId.substring(0, 12)}...`
                : "Chưa có session ID"}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Lịch sử hoạt động
          </h2>

          {activityLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="mt-4 text-gray-600">Đang tải hoạt động...</p>
            </div>
          ) : !propSessionId ? (
            <div className="text-center py-16 text-gray-500">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Vui lòng cung cấp session ID</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Chưa có hoạt động nào</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const data: any = (activity as any).data ?? {};

                  return (
                    <div
                      key={(activity as any).id || index}
                      className={`p-5 rounded-lg border-2 ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-semibold text-gray-900">
                              {getActivityLabel(activity.type)}
                            </h3>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatDateTime((activity as any).createdTime)}
                            </span>
                          </div>

                          <div className="text-sm text-gray-700 space-y-2">
                            {data.tableName && (
                              <div>
                                <span className="font-medium">
                                  {data.tableName}
                                </span>
                              </div>
                            )}

                            {data.orderId && (
                              <div>
                                Mã Đơn hàng:{" "}
                                <span className="font-medium">
                                  {data.orderCode}
                                </span>
                              </div>
                            )}

                            {(activity.type === "CreateOrder" ||
                              activity.type === "AddOrderItems") &&
                              data.newTotalPrice !== undefined && (
                                <div className="text-emerald-700 font-medium">
                                  Tổng tiền mới:{" "}
                                  {Number(data.newTotalPrice).toLocaleString(
                                    "vi-VN"
                                  )}{" "}
                                  đ
                                </div>
                              )}

                            {activity.type === "AddOrderItems" &&
                              data.addedTotal !== undefined && (
                                <div className="text-indigo-700">
                                  +{" "}
                                  {Number(data.addedTotal).toLocaleString(
                                    "vi-VN"
                                  )}{" "}
                                  đ
                                </div>
                              )}

                            {(activity.type === "CreateOrder" ||
                              activity.type === "AddOrderItems") &&
                              formatItemsList(activity) && (
                                <div>
                                  <span className="font-medium">Món:</span>{" "}
                                  {formatItemsList(activity)}
                                </div>
                              )}

                            {activity.type === "UpdateOrderItemStatus" && (
                              <div className="mt-4 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
                                <div className="flex items-center gap-3 mb-4">
                                  <svg
                                    className="w-6 h-6 text-emerald-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <div>
                                    <div className="font-bold text-emerald-900">
                                      Trạng thái món đã được cập nhật
                                    </div>
                                    <div className="text-xs text-emerald-700">
                                      Bếp đang xử lý theo yêu cầu
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white/80 rounded-lg p-4 border border-emerald-100">
                                  {formatUpdateOrderItemStatus(activity)}
                                </div>

                                {data.reason && (
                                  <div className="mt-3 text-sm">
                                    <span className="font-medium text-red-700">
                                      Lý do:
                                    </span>{" "}
                                    <span className="text-red-600 italic">
                                      {data.reason}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            {activity.type === "CloseSession" &&
                              (() => {
                                const invoiceId = data?.snapshot?.invoiceId;
                                const actorType = data?.actor?.type ?? "System";
                                const sourceLabel =
                                  actorType === "System"
                                    ? "Hệ thống"
                                    : "Điều phối";

                                if (invoiceId) {
                                  return (
                                    <ActivityNote
                                      tone="emerald"
                                      title="Đóng phiên (Checkout)"
                                      message="Đã thanh toán và đóng phiên."
                                      badges={["Đã thanh toán"]} // ✅ array
                                      footer={`InvoiceId: ${String(invoiceId)}`}
                                    />
                                  );
                                }

                                const { body } = translateReasonVI(
                                  data?.reason
                                );

                                return (
                                  <ActivityNote
                                    tone="rose"
                                    title={
                                      actorType === "System"
                                        ? "Đóng phiên (Tự động)"
                                        : "Đóng phiên (Điều phối)"
                                    }
                                    message={body}
                                    badges={[`Nguồn: ${sourceLabel}`]} // ✅ array
                                  />
                                );
                              })()}

                            {activity.type === "AutoReleaseNoOrderTimeout" &&
                              (() => {
                                const msg =
                                  humanizeAutoReleaseNoOrderTimeout(data);
                                const minutes = data?.autoReleaseMinutes;

                                return (
                                  <ActivityNote
                                    tone="amber"
                                    title="Tự động giải phóng bàn"
                                    message={msg}
                                    badges={[
                                      "Nguồn: Hệ thống",
                                      ...(typeof minutes === "number"
                                        ? [`${minutes} phút`]
                                        : []),
                                    ]} // ✅ 2 badges cùng hàng
                                  />
                                );
                              })()}

                            {data.paidAmount !== undefined && (
                              <div className="text-green-700 font-medium">
                                Đã thanh toán:{" "}
                                {Number(data.paidAmount).toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                đ
                              </div>
                            )}

                            {data.remainingAmount !== undefined && (
                              <div>
                                Còn lại:{" "}
                                {Number(data.remainingAmount).toLocaleString(
                                  "vi-VN"
                                )}{" "}
                                đ
                              </div>
                            )}

                            {data.fromTableName && data.toTableName && (
                              <div>
                                Chuyển từ <strong>{data.fromTableName}</strong>{" "}
                                → <strong>{data.toTableName}</strong>
                              </div>
                            )}

                            {data.shareCode && (
                              <div>
                                Mã chia sẻ:{" "}
                                <code className="bg-gray-200 px-2 py-1 rounded">
                                  {data.shareCode}
                                </code>
                              </div>
                            )}

                            {data.joinedUser && (
                              <div>Tham gia: {data.joinedUser}</div>
                            )}

                            {data.paymentMethod && (
                              <div>Phương thức: {data.paymentMethod}</div>
                            )}

                            {data.sessionDuration && (
                              <div>
                                Thời gian sử dụng: {data.sessionDuration}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-200 gap-4">
                  <p className="text-sm text-gray-700">
                    Hiển thị {(currentPage - 1) * ACTIVITIES_PER_PAGE + 1} -{" "}
                    {Math.min(
                      currentPage * ACTIVITIES_PER_PAGE,
                      totalActivities
                    )}{" "}
                    / {totalActivities} hoạt động
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || activityLoading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trang trước
                    </button>
                    <span className="px-4 py-2 text-sm font-semibold text-gray-900 bg-gray-100 rounded-md border border-gray-300">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages || activityLoading}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trang sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableActivityTracker;
