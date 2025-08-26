import React, { useState } from "react";
import {
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  X,
  Utensils,
  Truck,
  PackageCheck,
  XCircle,
  RefreshCcw,
  Hourglass,
  RotateCcw,
  ShoppingCart,
  CreditCard,
  Users,
  MessageSquare,
  ChevronDown,
  Calendar,
  Star,
  TrendingUp,
  Sparkles,
  Award
} from "lucide-react";

// Define interfaces
interface TableItem {
  id: string;
  name: string;
  status: string | number;
  qrCode: string;
}

interface OrderData {
  id: string;
  tableId: string;
  tableName: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  createdTime: Date;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSizeId: string;
  sizeName: string;
  note: string;
  remarkNote: string;
  quantity: number;
  price: number;
  status: string;
  imageUrl: string;
  createdTime: string;
  toppings: Topping[];
}

interface Topping {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

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
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Early return if not open or no table
  if (!isOpen || !table) return null;

  // Gợi ý lý do thay đổi trạng thái
  const reasonSuggestions = [
    "Khách hàng đã rời đi",
    "Hoàn tất thanh toán và dọn dẹp bàn",
    "Khách hàng yêu cầu đổi bàn",
    "Bàn cần bảo trì/sửa chữa",
    "Đặt bàn trước cho khách VIP",
    "Sự kiện đặc biệt",
    "Dọn dẹp định kỳ",
    "Khách hàng hủy đặt bàn",
    "Chuyển khách sang khu vực khác",
    "Cập nhật theo yêu cầu quản lý"
  ];

  const filteredSuggestions = reasonSuggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(reason.toLowerCase()) && suggestion !== reason
  );

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setReason(suggestion);
    setShowSuggestions(false);
  };

  const handleConfirmStatusChange = () => {
    const finalReason = reason.trim() || "Không có lý do cụ thể";
    onConfirmStatusChange(finalReason);
  };

  const handleCancelStatusChange = () => {
    setReason("");
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

  const parseDate = (date: string | Date) => {
    if (date instanceof Date) return date;
  
    // format hiện tại: DD/MM/YYYY HH:mm:ss
    const [day, month, yearAndTime] = date.split("/");
    const [year, time] = yearAndTime.split(" ");
    return new Date(`${year}-${month}-${day}T${time}`);
  };
  
  const formatDate = (date: Date | string) => {
    const parsedDate = parseDate(date);
    if (isNaN(parsedDate.getTime())) return "Không xác định";
  
    return parsedDate.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
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
      case "completed": return "Đã hoàn thành";
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
      ready: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm",
      completed: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm",
    };
    return colors[status.toLowerCase() as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const OrderItemStatusLabel: Record<string, string> = {
    pending: "Đang chờ xác nhận",
    preparing: "Đang chuẩn bị món",
    ready: "Sẵn sàng / Đã xong món",
    served: "Đã phục vụ",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Calculate statistics
  const totalPrice = orders. reduce((total, order) => total + order.totalPrice, 0);
  const totalItems = orders.reduce((acc, order) => acc + order.items.length, 0);
  const paidOrders = orders.filter(order => order.paymentStatus.toLowerCase() === 'paid').length;
  const unpaidOrders = orders.length - paidOrders;

  

 
  

  
 

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

    <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-blue-900/20 to-indigo-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl relative w-full max-w-6xl  overflow-hidden border border-gray-200/50">
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
                  <span className="text-lg font-semibold text-gray-800">{table.name}</span>
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
            onClick={onClose}
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
            {/* Enhanced Summary Card */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50 shadow-xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative">
                {/* Header with icon */}
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Tổng Quan Hoạt Động</h3>
                </div>

                {/* Enhanced Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {orders.length}
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
                        {new Intl.NumberFormat("vi-VN").format(totalPrice)}đ
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
                        {totalItems}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Tổng Món
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
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
                      <CreditCard className="w-4 h-4 text-white" />
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
                        <div className="text-2xl font-bold text-emerald-600">{paidOrders}</div>
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
                        <div className="text-2xl font-bold text-red-600">{unpaidOrders}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Orders List */}
            {orders.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-3 shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Chi Tiết Đơn Hàng</h3>
                </div>

                {orders.map((order, index) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] overflow-hidden"
                    onClick={() => toggleOrderExpand(order.id)}
                  >
                    {/* Order gradient header */}
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600"></div>
                    
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-start space-x-4">
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                #{order.id.substring(6, 8)}
                              </span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                              <Star className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-gray-900 text-lg mb-2">
                              Đơn Hàng #{order.id.substring(0, 8)}...
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                                {getOrderStatusIcon(order.status)}
                                <span>{getOrderStatusLabel(order.status)}</span>
                              </div>
                              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.paymentStatus === 'paid' ? 'completed' : 'pending')}`}>
                                {getPaymentStatusIcon(order.paymentStatus)}
                                <span>{getPaymentStatusLabel(order.paymentStatus)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            {new Intl.NumberFormat("vi-VN").format(order.totalPrice)}đ
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {getRelativeTime(order.createdTime)}
                          </div>
                        </div>
                      </div>

                      {expandedOrderId === order.id && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <div className="space-y-4">
                            {order.items.map((item, idx) => (
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
                                      {formatCurrency(
                                        (item.price + item.toppings.reduce((sum, t) => sum + t.price, 0)) * item.quantity
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {item.toppings.length > 0 && (
                                  <div className="mt-4 pl-20 space-y-2">
                                    {item.toppings.map((topping, tIdx) => (
                                      <div key={tIdx} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2 border border-gray-200/50">
                                        <span className="text-sm text-gray-700 font-medium">+ {topping.name}</span>
                                        <span className="text-sm font-semibold text-emerald-600">+{formatCurrency(topping.price)}</span>
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
            )}

            {/* Show message if no orders */}
            {orders.length === 0 && (
              <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-8 text-center border border-gray-200/50">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Không có đơn hàng</h3>
                <p className="text-gray-500">Bàn này hiện tại không có đơn hàng nào.</p>
              </div>
            )}

            {/* Enhanced Reason Input Section */}
            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50 shadow-xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full -translate-y-12 translate-x-12"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-yellow-400/10 to-amber-400/10 rounded-full translate-y-10 -translate-x-10"></div>
              
              <div className="relative">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Lý Do Thay Đổi Trạng Thái
                    </h4>
                    <p className="text-sm text-gray-600">
                      Vui lòng nhập lý do thay đổi trạng thái bàn (tùy chọn)
                    </p>
                  </div>
                </div>

                {/* Quick Reason Suggestions Above Input */}
                <div className="mb-4">
                  <div className="flex items-center mb-3">
                    <Sparkles className="w-4 h-4 text-amber-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Gợi ý nhanh:</span>
                  </div>
                  
                  {/* Always show first 6 suggestions */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {reasonSuggestions.slice(0, 6).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-2 bg-white/80 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 border border-amber-200/60 rounded-xl text-xs sm:text-sm text-gray-700 hover:text-amber-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 font-medium backdrop-blur-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  {/* Additional suggestions - shown/hidden with animation */}
                  {reasonSuggestions.length > 6 && (
                    <div className="space-y-3">
                      {/* Animated additional suggestions */}
                      <div 
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                          showSuggestions 
                            ? 'max-h-96 opacity-100' 
                            : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="flex flex-wrap gap-2 pb-2">
                          {reasonSuggestions.slice(6).map((suggestion, index) => (
                            <button
                              key={index + 6}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/60 rounded-xl text-xs sm:text-sm text-gray-700 hover:text-indigo-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 font-medium backdrop-blur-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Toggle button */}
                      <button
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className={`px-4 py-2 bg-gradient-to-r border rounded-xl text-sm transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 font-medium flex items-center ${
                          showSuggestions
                            ? 'from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 border-red-200/60 text-red-700 hover:text-red-800'
                            : 'from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-blue-200/60 text-blue-700 hover:text-blue-800'
                        }`}
                      >
                        <ChevronDown className={`w-4 h-4 mr-1 transition-transform duration-300 ${showSuggestions ? 'rotate-180' : ''}`} />
                        {showSuggestions 
                          ? 'Ẩn gợi ý khác' 
                          : `Xem thêm ${reasonSuggestions.length - 6} gợi ý khác`
                        }
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Hoặc nhập lý do tùy chỉnh của bạn..."
                    rows={4}
                    className="w-full px-6 py-4 border border-amber-300/50 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm sm:text-base bg-white/70 backdrop-blur-sm shadow-lg placeholder-gray-500 transition-all duration-300"
                  />
                </div>

                {/* Enhanced Character Count */}
               
                {/* Enhanced Current Reason Display */}
               
              </div>
            </div>
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
                onClick={handleConfirmStatusChange}
                className="group w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center font-semibold text-sm sm:text-base transform hover:scale-105"
              >
                <CheckCircle className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Xác Nhận Thay Đổi Trạng Thái
              </button>
        </div>


      </div>
    </div>


  );
};

export default OrderDetailDialog;