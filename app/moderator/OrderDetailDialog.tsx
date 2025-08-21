import React from 'react';
import { Clock, DollarSign, AlertCircle, CheckCircle, X, Utensils, Truck, PackageCheck, XCircle, RefreshCcw, Hourglass, RotateCcw } from 'lucide-react';



export interface Pagination {
    pageNumber: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Export interfaces for use in other components
export interface TableItem {
    id: string;
    name: string;
    status: string;
    qrCode: string;
}

export interface OrderItem {
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
    toppings: {
        id: string;
        name: string;
        price: number;
        imageUrl: string;
    }[];
}

export interface OrderData {
    id: string;
    tableId: string;
    tableName: string;
    status: string;
    paymentStatus: string;
    totalPrice: number;
    createdTime: Date;
    items: OrderItem[];
}

export interface OrderDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    table: TableItem | null;
    orders: OrderData[];
    loading: boolean;
    onConfirmStatusChange: () => void;
    onCancelStatusChange: () => void;
    newStatus: string;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
    isOpen,
    onClose,
    table,
    orders,
    loading,
    onConfirmStatusChange,
    onCancelStatusChange,
    newStatus
}) => {
    if (!isOpen || !table) return null;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
            case '0':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'occupied':
            case '1':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'reserved':
            case '2':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
            case '0':
                return 'Trống';
            case 'occupied':
            case '1':
                return 'Có Khách';
            case 'reserved':
            case '2':
                return 'Đã Đặt';
            default:
                return status;
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
      
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND"
        }).format(amount);
      };
      const getOrderStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
          case "pending":       // Đang chờ xác nhận
            return <Clock className="w-4 h-4 text-yellow-500" />;
          case "confirmed":     // Đã xác nhận
            return <CheckCircle className="w-4 h-4 text-blue-500" />;
          case "preparing":     // Đang chuẩn bị món
            return <Utensils className="w-4 h-4 text-orange-500" />;
          case "delivering":    // Bắt đầu phục vụ
            return <Truck className="w-4 h-4 text-indigo-500" />;
          case "completed":     // Đã hoàn thành
            return <PackageCheck className="w-4 h-4 text-green-600" />;
          case "cancelled":     // Đã huỷ
            return <XCircle className="w-4 h-4 text-red-500" />;
          case "redorequested": // Yêu cầu làm lại món
            return <RefreshCcw className="w-4 h-4 text-purple-500" />;
          default:
            return <Clock className="w-4 h-4 text-gray-400" />;
        }
      };
    const getOrderStatusColor = (status: string) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'preparing': 'bg-blue-100 text-blue-800 border-blue-200',
            'ready': 'bg-green-100 text-green-800 border-green-200',
            'served': 'bg-purple-100 text-purple-800 border-purple-200',
            'completed': 'bg-gray-100 text-gray-800 border-gray-200'
        };
        return colors[status.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };
    const getPaymentStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
          case "pending":   // Chưa thanh toán
            return <Hourglass className="w-4 h-4 text-yellow-500" />;
          case "paid":      // Thanh toán thành công
            return <CheckCircle className="w-4 h-4 text-green-600" />;
          case "failed":    // Thất bại
            return <XCircle className="w-4 h-4 text-red-500" />;
          case "refunded":  // Đã hoàn tiền
            return <RotateCcw className="w-4 h-4 text-blue-600" />;
          default:
            return <Hourglass className="w-4 h-4 text-gray-400" />;
        }
      };


    const getPaymentStatusColor = (status: string) => {
        const colors = {
            'pending': 'bg-orange-100 text-orange-800 border-orange-200',
            'paid': 'bg-green-100 text-green-800 border-green-200',
            'refunded': 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // thay doi tieng viet 
    // Trả về nhãn tiếng Việt cho trạng thái Order
const getOrderStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Đang chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "preparing":
        return "Đang chuẩn bị món";
      case "delivering":
        return "Đang phục vụ";
      case "completed":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      case "redorequested":
        return "Yêu cầu làm lại món";
      default:
        return "Không xác định";
    }
  };
  
  // Trả về nhãn tiếng Việt cho trạng thái Payment
  const getPaymentStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Chưa thanh toán";
      case "paid":
        return "Đã thanh toán";
      case "failed":
        return "Thanh toán thất bại";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return "Không xác định";
    }
  };
   const OrderItemStatusLabel: Record<string, string> = {
    pending: "Đang chờ xác nhận",
    preparing: "Đang chuẩn bị món",
    ready: "Sẵn sàng / Đã xong món",
    served: "Đã phục vụ",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    remark: "Yêu cầu làm lại món"
  };
  
    // Gộp món theo productName + sizeName + note
    const mergeOrderItems = (items: OrderItem[]): OrderItem[] => {
      const map = new Map<string, OrderItem>();
    
      console.log("Merging order items:", items);
      for (const item of items) {
        const key = `${item.productId}-${item.sizeName}-${item.note?.trim() || ""}`;
        
        if (map.has(key)) {
          const existing = map.get(key)!;
          // cộng dồn số lượng
          existing.quantity += item.quantity;
          // giữ nguyên đơn giá (không cộng dồn)
          // gộp toppings
          existing.toppings = [...existing.toppings, ...item.toppings];
        } else {
          map.set(key, { ...item });
        }
      }
    
      return Array.from(map.values());
    };
    
  

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl relative max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Dialog Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <AlertCircle className="w-6 h-6 mr-3 text-blue-600" />
                            Xem Lại Thay Đổi Trạng Thái - {table.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Đổi từ <span className="font-medium">{getStatusText(table.status)}</span> sang{' '}
                            <span className={`font-medium ${newStatus === "0" ? "text-green-600" : "text-red-600"}`}>
                                {getStatusText(newStatus)}
                            </span>
                        </p>
                    </div>
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

              {/* Dialog Body */}
                <div className="flex-1 overflow-y-scroll p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                {loading ? (
                    <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải đơn hàng để xem lại...</p>
                    </div>
                ) : orders && orders.length > 0 ? (
                    <div className="space-y-6">
                    {/* Summary Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                            <div className="text-sm text-gray-600">Đơn Hàng Hoạt Động</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(orders.reduce((total, order) => total + order.totalPrice, 0))}
                            </div>
                            <div className="text-sm text-gray-600">Tổng Giá Trị</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                            {orders.reduce((acc, order) => acc + order.items.length, 0)}
                            </div>
                            <div className="text-sm text-gray-600">Tổng Món</div>
                        </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-blue-500" />
                        Chi Tiết Đơn Hàng
                        </h3>

                        {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Order Header */}
                            <div className="flex justify-between items-start p-4 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">#{order.id.substring(6, 8)}</span>
                                </div>
                                <div>
                                <h4 className="font-semibold text-gray-900">Đơn Hàng #{order.id.substring(0, 8)}...</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="flex items-center space-x-1">
                                    {getOrderStatusIcon(order.status)}
                                    <span>{getOrderStatusLabel(order.status)}</span>
                                    </span>

                                    <span className="flex items-center space-x-1">
                                    {getPaymentStatusIcon(order.paymentStatus)}
                                    <span>{getPaymentStatusLabel(order.paymentStatus)}</span>
                                    </span>
                                </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-gray-900 flex items-center justify-end">
                                {formatCurrency(order.totalPrice)}
                                </div>
                                <div className="text-sm text-gray-500">{getRelativeTime(order.createdTime)}</div>
                            </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-4">
                            <div className="space-y-3">
                                {mergeOrderItems(order.items).map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.productName}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">{item.productName}</div>
                                        <div className="text-sm text-gray-500">
                                        {item.sizeName} × {item.quantity}
                                        {item.toppings.length > 0 && (
                                            <span className="ml-2 text-blue-600">+ {item.toppings.length} topping</span>
                                        )}
                                        </div>
                                        {item.note && (
                                        <div className="text-xs text-gray-400 italic mt-1">Ghi chú: {item.note}</div>
                                        )}
                                    </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderStatusColor(
                                        item.status
                                        )}`}
                                    >
                                        {OrderItemStatusLabel[item.status.toLowerCase()]}
                                    </span>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {formatCurrency(item.price * item.quantity)}
                                       
                                    </span>

                                    </div>
                                    
                                 </div>
                                ))}
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Không Có Đơn Hàng</h3>
                    <p className="text-gray-500 mb-4">
                        Bàn này không có đơn hàng đang chờ. An toàn để thay đổi trạng thái.
                    </p>
                    </div>
                )}
                </div>


                {/* Dialog Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onCancelStatusChange}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center font-medium"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Hủy
                    </button>
                    <button
                        onClick={onConfirmStatusChange}
                        className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg flex items-center font-medium"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Xác Nhận Thay Đổi Trạng Thái
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailDialog;