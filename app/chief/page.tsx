'use client';
import { useState, useEffect } from 'react';
import { useCustomRouter } from '@/lib/custom-router';

// Type definitions
interface Order {
  id: number;
  itemName: string;
  category: string;
  tableNumber: number;
  quantity: number;
  status: "đang chờ" | "đang thực hiện" | "bắt đầu phục vụ";
  image: string;
  orderTime: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface SidebarItem {
  name: string;
  isRemoving: boolean;
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning';
  message: string;
  isVisible: boolean;
}

// Mock data structure
const mockOrders: Order[] = [
  {
    id: 1,
    itemName: "Nước chanh dây",
    category: "Đồ uống",
    tableNumber: 1,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/passion-fruit-juice.jpg",
    orderTime: "10:30"
  },
  {
    id: 2,
    itemName: "Nước chanh dây",
    category: "Đồ uống", 
    tableNumber: 4,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/passion-fruit-juice.jpg",
    orderTime: "10:32"
  },
  {
    id: 3,
    itemName: "Nước chanh dây",
    category: "Đồ uống",
    tableNumber: 6,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/passion-fruit-juice.jpg",
    orderTime: "10:35"
  },
  {
    id: 4,
    itemName: "Nước chanh dây",
    category: "Đồ uống",
    tableNumber: 8,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/passion-fruit-juice.jpg",
    orderTime: "10:37"
  },
  {
    id: 5,
    itemName: "Trà đào ối hồng",
    category: "Đồ uống",
    tableNumber: 2,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/peach-tea.jpg",
    orderTime: "10:28"
  },
  {
    id: 6,
    itemName: "Trà đào ối hồng",
    category: "Đồ uống",
    tableNumber: 5,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/peach-tea.jpg",
    orderTime: "10:33"
  },
  {
    id: 7,
    itemName: "Cacao đá xay",
    category: "Đồ uống",
    tableNumber: 3,
    quantity: 1,
    status: "đang chờ",
    image: "/avatars/iced-cacao.jpg",
    orderTime: "10:25"
  }
];

const categories: Category[] = [
  { id: 1, name: "Tất cả", color: "bg-blue-500" },
  { id: 2, name: "Đồ uống", color: "bg-yellow-500" },
  { id: 3, name: "Món chính", color: "bg-green-500" },
  { id: 4, name: "Tráng miệng", color: "bg-purple-500" }
];

export default function ChiefPage() {
  const router = useCustomRouter();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [activeTab, setActiveTab] = useState<"đang chờ" | "đang thực hiện" | "bắt đầu phục vụ">("đang chờ");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSidebarAnimating, setIsSidebarAnimating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Group orders by item name and filter by status and category
  const getFilteredOrders = (): Order[] => {
    return orders.filter(order => {
      const statusMatch = order.status === activeTab;
      const categoryMatch = selectedCategory === "Tất cả" || order.category === selectedCategory;
      return statusMatch && categoryMatch;
    });
  };

  const getGroupedOrders = (): Record<string, Order[]> => {
    const filteredOrders = getFilteredOrders();
    const grouped: Record<string, Order[]> = {};
    
    filteredOrders.forEach(order => {
      if (!grouped[order.itemName]) {
        grouped[order.itemName] = [];
      }
      grouped[order.itemName].push(order);
    });
    
    return grouped;
  };

  const handlePrepare = (itemName: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.itemName === itemName && order.status === "đang chờ"
          ? { ...order, status: "đang thực hiện" }
          : order
      )
    );
    setExpandedGroup(null);
    addToast(`Đã bắt đầu thực hiện món: ${itemName}`, 'success');
  };

  const handleServeClick = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const confirmServe = () => {
    if (selectedOrder) {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id
            ? { ...order, status: "bắt đầu phục vụ" }
            : order
        )
      );
    }
    setShowModal(false);
    setSelectedOrder(null);
    addToast(`Đã bắt đầu phục vụ món: ${selectedOrder?.itemName}`, 'success');
  };

  const cancelServe = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const groupedOrders = getGroupedOrders();

  // Function to count orders by status
  const getOrderCounts = () => {
    const counts = {
      all: orders.length,
      toCook: orders.filter(order => order.status === "đang chờ").length,
      ready: orders.filter(order => order.status === "đang thực hiện").length,
      completed: orders.filter(order => order.status === "bắt đầu phục vụ").length
    };
    return counts;
  };

  const orderCounts = getOrderCounts();

  // Map Vietnamese status to English for display
  const getTabDisplayName = (status: string) => {
    switch (status) {
      case "đang chờ": return "Đang chờ";
      case "đang thực hiện": return "Đang thực hiện";
      case "bắt đầu phục vụ": return "Bắt đầu phục vụ";
      default: return status;
    }
  };

  const getTabCount = (status: string) => {
    switch (status) {
      case "đang chờ": return orderCounts.toCook;
      case "đang thực hiện": return orderCounts.ready;
      case "bắt đầu phục vụ": return orderCounts.completed;
      default: return 0;
    }
  };

  // Function to get remaining sidebar items (not completed)
  const getRemainingItems = () => {
    const remainingItems: Record<string, number> = {};
    
    // Count orders that are NOT completed
    orders.forEach(order => {
      if (order.status !== "bắt đầu phục vụ") {
        remainingItems[order.itemName] = (remainingItems[order.itemName] || 0) + 1;
      }
    });
    
    return remainingItems;
  };

  const remainingItems = getRemainingItems();

  // Function to check if an item should be shown in sidebar
  const shouldShowInSidebar = (itemName: string) => {
    return remainingItems[itemName] > 0;
  };

  // Function to check if all orders of a specific itemName are completed
  const areAllOrdersCompleted = (itemName: string) => {
    const group = groupedOrders[itemName];
    if (!group) return false;
    return group.every(order => order.status === "bắt đầu phục vụ");
  };

  // Effect to handle sidebar animation
  useEffect(() => {
    const allCompleted = Object.values(groupedOrders).every(group => 
      group.every(order => order.status === "bắt đầu phục vụ")
    );

    if (allCompleted && !isSidebarAnimating) {
      setIsSidebarAnimating(true);
      // Simulate sidebar removal animation
      setTimeout(() => {
        setIsSidebarAnimating(false);
      }, 500); // Match CSS transition duration
    } else if (!allCompleted && isSidebarAnimating) {
      setIsSidebarAnimating(false);
    }
  }, [groupedOrders, isSidebarAnimating]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const newToast = {
      id: Date.now(),
      type,
      message,
      isVisible: true,
    };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.map(toast =>
      toast.id === id ? { ...toast, isVisible: false } : toast
    ));
    
    // Actually remove from array after animation
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 300);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-50"
            onClick={cancelServe}
          ></div>
          
          {/* Modal */}
          <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Xác nhận phục vụ
                </h3>
                <button
                  onClick={cancelServe}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="mb-6">
                <p className="text-gray-700">
                  Bạn có chắc chắn muốn chuyển <strong>{selectedOrder?.itemName}</strong> (Bàn {selectedOrder?.tableNumber}) sang trạng thái 'Bắt đầu phục vụ'?
                </p>
              </div>
              
              {/* Modal Footer */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelServe}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmServe}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors duration-200"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-lg transition-all duration-300 transform ${
              toast.isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
            role="alert"
          >
            {/* Icon */}
            <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${
              toast.type === 'success' 
                ? 'text-green-500 bg-green-100' 
                : toast.type === 'error'
                ? 'text-red-500 bg-red-100'
                : 'text-orange-500 bg-orange-100'
            }`}>
              {toast.type === 'success' && (
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
                </svg>
              )}
              <span className="sr-only">{toast.type} icon</span>
            </div>
            
            {/* Message */}
            <div className="ms-3 text-sm font-normal">{toast.message}</div>
            
            {/* Close Button */}
            <button 
              type="button" 
              onClick={() => removeToast(toast.id)}
              className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Left Sidebar - Categories */}
      <div className="w-80 bg-gray-200 p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Danh mục món ăn</h2>
        
        {/* Category Filters - Moved to top */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3 text-gray-700">Bộ lọc</h3>
          <div className="flex flex-col gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`${category.color} ${selectedCategory === category.name ? 'ring-2 ring-blue-300' : ''} hover:opacity-90 transition-all duration-200 text-white font-medium py-2 px-4 rounded-lg text-center`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Beverages Section - Dynamic based on remaining orders */}
        {remainingItems["Nước chanh dây"] > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              {Array.from({ length: remainingItems["Nước chanh dây"] || 0 }, (_, index) => (
                <div
                  key={`nuoc-chanh-day-${index}`}
                  className={`transition-all duration-500 ease-in-out transform ${
                    shouldShowInSidebar("Nước chanh dây") 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                  }`}
                  style={{
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <button
                    onClick={() => setSelectedCategory("Đồ uống")}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 transition-colors duration-200 text-black font-medium py-3 px-6 rounded-full text-center"
                  >
                    Nước chanh dây
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mixed Items Section - Dynamic based on remaining orders */}
        {(shouldShowInSidebar("Nước chanh dây") || shouldShowInSidebar("Trà đào ối hồng") || shouldShowInSidebar("Cacao đá xay")) && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex flex-col gap-3">
              {shouldShowInSidebar("Nước chanh dây") && (
                <div
                  className={`transition-all duration-500 ease-in-out transform ${
                    shouldShowInSidebar("Nước chanh dây") 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                  }`}
                >
                  <button
                    onClick={() => setSelectedCategory("Đồ uống")}
                    className="w-full bg-green-500 hover:bg-green-600 transition-colors duration-200 text-white font-medium py-3 px-6 rounded-full text-center"
                  >
                    Nước chanh dây
                  </button>
                </div>
              )}
              {shouldShowInSidebar("Trà đào ối hồng") && (
                <div
                  className={`transition-all duration-500 ease-in-out transform ${
                    shouldShowInSidebar("Trà đào ối hồng") 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                  }`}
                  style={{
                    transitionDelay: shouldShowInSidebar("Nước chanh dây") ? '100ms' : '0ms'
                  }}
                >
                  <button
                    onClick={() => setSelectedCategory("Đồ uống")}
                    className="w-full bg-green-500 hover:bg-green-600 transition-colors duration-200 text-white font-medium py-3 px-6 rounded-full text-center"
                  >
                    Trà đào ối hồng
                  </button>
                </div>
              )}
              {shouldShowInSidebar("Cacao đá xay") && (
                <div
                  className={`transition-all duration-500 ease-in-out transform ${
                    shouldShowInSidebar("Cacao đá xay") 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
                  }`}
                  style={{
                    transitionDelay: shouldShowInSidebar("Trà đào ối hồng") ? '200ms' : shouldShowInSidebar("Nước chanh dây") ? '100ms' : '0ms'
                  }}
                >
                  <button
                    onClick={() => setSelectedCategory("Đồ uống")}
                    className="w-full bg-green-500 hover:bg-green-600 transition-colors duration-200 text-white font-medium py-3 px-6 rounded-full text-center"
                  >
                    Cacao đá xay
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Tabs with Counts - Centered */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <nav className="flex justify-center space-x-2">
            {/* Status Tabs */}
            {(["đang chờ", "đang thực hiện", "bắt đầu phục vụ"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === tab
                    ? 'bg-gray-300 text-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{getTabDisplayName(tab)}</span>
                <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                  tab === "đang chờ" 
                    ? 'bg-gray-400 text-white' 
                    : tab === "đang thực hiện"
                    ? 'bg-blue-500 text-white'
                    : 'bg-green-500 text-white'
                }`}>
                  {getTabCount(tab)}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Orders Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            {Object.entries(groupedOrders).map(([itemName, orderGroup], groupIndex) => (
              <div key={itemName} className="space-y-3">
                {/* Group Header - Only show when collapsed or if single item */}
                {(!expandedGroup || expandedGroup !== itemName) && (
                  <div
                    className="bg-green-500 rounded-2xl p-4 cursor-pointer hover:bg-green-600 transition-colors duration-200"
                    onClick={() => setExpandedGroup(expandedGroup === itemName ? null : itemName)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={orderGroup[0].image}
                          alt={itemName}
                          className="w-16 h-16 rounded-lg object-cover bg-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em">No Image</text></svg>`;
                          }}
                        />
                        <div className="text-white">
                          <h3 className="text-lg font-semibold">{itemName}</h3>
                          <p className="text-sm opacity-90">x{orderGroup.length}</p>
                          <p className="text-sm opacity-75">
                            Bàn: {orderGroup.map(order => order.tableNumber).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="bg-yellow-400 text-black font-bold rounded-lg px-4 py-2 text-lg">
                        {groupIndex + 1}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Individual Items */}
                {expandedGroup === itemName && (
                  <div className="space-y-3">
                    {orderGroup.map((order, index) => (
                      <div key={order.id} className="bg-green-500 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src={order.image}
                              alt={order.itemName}
                              className="w-16 h-16 rounded-lg object-cover bg-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em">No Image</text></svg>`;
                              }}
                            />
                            <div className="text-white">
                              <h3 className="text-lg font-semibold">{order.itemName}</h3>
                              <p className="text-sm opacity-90">x{order.quantity}</p>
                              <p className="text-sm opacity-75">Bàn: {order.tableNumber}</p>
                              <p className="text-xs opacity-60">{order.orderTime}</p>
                            </div>
                          </div>
                          
                          {/* Show button for "đang thực hiện" status, number badge for others */}
                          {activeTab === "đang thực hiện" ? (
                            <button
                              onClick={() => handleServeClick(order)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              Bắt đầu phục vụ
                            </button>
                          ) : (
                            <div className="bg-yellow-400 text-black font-bold rounded-lg px-4 py-2 text-lg">
                              {index + 1}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Action Button - Only for "đang chờ" status */}
                    {activeTab === "đang chờ" && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => handlePrepare(itemName)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-8 rounded-2xl transition-colors duration-200"
                        >
                          Thực hiện
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Empty State */}
            {Object.keys(groupedOrders).length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">
                  Không có đơn hàng nào trong trạng thái "{activeTab}"
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 