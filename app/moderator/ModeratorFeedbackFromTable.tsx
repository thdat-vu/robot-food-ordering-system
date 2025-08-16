"use client";
import React, { useEffect, useState } from "react";
import { 
  X, MessageSquare, CheckCircle, AlertCircle, Calendar, 
  Search, RefreshCw, ChevronDown, ChevronRight,
  ClipboardList, Utensils, User, Phone
} from "lucide-react";
import { FeedbackgGetTableId } from "@/entites/moderator/FeedbackModole";
import { useCheckSS, useGetFeedbackByIdtable, UseGetOrderbytable } from "@/hooks/moderator/useFeedbackHooks"
import { parse } from "date-fns";

interface OrderItem {
  id: string;
  productName: string;
  price: number;
  sizeName: string;
  quantity: number;
  status: 'pending' | 'completed' | 'canceled';
  imageUrl?: string;
  specialRequest?: string;
}

interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  totalPrice: number;
  customerName?: string;
  customerPhone?: string;
  createdTime: Date;
  status: 'pending' | 'completed' | 'paid';
}

interface Prop {
  idTable: string;
  open: boolean;
  onClose: () => void;
  tableName: string;
}

export const ModeratorFeedbackFromTable: React.FC<Prop> = ({
  idTable,
  onClose,
  open,
  tableName 
}) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackgGetTableId[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'processed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const { run: getFeedbacks } = useGetFeedbackByIdtable();
  const { run: getOrders } = UseGetOrderbytable();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fbRes, orderRes] = await Promise.all([
        getFeedbacks(idTable),
        getOrders(idTable)
      ]);
      
      setFeedbacks(fbRes.data);
      setOrders(orderRes.data.map((order: any) => ({
        ...order,
        items: order.items || []
        
      })));
      console.log("Order Data:", orderRes.data);
        console.log("Feedback Data:", fbRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadData();
  }, [open]);

  const formatDateTime = (dateInput: string | Date) => {
    const date =
      typeof dateInput === "string"
        ? parseCustomDate(dateInput)
        : new Date(dateInput);
  
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
// Parse từ "DD/MM/YYYY HH:mm:ss" thành Date
// Hàm parse chuỗi "15/08/2025 10:07:30"
function parseCustomDate(dateStr: string): Date {
  try {
    
    const [datePart, timePart] = dateStr.split(" ");
   
    if (!datePart || !timePart) return new Date(NaN);

    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute, second);
  } catch {
    return new Date(NaN);
  }
}



const formatTimeAgo = (dateInput: string | Date) => {
  try {
    
    const date =
      typeof dateInput === "string"
        ? parse(dateInput, "dd/MM/yyyy HH:mm:ss", new Date())
        : new Date(dateInput);

   

    if (isNaN(date.getTime())) {
      return "Không xác định ngày giờ";
    }

    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  } catch (err) {
    console.error("Invalid date:", dateInput, err);
    return "Không xác định";
  }
};


  

  const StatusBadge = ({ status }: { status: string }) => {
    const statusMap = {
      pending: { text: "Chờ xử lý", bg: "bg-yellow-100", textColor: "text-yellow-800" },
      completed: { text: "Đã xử lý", bg: "bg-green-100", textColor: "text-green-800" },
      paid: { text: "Đã thanh toán", bg: "bg-purple-100", textColor: "text-purple-800" }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    
    return (
      <span className={`${config.bg} ${config.textColor} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
        {config.text}
      </span>
    );
  };

  const toggleFeedback = (id: string) => {
    setExpandedFeedbackId(expandedFeedbackId === id ? null : id);
  };

  const toggleOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const pendingCount = feedbacks.filter(f => f.isPeeding).length;
  const filteredFeedbacks = feedbacks.filter(fb => {
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'pending' && fb.isPeeding) ||
      (selectedFilter === 'processed' && !fb.isPeeding);
    
    const matchesSearch = searchQuery === '' || 
      fb.feedBack.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <MessageSquare className="w-8 h-8" />
                <span>Phản hồi & Đơn hàng từ {tableName}</span>
              </h2>
              <div className="flex items-center gap-2 mt-2 text-blue-100 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 p-3 rounded-lg border border-white/30 text-center">
              <div className="text-xs text-blue-100 mb-1">Tổng phản hồi</div>
              <div className="text-2xl font-bold">{feedbacks.length}</div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg border border-white/30 text-center">
              <div className="text-xs text-blue-100 mb-1">Đơn hàng</div>
              <div className="text-2xl font-bold">{orders.length}</div>
            </div>
            <div className="bg-white/20 p-3 rounded-lg border border-white/30 text-center">
              <div className="text-xs text-blue-100 mb-1">Cần xử lý</div>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </div>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="bg-gray-50 border-b p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm phản hồi..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter */}
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="bg-white border rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả phản hồi</option>
                <option value="pending">Chưa xử lý</option>
                <option value="processed">Đã xử lý</option>
              </select>
              
              <button
                onClick={loadData}
                disabled={isLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-1 text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Orders Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    <span>Đơn hàng gần đây</span>
                  </h3>
                </div>
                
                {orders.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Utensils className="w-10 h-10 mx-auto mb-2" />
                    <p>Chưa có đơn hàng nào từ bàn này</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {orders.map(order => (
                      <div key={order.id} className="p-4 hover:bg-gray-50">
                        <div 
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggleOrder(order.id)}
                        >
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              <span>Đơn #{order.id.slice(-6)}</span>
                              {order.customerName && (
                                <span className="text-sm text-gray-500">({order.customerName})</span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <span>{order.items.length} món</span>
                              <span>•</span>
                              <span>{order.totalPrice !== undefined ? order.totalPrice.toLocaleString('vi-VN') + 'đ' : 'N/A'}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(order.createdTime)}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={order.status} />
                            <button className="text-gray-500 hover:text-gray-700">
                              {expandedOrderId === order.id ? 
                                <ChevronDown className="w-5 h-5" /> : 
                                <ChevronRight className="w-5 h-5" />
                              }
                            </button>
                          </div>
                        </div>
                        
                        {expandedOrderId === order.id && (
                          <div className="mt-3 space-y-3">
                            {/* Customer info */}
                            {(order.customerName || order.customerPhone) && (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-100 p-2 rounded-full">
                                    <User  className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{order.customerName || "Khách vãng lai"}</p>
                                    {order.customerPhone && (
                                      <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {order.customerPhone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Order items */}
                            <div className="border rounded-lg overflow-hidden">
                              {order.items.map(item => (
                                <div key={item.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                                  <div className="flex gap-3">
                                    {item.imageUrl ? (
                                      <div className="w-12 h-12 rounded-lg overflow-hidden">
                                        <img 
                                          src={item.imageUrl} 
                                          alt={item.productName}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://placehold.co/100?text=" + item.productName[0];
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Utensils className="w-5 h-5 text-gray-400" />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <div className="flex justify-between">
                                        <p className="font-medium">
                                          {item.productName} 
                                          <span className="text-gray-500 ml-2"> x{item.quantity} </span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium">
                                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                          </span>
                                          <ItemStatusBadge status={item.status} />
                                        </div>
                                      </div>
                                      {item.specialRequest && (
                                        <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                                          <AlertCircle className="w-3 h-3" />
                                          {item.specialRequest}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Order summary */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Tổng cộng: </span>
                              <span className="font-bold">
                                {order.totalPrice !== undefined ? order.totalPrice.toLocaleString('vi-VN') + 'đ' : 'N/A'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Feedbacks Section */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span>Phản hồi từ khách hàng</span>
                  </h3>
                </div>
                
                {feedbacks.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                    <p>Chưa có phản hồi nào từ bàn này</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredFeedbacks.map(feedback => (
                      <div 
                        key={feedback.idFeedback}
                        className={`p-4 transition-colors ${
                          feedback.isPeeding ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div 
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggleFeedback(feedback.idFeedback)}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`font-medium line-clamp-1 ${
                                feedback.isPeeding ? 'text-yellow-800' : 'text-gray-800'
                              }`}>
                                {feedback.feedBack}
                              </p>
                              {feedback.isPeeding && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  Mới
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{feedback.createData ? formatDateTime(feedback.createData) : 'N/A'}</span>
                              <span>•</span>
                              <span>#{feedback.idFeedback.slice(-6)}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={feedback.isPeeding ? "pending" : "completed"} />
                            <button className="text-gray-500 hover:text-gray-700">
                              {expandedFeedbackId === feedback.idFeedback ? 
                                <ChevronDown className="w-5 h-5" /> : 
                                <ChevronRight className="w-5 h-5" />
                              }
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
         {/* Footer */}
         <div className="bg-gray-50 border-t p-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Hiển thị {filteredFeedbacks.length}/{feedbacks.length} phản hồi • {orders.length} đơn hàng
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
export const ItemStatusBadge: React.FC<{ status: OrderItem['status'] }> = ({ status }) => {
  const statusMap = {
    pending: { text: "Chờ", bg: "bg-yellow-100", textColor: "text-yellow-800" },
    completed: { text: "Hoàn thành", bg: "bg-green-100", textColor: "text-green-800" },
    canceled: { text: "Hủy", bg: "bg-red-100", textColor: "text-red-800" }
  };
  
  const config = statusMap[status] || statusMap.pending;
  
  return (
    <span className={`${config.bg} ${config.textColor} px-2 py-1 rounded-full text-xs font-medium`}>
      {config.text}
    </span>
  );
};