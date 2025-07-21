'use client';
import { useState } from 'react';
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
  };

  const handleServe = (itemName: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.itemName === itemName && order.status === "đang thực hiện"
          ? { ...order, status: "bắt đầu phục vụ" }
          : order
      )
    );
    setExpandedGroup(null);
  };

  const groupedOrders = getGroupedOrders();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
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

        {/* Beverages Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            {["Nước chanh dây", "Nước chanh dây", "Nước chanh dây"].map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory("Đồ uống")}
                className="bg-yellow-400 hover:bg-yellow-500 transition-colors duration-200 text-black font-medium py-3 px-6 rounded-full text-center"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Mixed Items Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setSelectedCategory("Đồ uống")}
              className="bg-green-500 hover:bg-green-600 transition-colors duration-200 text-white font-medium py-3 px-6 rounded-full text-center"
            >
              Nước chanh dây
            </button>
            <button
              onClick={() => setSelectedCategory("Đồ uống")}
              className="bg-green-500 hover:bg-green-600 transition-colors duration-200 text-white font-medium py-3 px-6 rounded-full text-center"
            >
              Trà đào ối hồng
            </button>
            <button
              onClick={() => setSelectedCategory("Đồ uống")}
              className="bg-green-500 hover:bg-green-600 transition-colors duration-200 text-white font-medium py-3 px-6 rounded-full text-center"
            >
              Cacao đá xay
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <nav className="flex space-x-8">
            {(["đang chờ", "đang thực hiện", "bắt đầu phục vụ"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                          <div className="bg-yellow-400 text-black font-bold rounded-lg px-4 py-2 text-lg">
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Action Button */}
                    <div className="flex justify-center mt-4">
                      {activeTab === "đang chờ" && (
                        <button
                          onClick={() => handlePrepare(itemName)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-8 rounded-2xl transition-colors duration-200"
                        >
                          Thực hiện
                        </button>
                      )}
                      {activeTab === "đang thực hiện" && (
                        <button
                          onClick={() => handleServe(itemName)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-2xl transition-colors duration-200"
                        >
                          Bắt đầu phục vụ
                        </button>
                      )}
                    </div>
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