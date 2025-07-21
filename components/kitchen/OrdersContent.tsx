import React from 'react';
import { Order, OrderStatus, GroupedOrders } from '@/types/kitchen';
import { DEFAULT_IMAGE_PLACEHOLDER } from '@/constants/kitchen-data';

interface OrdersContentProps {
  groupedOrders: GroupedOrders;
  activeTab: OrderStatus;
  expandedGroup: string | null;
  onGroupClick: (itemName: string) => void;
  onPrepareClick: (itemName: string) => void;
  onServeClick: (order: Order) => void;
}

export function OrdersContent({
  groupedOrders,
  activeTab,
  expandedGroup,
  onGroupClick,
  onPrepareClick,
  onServeClick
}: OrdersContentProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = DEFAULT_IMAGE_PLACEHOLDER;
  };

  const renderOrderImage = (order: Order, additionalClasses: string = "") => (
    <img
      src={order.image}
      alt={order.itemName}
      className={`w-16 h-16 rounded-lg object-cover bg-gray-200 ${additionalClasses}`}
      onError={handleImageError}
    />
  );

  const renderServeButton = (order: Order) => (
    <button
      onClick={() => onServeClick(order)}
      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Bắt đầu phục vụ
    </button>
  );

  const renderNumberBadge = (number: number) => (
    <div className="bg-yellow-400 text-black font-bold rounded-lg px-4 py-2 text-lg">
      {number}
    </div>
  );

  if (Object.keys(groupedOrders).length === 0) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">
            Không có đơn hàng nào trong trạng thái "{activeTab}"
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="space-y-4">
        {Object.entries(groupedOrders).map(([itemName, orderGroup], groupIndex) => (
          <div key={itemName} className="space-y-3">
            {/* Group Header - Only show when collapsed or if single item */}
            {(!expandedGroup || expandedGroup !== itemName) && (
              <div
                className="bg-green-500 rounded-2xl p-4 cursor-pointer hover:bg-green-600 transition-colors duration-200"
                onClick={() => onGroupClick(itemName)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {renderOrderImage(orderGroup[0])}
                    <div className="text-white">
                      <h3 className="text-lg font-semibold">{itemName}</h3>
                      <p className="text-sm opacity-90">x{orderGroup.length}</p>
                      <p className="text-sm opacity-75">
                        Bàn: {orderGroup.map(order => order.tableNumber).join(', ')}
                      </p>
                    </div>
                  </div>
                  {renderNumberBadge(groupIndex + 1)}
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
                        {renderOrderImage(order)}
                        <div className="text-white">
                          <h3 className="text-lg font-semibold">{order.itemName}</h3>
                          <p className="text-sm opacity-90">x{order.quantity}</p>
                          <p className="text-sm opacity-75">Bàn: {order.tableNumber}</p>
                          <p className="text-xs opacity-60">{order.orderTime}</p>
                        </div>
                      </div>
                      
                      {/* Show button for "đang thực hiện" status, number badge for others */}
                      {activeTab === "đang thực hiện" 
                        ? renderServeButton(order)
                        : renderNumberBadge(index + 1)
                      }
                    </div>
                  </div>
                ))}
                
                {/* Action Button - Only for "đang chờ" status */}
                {activeTab === "đang chờ" && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={() => onPrepareClick(itemName)}
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
      </div>
    </div>
  );
} 