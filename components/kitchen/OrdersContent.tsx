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
  onGroupClick: (itemName: string) => void;
  onPrepareClick: (orderId: number, itemName: string) => void;
  onServeClick: (order: Order) => void;
  selectedGroup?: { itemName: string; tableNumber: number; id: number }[] | null;
  onPrepareMultipleOrders?: (orders: { itemName: string; tableNumber: number; id: number }[]) => void;
  showIndividualCards?: boolean;
}

export function OrdersContent({
  groupedOrders,
  activeTab,
  onGroupClick,
  onPrepareClick,
  onServeClick,
  selectedGroup,
  onPrepareMultipleOrders,
  showIndividualCards
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

  // Get the most common estimated time for a group
  const getGroupEstimatedTime = (orderGroup: Order[]): string => {
    // Since items in the same group should have the same estimated time
    return orderGroup[0]?.estimatedTime || "";
  };

  // Render selected group items as individual shadcn cards
  const renderSelectedGroupItems = () => {
    if (!selectedGroup || !onPrepareMultipleOrders) {
      return null;
    }

    // Get the actual order objects for the selected group
    const groupOrders: Order[] = [];
    selectedGroup.forEach(({ itemName, tableNumber, id }) => {
      const orderList = (groupedOrders as Record<string, Order[]>)[itemName] || [];
      const foundOrder = orderList.find(
        o => o.tableNumber === tableNumber && o.id === id
      );
      if (foundOrder) {
        groupOrders.push(foundOrder);
      }
    });

    if (groupOrders.length === 0) {
      return null;
    }

    return (
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Group Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Nhóm đã chọn</h2>
          <p className="text-gray-600">Chọn "Thực hiện tất cả" để xử lý {groupOrders.length} món cùng lúc</p>
        </div>

        {/* Individual Item Cards */}
        <div className="space-y-4 mb-6">
          {groupOrders.map((order, index) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center gap-4">
                {renderOrderImage(order)}
                <div className="flex-1">
                  <CardTitle>{order.itemName}</CardTitle>
                  <CardDescription>
                    {order.quantity > 0 ? `x${order.quantity}` : ''} &nbsp;Bàn: {order.tableNumber}
                  </CardDescription>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    {renderClockIcon()}
                    <span className="text-xs opacity-80">{order.estimatedTime}</span>
                  </div>
                </div>
                {/* Item number badge */}
                <div className="bg-blue-100 text-blue-800 font-bold rounded-lg px-3 py-1 text-sm">
                  {index + 1}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Group Action Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => onPrepareMultipleOrders(selectedGroup)}          >
            Thực hiện
          </Button>
        </div>
      </div>
    );
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

  // If only one order is present, show only the shadcn Card
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
                {order.quantity > 0 ? `x${order.quantity}` : ''} &nbsp;Bàn: {order.tableNumber}
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
                    {order.quantity > 0 ? `x${order.quantity}` : ''}
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

  // Special rendering for individual cards when showIndividualCards is true
  if (showIndividualCards) {
    // Flatten all orders
    const allOrders = Object.values(groupedOrders).flat();
    if (allOrders.length === 0) {
      return (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">
              Không có món ăn nào được chọn
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
                    {order.quantity > 0 ? `x${order.quantity}` : ''} &nbsp;Bàn: {order.tableNumber}
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
          ))}
          
          {/* Group action button at the bottom */}
          {activeTab === 'đang chờ' && allOrders.length > 0 && onPrepareMultipleOrders && (
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={() => onPrepareMultipleOrders(allOrders.map(order => ({
                  itemName: order.itemName,
                  tableNumber: order.tableNumber,
                  id: order.id
                })))}
                size="lg"
                className="text-lg font-semibold"
              >
                Thực hiện 
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="space-y-4">
        {Object.entries(groupedOrders).map(([itemName, orderGroup], groupIndex) => (
          <Card key={itemName} className="cursor-pointer hover:shadow-md transition-shadow duration-200">
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
        ))}
      </div>
    </div>
  );
} 