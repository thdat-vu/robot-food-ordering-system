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
  Truck
} from "lucide-react";
import { OrderCardProps } from "@/entites/moderator/FeedbackModole";
import {
  groupItemsPerOrder,
  calculateOrdersStatistics,
  formatVNCurrency,
  formatVNNumber,
} from "@/lib/utils/orderGroupingitem";
import { ApiBaseResponse, ApiOrderResponse } from "@/lib/api/orders";
import { useDateFilterUI } from '@/hooks/moderator/useDateFilterUI';
import { OrderData } from "@/entites/moderator/tableModel";
import { DateRangeFilter } from "./DateRangeFilter";
import {ordersApi}  from "@/lib/api/orders";


// Props interface for OrderCard

const OrderCard: React.FC<OrderCardProps> = ({
  tableId,
  orders: propOrders,
  onToggleExpand,
  expandedOrderId,
  fetchOrders,
  initialOrders = [],
  showDateFilter = false,
  onOrdersChange
}) => {
  // Local state
  const [localExpandedId, setLocalExpandedId] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<ApiOrderResponse[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 
  
  // Use local state if no external control provided
  const currentExpandedId = expandedOrderId !== undefined ? expandedOrderId : localExpandedId;
  
  const toggleExpand = (orderId: string) => {
    if (onToggleExpand) {
      onToggleExpand(orderId);
    } else {
      setLocalExpandedId(prev => prev === orderId ? null : orderId);
    }
  };
  
  // Initialize filtered orders
  useEffect(() => {
    const ordersToUse = propOrders  as ApiOrderResponse[];
    setFilteredOrders(ordersToUse);
  }, [propOrders, initialOrders]);

  // Handle date filter search
  const handleDateSearch = useCallback(
    async (startDate: string | null, endDate: string | null) => {
      console.log("🔎 handleDateSearch called with", { startDate, endDate, propOrders, tableId });
  
      try {
        setIsLoading(true);
        setError(null);
  
        const targetTableId =
          propOrders.length > 0 ? propOrders[0].tableId : tableId;
  
        console.log("👉 targetTableId:", targetTableId);
  
        const response = await ordersApi.getOrdersByTableIdOnly(
          targetTableId?.toString() || "",
          startDate,
          endDate
        );
  
        console.log("✅ API Response:", response);
  
        if (response.data.statusCode === 200 && response.data.data) {
          const newOrders = response.data.data as ApiOrderResponse[];
          console.log("✅ Fetched Orders:", newOrders);
          console.log("📦 newOrders:", newOrders);
  
          if (onOrdersChange) {
            console.log("📤 calling onOrdersChange...");
            onOrdersChange(newOrders, targetTableId?.toString() || "");
          }
  
          setFilteredOrders(newOrders);
        } else {
          setFilteredOrders([]);
          setError(response.data.message || "Không lấy được đơn hàng");
        }
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
        setError("Có lỗi xảy ra khi gọi API");
      } finally {
        setIsLoading(false);
      }
    },
    [ordersApi, propOrders, tableId, onOrdersChange]
  );
  
  
  // Local filter function
  const filterOrdersByDate = (ordersToFilter: OrderData[], startDate: string | null, endDate: string | null): OrderData[] => {
    if (!startDate && !endDate) {
      return ordersToFilter;
    }

    return ordersToFilter.filter(order => {
      const orderDate = new Date(order.createdTime);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && orderDate < start) return false;
      if (end && orderDate > end) return false;
      
      return true;
    });
  };

  // Clear error
  const handleClearError = () => {
    setError(null);
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

  const getOrderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "preparing":
        return <Utensils className="w-4 h-4 text-orange-500" />;
      case "ready":
        return <PackageCheck className="w-4 h-4 text-emerald-500" />;
      case "delivering": 
        return <Truck className="w-4 h-4 text-cyan-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "redorequested":
        return <RefreshCw className="w-4 h-4 text-purple-500" />; // 👈 chỉnh màu tím cho nổi bật
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };
  

  const getPaymentStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Hourglass className="w-4 h-4 text-amber-500" />;
      case "paid":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Hourglass className="w-4 h-4 text-gray-400" />;
    }
  };

  const getOrderStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case "pending": return "Đang chờ xác nhận";
      case "preparing": return "Đang chuẩn bị món";
      case "ready": return "Sẵn sàng phục vụ";
      case "delivering": return "Đang giao món";
      case "completed": return "Đã hoàn thành";
      case "cancelled": return "Đã hủy";
      case "requestcancel": return "Yêu cầu hủy món";
      case "redorequested": return "Yêu cầu đổi món cho bàn khác";
      default: return "Không xác định";
    }
  };

  const getPaymentStatusLabel = (status: string): string => {
    switch (status.toLowerCase()) {
      case "pending": return "Chưa thanh toán";
      case "paid": return "Đã thanh toán";
      default: return "Không xác định";
    }
  };

  const getOrderStatusColor = (status: string): string => {
    const colors = {
      pending: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm",
      preparing: "bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border border-orange-200 shadow-sm",
      delivering: "bg-gradient-to-r from-cyan-50 to-teal-50 text-cyan-700 border border-cyan-200 shadow-sm",
      ready: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm",
      completed: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm",
      cancelled: "bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200 shadow-sm",
      redorequested: "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 shadow-sm",
      requestcancel: "bg-gradient-to-r from-violet-50 to-purple-50 text-purple-700 border border-purple-200 shadow-sm", // 👈 đổi màu
      served: "bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border border-teal-200 shadow-sm"
     };
    return colors[status.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const OrderItemStatusLabel: Record<string, string> = {
    pending: "Đang chờ xác nhận",
    preparing: "Đang chuẩn bị món",
    delivering: "Đang giao hàng",
    ready: "Sẵn sàng / Đã xong món",
    served: "Đã phục vụ",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    requestcancel: "Yêu cầu đổi món",
  };


 
  if (propOrders.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-8 text-center border border-gray-200/50">
        <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">Không có đơn hàng</h3>
        <p className="text-gray-500">Bàn này hiện tại không có đơn hàng nào.</p>
      </div>
    );
  }

   // Sử dụng utility functions để tính toán statistics
   const statistics = calculateOrdersStatistics(propOrders);

   // Group items per order để hiển thị trong expanded view
  const ordersWithGroupedItems = groupItemsPerOrder(propOrders);

  
  return (
    <div className="space-y-6">
       
      {/* Enhanced Summary Card với statistics từ utility */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50 shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>
                  
        
        <div className="relative">
       
      

          {/* Header with icon */}
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Tổng Quan Hoạt Động</h3>
            
          
            
          </div>
         
          
          

          {/* Enhanced Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.totalOrders}
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Đơn Hoạt Động
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-lg lg:text-xl font-bold text-emerald-600 truncate">
                  {formatVNNumber(statistics.totalPrice)}đ
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Tổng Giá Trị
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Utensils className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {statistics.totalQuantity}
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Tổng Món
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/50">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-indigo-600">1</div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Bàn Phục Vụ
              </div>
            </div>
          </div>

          {/* Enhanced Payment Status */}
          <div className="border-t border-blue-200/50 pt-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Trạng Thái Thanh Toán</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 shadow-lg border border-emerald-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Đã Thanh Toán
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">{statistics.paidOrders}</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 shadow-lg border border-red-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">
                      Chưa Thanh Toán
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{statistics.unpaidOrders}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced Orders List */}
      <div className="space-y-4">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Chi Tiết Đơn Hàng</h3>
        </div>

        {showDateFilter && (
                <DateRangeFilter
                  onSearch={handleDateSearch}
                  isLoading={isLoading}
                  error={error}
                  onClearError={handleClearError}
                />
              )}
        {ordersWithGroupedItems.map((orderWithGroups, index) => (
          <div
            key={orderWithGroups.id}
            className="bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] overflow-hidden"
            onClick={() => toggleExpand(orderWithGroups.id)}
          >
            {/* Order gradient header */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600"></div>
            
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start space-x-4">
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">
                        #{orderWithGroups.id.substring(6, 8)}
                      </span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-2">
                      Đơn Hàng #{orderWithGroups.id.substring(0, 8)}...
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(orderWithGroups.status)}`}>
                        {getOrderStatusIcon(orderWithGroups.status)}
                        <span>{getOrderStatusLabel(orderWithGroups.status)}</span>
                      </div>
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(orderWithGroups.paymentStatus === 'paid' ? 'completed' : 'pending')}`}>
                        {getPaymentStatusIcon(orderWithGroups.paymentStatus)}
                        <span>{getPaymentStatusLabel(orderWithGroups.paymentStatus)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {formatVNNumber(orderWithGroups.totalPrice)}đ
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {getRelativeTime(orderWithGroups.createdTime)}
                  </div>
                </div>
              </div>

              {currentExpandedId === orderWithGroups.id && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="space-y-4">
                    {/* Hiển thị grouped items thay vì items gốc */}
                    {orderWithGroups.groupedItems.map((item, idx) => (

                      <div
                        key={idx}
                        className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl p-4 hover:from-gray-100 hover:to-blue-50/50 transition-all duration-300 border border-gray-200/50"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                          <div className="flex items-center space-x-4 min-w-0 flex-1">
                            <div className="relative">
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white"
                              />
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                {item.quantity}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-gray-900 text-lg mb-1">
                                {item.productName}
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                Size: {item.sizeName} × {item.quantity}
                              </div>
                              {item.note && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1 text-sm text-amber-700">
                                  <MessageSquare className="w-4 h-4 inline mr-1" />
                                  {item.note}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:items-end space-y-2">
                            <span
                              className={`px-4 py-2 text-sm font-medium rounded-full ${getOrderStatusColor(item.status)} shadow-sm`}
                            >
                              {OrderItemStatusLabel[item.status.toLowerCase()]}
                            </span>
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                              {formatVNCurrency(
                                (item.price + item.toppings.reduce((sum, t) => sum + t.price, 0)) 
                              )}
                            </span>
                          </div>
                        </div>

                        {item.toppings.length > 0 && (
                          <div className="mt-4 pl-20 space-y-2">
                            {item.toppings.map((topping, tIdx) => (
                              <div key={tIdx} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2 border border-gray-200/50">
                                <span className="text-sm text-gray-700 font-medium">+ {topping.name}</span>
                                <span className="text-sm font-semibold text-emerald-600">+{formatVNCurrency(topping.price)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderCard;