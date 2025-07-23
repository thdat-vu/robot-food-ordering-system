import React from 'react';
import { Order, OrderStatus, GroupedOrders } from '@/types/kitchen';
import { DEFAULT_IMAGE_PLACEHOLDER } from '@/constants/kitchen-data';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  CardFooter,
} from '@/components/ui/card';

interface OrdersContentProps {
  groupedOrders: GroupedOrders;
  activeTab: OrderStatus;
  expandedGroup: string | null;
  onGroupClick: (itemName: string) => void;
  onPrepareClick: (orderId: number, itemName: string) => void;
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

  const renderClockIcon = () => (
    <svg 
      className="w-4 h-4 text-black opacity-90" 
      aria-hidden="true" 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <path 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );

  const renderServeButton = (order: Order) => (
    <Button onClick={() => onServeClick(order)}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Bắt đầu phục vụ
    </Button>
  );

  const renderNumberBadge = (number: number) => (
    <div className="bg-yellow-400 text-black font-bold rounded-lg px-4 py-2 text-lg">
      {number}
    </div>
  );

  // Get the most common estimated time for a group
  const getGroupEstimatedTime = (orderGroup: Order[]): string => {
    // Since items in the same group should have the same estimated time
    return orderGroup[0]?.estimatedTime || "";
  };

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

  // If only one order is present, show only the shadcn Card (no green expanded card or extra button)
  const singleOrderEntry = Object.entries(groupedOrders).length === 1 && Object.values(groupedOrders)[0].length === 1;
  if (singleOrderEntry) {
    const [itemName, orderGroup] = Object.entries(groupedOrders)[0];
    const order = orderGroup[0];
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center gap-4" onClick={() => onGroupClick(itemName)}>
            {renderOrderImage(order)}
            <div className="flex-1">
              <CardTitle>{order.itemName}</CardTitle>
              <CardDescription>
                x{order.quantity} &nbsp;|&nbsp; Bàn: {order.tableNumber}
              </CardDescription>
              <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                {renderClockIcon()}
                <span className="text-xs opacity-80">{order.estimatedTime}</span>
              </div>
            </div>
            {activeTab === 'đang chờ' && (
              <CardAction>
                <Button onClick={e => { e.stopPropagation(); onPrepareClick(order.id, order.itemName); }}>
                  Thực hiện
                </Button>
              </CardAction>
            )}
            {activeTab === 'đang thực hiện' && (
              <CardAction>
                <Button onClick={e => { e.stopPropagation(); onServeClick(order); }}>
                  Bắt đầu phục vụ
                </Button>
              </CardAction>
            )}
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Special rendering for 'bắt đầu phục vụ' tab: show each order as a separate shadcn Card with only its details
  if (activeTab === 'bắt đầu phục vụ') {
    // Flatten all orders
    const allOrders = Object.values(groupedOrders).flat();
    if (allOrders.length === 0) {
      return (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              Không có đơn hàng nào trong trạng thái "bắt đầu phục vụ"
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {allOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center gap-4">
                {renderOrderImage(order)}
                <div className="flex-1">
                  <CardTitle>{order.itemName}</CardTitle>
                  <CardDescription>
                    x{order.quantity}
                  </CardDescription>
                  <div className="text-sm mt-1">Bàn: {order.tableNumber}</div>
                  <div className="text-xs opacity-60">{order.orderTime}</div>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    {renderClockIcon()}
                    <span className="text-xs opacity-80">{order.estimatedTime}</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="space-y-4">
        {Object.entries(groupedOrders).map(([itemName, orderGroup], groupIndex) => (
          <React.Fragment key={itemName}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center gap-4" onClick={() => onGroupClick(itemName)}>
                {renderOrderImage(orderGroup[0])}
                <div className="flex-1">
                  <CardTitle>{itemName}</CardTitle>
                  <CardDescription>
                    x{orderGroup.length} &nbsp;|&nbsp; Bàn: {orderGroup.map(order => order.tableNumber).join(', ')}
                  </CardDescription>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    {renderClockIcon()}
                    <span className="text-xs opacity-80">{getGroupEstimatedTime(orderGroup)}</span>
                  </div>
                </div>
                {activeTab === 'đang chờ' && (
                  <CardAction>
                    <Button onClick={e => { e.stopPropagation(); onPrepareClick(orderGroup[0].id, orderGroup[0].itemName); }}>
                      Thực hiện
                    </Button>
                  </CardAction>
                )}
              </CardHeader>
            </Card>
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
                          {/* Estimated Time for Individual Order */}
                          <div className="flex items-center gap-1 mt-1">
                            {renderClockIcon()}
                            <span className="text-xs opacity-80">{order.estimatedTime}</span>
                          </div>
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
                    <Button onClick={() => onPrepareClick(orderGroup[0].id, orderGroup[0].itemName)}>
                      Thực hiện
                    </Button>
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
} 