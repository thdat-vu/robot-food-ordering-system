import React, { useCallback, useEffect, useState } from "react";
import {
  Clock,
  DollarSign,
  CheckCircle,
  Utensils,
  PackageCheck,
  XCircle,
  Hourglass,
  MessageSquare,
  Calendar,
  Star,
  Award,
  RefreshCw,
  Truck,
  ChevronDown,
  ChevronUp,
  Search,
  ShoppingCart,
  LogOut,
  RotateCcw,
  UtensilsCrossed,
} from "lucide-react";
import { OrderCardProps } from "@/entites/moderator/FeedbackModole";
import {
  groupItemsPerOrder,
  calculateOrdersStatistics,
  formatVNCurrency,
  formatVNNumber,
} from "@/lib/utils/orderGroupingitem";
import { ApiBaseResponse, ApiOrderResponse } from "@/lib/api/orders";
import { useDateFilterUI } from "@/hooks/moderator/useDateFilterUI";
import { OrderData } from "@/entites/moderator/tableModel";
import { DateRangeFilter } from "./DateRangeFilter";
import { ordersApi } from "@/lib/api/orders";
import {
  getStatusBadge,
  getStatusIcon,
  getStatusLabel,
  getStatusColorClass,
  getPaymentStatusBadge,
} from "@/lib/utils/statusBadge";

const OrderCard: React.FC<OrderCardProps> = ({
  tableId,
  orders: propOrders,
  onToggleExpand,
  expandedOrderId,
  fetchOrders,
  initialOrders = [],
  showDateFilter = false,
  onOrdersChange,
}) => {
  // Local state
  const [localExpandedId, setLocalExpandedId] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<OrderData[]>([]);
  const [hasUserClickedSearch, setHasUserClickedSearch] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use local state if no external control provided
  const currentExpandedId =
    expandedOrderId !== undefined ? expandedOrderId : localExpandedId;

  const toggleExpand = (orderId: string) => {
    if (onToggleExpand) {
      onToggleExpand(orderId);
    } else {
      setLocalExpandedId((prev) => (prev === orderId ? null : orderId));
    }
  };

  const toggleRowExpansion = (orderId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Sync propOrders -> filteredOrders
  useEffect(() => {
    if (propOrders) {
      setFilteredOrders(propOrders || []);
    }
  }, [propOrders]);

  console.log(
    "🚀 ~ file: OrderCard.tsx:216 ~ OrderCard ~ filteredOrders:",
    filteredOrders
  );
  const handleDateSearch = useCallback(
    async (startDate: string | null, endDate: string | null) => {
      if (!hasUserClickedSearch) return;

      try {
        setIsLoading(true);
        setError(null);

        const targetTableId = tableId;
        const response = await ordersApi.getOrdersByTableIdOnly(
          targetTableId.toString(),
          startDate,
          endDate
        );

        if (response.data.statusCode === 200 && response.data.data) {
          const apiOrders = response.data.data as OrderData[];

          const newOrders: OrderData[] = apiOrders.map((order) => ({
            ...order,
            createdTime: order.createdTime ?? "",
          }));

          setFilteredOrders(newOrders);
          if (onOrdersChange) {
            onOrdersChange(newOrders, targetTableId.toString());
          }
        } else {
          setError("Không có đơn hàng trong khoảng thời gian đã chọn");
          setFilteredOrders([]);
          if (onOrdersChange) {
            onOrdersChange([], targetTableId.toString());
          }
        }
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
        setError("Có lỗi xảy ra khi gọi API");
      } finally {
        setIsLoading(false);
      }
    },
    [propOrders, tableId, onOrdersChange, hasUserClickedSearch]
  );

  const handleReset = () => {
    setFilteredOrders(propOrders || []);
    setHasUserClickedSearch(false);
    setSearchQuery("");
  };

  // Utility functions
  const parseDate = (date: string | Date) => {
    if (date instanceof Date) return date;
    const [day, month, yearAndTime] = date.split("/");
    const [year, time] = yearAndTime.split(" ");
    return new Date(`${year}-${month}-${day}T${time}`);
  };

  const getRelativeTime = (date: Date | string) => {
    const parsedDate = parseDate(date);
    if (isNaN(parsedDate.getTime())) return "Không xác định";
    const now = new Date();
    const diff = now.getTime() - parsedDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  // Using shared status utility from lib/utils/statusBadge.tsx

  const OrderItemStatusLabel: Record<string, string> = {
    pending: "Đang chờ xác nhận",
    preparing: "Đang chuẩn bị món",
    delivering: "Đang giao món",
    ready: "Sẵn sàng phục vụ",
    served: "Đã phục vụ",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    requestcancel: "Yêu cầu hủy / đổi món",
    abandoned: "Món chưa được xử lý (khách đã rời bàn)",
  };

  // Determine which orders to display
  const displayOrders = hasUserClickedSearch ? filteredOrders : propOrders;
  const ordersWithGroupedItems = groupItemsPerOrder(displayOrders);

  // Filter orders by search query
  const searchFilteredOrders = ordersWithGroupedItems.filter((order) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    // Search by order code
    if (order.orderCode?.toLowerCase().includes(query)) return true;

    // Search by product names
    return order.groupedItems?.some((item) =>
      item.productName?.toLowerCase().includes(query)
    );
  });

  const statistics = calculateOrdersStatistics(displayOrders);

  // Handle initial empty state
  if (!hasUserClickedSearch && propOrders.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-8 text-center border border-gray-200/50">
        <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          Không có đơn hàng
        </h3>
        <p className="text-gray-500">Bàn này hiện tại không có đơn hàng nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            Chi Tiết Đơn Hàng
          </h3>
        </div>
      </div>

      {/* Date Filter */}
      {showDateFilter && (
        <DateRangeFilter
          onSearch={async (startDate, endDate) => {
            setHasUserClickedSearch(true);
            handleDateSearch(startDate, endDate);
          }}
          isLoading={isLoading}
          error={error}
          onClearError={handleReset}
        />
      )}

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Stats Header
        <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                Tổng đơn hàng
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {ordersWithGroupedItems.length}
              </p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                Tổng tiền
              </p>
              <p className="text-xl font-bold text-emerald-600">
                {formatVNNumber(
                  ordersWithGroupedItems.reduce(
                    (sum, o) => sum + o.totalPrice,
                    0
                  )
                )}
                đ
              </p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                Đã thanh toán
              </p>
              <p className="text-lg font-semibold text-blue-600">
                {
                  ordersWithGroupedItems.filter(
                    (o) => o.paymentStatus === "Paid"
                  ).length
                }
              </p>
            </div>
          </div>
        </div> */}

        {/* Search Bar */}

        {/* Loading / Empty / Table */}
        {isLoading ? (
          <div className="py-24 text-center text-gray-500">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-lg">Đang tải đơn hàng...</p>
          </div>
        ) : searchFilteredOrders.length === 0 ? (
          <div className="py-24 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery
                ? "Không tìm thấy đơn hàng phù hợp"
                : "Không có đơn hàng"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left w-12"></th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Mã đơn
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Trạng thái
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Thanh toán
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Số Món
                    </span>
                  </th>
                  <th className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Tổng tiền
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Thời gian
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {searchFilteredOrders.map((order, idx) => {
                  const isExpanded = expandedRows[order.id];

                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                        {/* Expand Button */}
                        <td className="px-6 py-5 align-top">
                          <button
                            onClick={() => toggleRowExpansion(order.id)}
                            className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-blue-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>

                        {/* Order Code */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {order.orderCode}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Order Status */}
                        <td className="px-6 py-5 align-top">
                          {getStatusBadge(order.status, "lg")}
                        </td>

                        {/* Payment Status */}
                        <td className="px-6 py-5 align-top">
                          {getPaymentStatusBadge(order.paymentStatus, "lg")}
                        </td>

                        {/* Items Summary */}
                        <td className="px-6 py-5">
                          <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 inline-block">
                            <span className="text-xs text-blue-700">
                              <span className="font-semibold">
                                {order.groupedItems?.length || 0}
                              </span>{" "}
                              món
                            </span>
                          </div>
                        </td>

                        {/* Total Price */}
                        <td className="px-6 py-5 text-right align-top">
                          <div className="text-xl font-bold text-emerald-600">
                            {formatVNNumber(order.totalPrice)}đ
                          </div>
                        </td>

                        {/* Time */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {getRelativeTime(order.createdTime ?? "")}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {order.createdTime}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                          <td></td>
                          <td colSpan={6} className="px-6 py-4">
                            <div className="bg-white rounded-lg border-2 border-blue-200 p-4 shadow-sm">
                              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-blue-600" />
                                Danh sách món ăn
                              </h4>

                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr className="bg-gray-100 text-xs text-gray-600 uppercase">
                                      <th className="px-4 py-2 text-left">
                                        Món ăn
                                      </th>
                                      <th className="px-4 py-2 text-left">
                                        Ghi chú
                                      </th>
                                      <th className="px-4 py-2 text-center">
                                        Trạng thái
                                      </th>
                                      <th className="px-4 py-2 text-right">
                                        Giá
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody className="divide-y">
                                    {order.groupedItems?.map((item, i) => {
                                      const isRemakeItem = Boolean(
                                        item.remakedTime || item.remarkNote
                                      );
                                      const shouldShowUrgent =
                                        item.isUrgent && !isRemakeItem;

                                      return (
                                        <tr
                                          key={i}
                                          className="hover:bg-gray-50 transition-colors align-top"
                                        >
                                          {/* CỘT MÓN ĂN */}
                                          <td className="px-4 py-3">
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-2 font-semibold text-gray-900">
                                                {item.productName}
                                                {shouldShowUrgent && (
                                                  <span className="px-2 py-0.5 text-[10px] font-semibold text-white bg-red-600 rounded-full">
                                                    GẤP
                                                  </span>
                                                )}
                                              </div>

                                              <div className="text-xs text-gray-600">
                                                Size:{" "}
                                                {item.sizeName
                                                  ?.charAt(0)
                                                  .toUpperCase()}{" "}
                                                × {item.quantity}
                                              </div>
                                            </div>
                                          </td>

                                          {/* CỘT GHI CHÚ */}
                                          <td className="px-4 py-3">
                                            <div className="space-y-1">
                                              {/* Note khách */}
                                              {item.note && (
                                                <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded inline-flex items-center gap-1">
                                                  <MessageSquare className="w-3 h-3" />
                                                  {item.note}
                                                </div>
                                              )}

                                              {/* Lý do làm lại */}
                                              {item.remarkNote && (
                                                <div className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded inline-flex items-center gap-1">
                                                  <RotateCcw className="w-3 h-3" />
                                                  <span className="font-medium">
                                                    Làm lại:
                                                  </span>
                                                  {item.remarkNote}
                                                </div>
                                              )}

                                              {/* Timeline */}
                                              {/* Timeline */}
                                              {(item.createdTime ||
                                                item.readyTime ||
                                                item.servedTime ||
                                                item.remakedTime) && (
                                                <div className="flex flex-col gap-1.5 text-[11px]">
                                                  {item.createdTime && (
                                                    <div className="flex items-center gap-1.5 text-gray-600">
                                                      <Clock className="w-3 h-3" />
                                                      <span>
                                                        Tạo: {item.createdTime}
                                                      </span>
                                                    </div>
                                                  )}
                                                  {item.readyTime && (
                                                    <div className="flex items-center gap-1.5 text-green-600">
                                                      <CheckCircle className="w-3 h-3" />
                                                      <span>
                                                        Xong: {item.readyTime}
                                                      </span>
                                                    </div>
                                                  )}
                                                  {item.servedTime && (
                                                    <div className="flex items-center gap-1.5 text-emerald-600">
                                                      <UtensilsCrossed className="w-3 h-3" />
                                                      <span>
                                                        Phục vụ:{" "}
                                                        {item.servedTime}
                                                      </span>
                                                    </div>
                                                  )}
                                                  {item.remakedTime && (
                                                    <div className="flex items-center gap-1.5 text-red-600">
                                                      <RotateCcw className="w-3 h-3" />
                                                      <span className="font-medium">
                                                        Làm lại:{" "}
                                                        {item.remakedTime}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </td>

                                          {/* CỘT TRẠNG THÁI */}
                                          <td className="px-4 py-3 text-center">
                                            {getStatusBadge(item.status, "sm")}
                                          </td>

                                          {/* CỘT GIÁ */}
                                          <td className="px-4 py-3 text-right">
                                            <span className="text-lg font-bold text-emerald-600">
                                              {formatVNCurrency(
                                                item.totalPrice
                                              )}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
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
      </div>
    </div>
  );
};

export default OrderCard;
