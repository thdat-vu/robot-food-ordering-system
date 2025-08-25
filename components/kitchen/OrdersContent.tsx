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
  onAcceptRedoClick?: (orderId: number, itemName: string) => void;
  onRejectRedoClick?: (orderId: number, itemName: string) => void;
  selectedGroup?: { itemName: string; tableNumber: number; id: number }[] | null;
  onPrepareMultipleOrders?: (orders: { itemName: string; tableNumber: number; id: number }[]) => void;
  onServeMultipleOrders?: (orders: { itemName: string; tableNumber: number; id: number }[]) => void;
  showIndividualCards?: boolean;
  selectedIds?: Set<number>;
}

export function OrdersContent({
  groupedOrders,
  activeTab,
  onGroupClick,
  onPrepareClick,
  onServeClick,
  onAcceptRedoClick,
  onRejectRedoClick,
  selectedGroup,
  onPrepareMultipleOrders,
  onServeMultipleOrders,
  showIndividualCards,
  selectedIds
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

  const renderCalendarIcon = () => (
    <svg 
      className="w-4 h-4 text-gray-500" 
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
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
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

  // Visual badges for status and time to improve scanning
  const renderStatusBadge = (status: OrderStatus) => {
    const styleMap: Record<OrderStatus, string> = {
      'đang chờ': 'bg-amber-100 text-amber-800',
      'đang thực hiện': 'bg-blue-100 text-blue-800',
      'bắt đầu phục vụ': 'bg-green-100 text-green-800',
      'yêu cầu làm lại': 'bg-red-100 text-red-800',
      'đã phục vụ': 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styleMap[status]}`}>
        {status}
      </span>
    );
  };

  const renderTimeBadge = (estimatedTime: string) => {
    const minutes = Number.parseInt(estimatedTime);
    let classes = 'bg-green-100 text-green-800';
    if (!Number.isNaN(minutes)) {
      if (minutes > 20) classes = 'bg-red-100 text-red-800';
      else if (minutes > 10) classes = 'bg-amber-100 text-amber-800';
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${classes}`}>
        {renderClockIcon()}
        {estimatedTime}
      </span>
    );
  };

  // Category priority: Drinks > Main > Dessert
  const categoryPriority = (categoryName?: string): number => {
    switch (categoryName) {
      case 'Đồ uống':
        return 0;
      case 'Món chính':
        return 1;
      case 'Tráng miệng':
        return 2;
      default:
        return 3;
    }
  };

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
                    {order.sizeName && (
                      <span className="ml-2 text-blue-600 font-medium">
                        • {order.sizeName}
                      </span>
                    )}
                  </CardDescription>
                  {order.toppings && order.toppings.length > 0 && (
                    <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      <span className="font-medium">Toppings:</span> {order.toppings.join(', ')}
                    </div>
                  )}
                  {order.note && (
                    <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      <span className="font-medium">Ghi chú:</span> {order.note}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    {renderClockIcon()}
                    <span className="text-xs opacity-80">{order.estimatedTime}</span>
                  </div>
                  {order.createdTime && (
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      {renderCalendarIcon()}
                      <span className="text-xs opacity-80">Ngày tạo đơn: {order.createdTime}</span>
                    </div>
                  )}
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
        {/* <div className="flex justify-center">
          <Button 
            onClick={() => onPrepareMultipleOrders(selectedGroup)}          >
            Thực hiện
          </Button>
        </div> */}
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
    const isSelectedSingle = selectedIds ? selectedIds.has(order.id) : false;
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Top CTA moved to header; keep bottom sticky button only */}
        <Card className={`cursor-pointer hover:shadow-md transition-shadow duration-200 ${isSelectedSingle ? 'bg-gray-100 border border-gray-300' : ''}`}
        >
          <CardHeader className="flex flex-row items-center gap-4" onClick={() => onGroupClick(itemName)}>
            {renderOrderImage(order)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle>{order.itemName}</CardTitle>
                {renderStatusBadge(activeTab)}
              </div>
              <CardDescription>
                {order.quantity > 0 ? `x${order.quantity}` : ''} &nbsp;Bàn: {order.tableNumber}
                {order.sizeName && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • {order.sizeName}
                  </span>
                )}
              </CardDescription>
              {order.toppings && order.toppings.length > 0 && (
                <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  <span className="font-medium">Toppings:</span> {order.toppings.join(', ')}
                </div>
              )}
              {order.note && (
                <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  <span className="font-medium">Ghi chú:</span> {order.note}
                </div>
              )}
              <div className="mt-1">{renderTimeBadge(order.estimatedTime)}</div>
              {order.createdTime && (
                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                  {renderCalendarIcon()}
                  <span className="text-xs opacity-80">Ngày tạo đơn: {order.createdTime}</span>
                </div>
              )}
            </div>
            {/* Primary CTAs moved to sticky toolbar above */}
            {activeTab === 'yêu cầu làm lại' && onAcceptRedoClick && onRejectRedoClick && (
              <CardAction>
                <div className="flex gap-2">
                  <Button 
                    onClick={e => { e.stopPropagation(); onAcceptRedoClick(order.id, order.itemName); }}
                    variant="default"
                    size="sm"
                  >
                    Bắt đầu làm lại
                  </Button>
                  <Button 
                    onClick={e => { e.stopPropagation(); onRejectRedoClick(order.id, order.itemName); }}
                    variant="outline"
                    size="sm"
                  >
                    Từ chối
                  </Button>
                </div>
              </CardAction>
            )}
          </CardHeader>
        </Card>
        {/* Bottom sticky CTA to mirror the top toolbar */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur z-10 mt-6 py-3 flex justify-center border-t">
          {activeTab === 'đang chờ' && (
            <Button onClick={() => onPrepareClick(order.id, order.itemName)} size="lg" className="font-semibold text-lg px-6 py-3 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white">Thực hiện</Button>
          )}
          {activeTab === 'đang thực hiện' && (
            <Button onClick={() => onServeClick(order)} size="lg" className="font-semibold text-lg px-6 py-3 rounded-full shadow-lg bg-orange-600 hover:bg-orange-700 text-white">Bắt đầu phục vụ</Button>
          )}
        </div>
      </div>
    );
  }

  // Special rendering for 'bắt đầu phục vụ' tab: show each order as a separate shadcn Card with only its details
  if (activeTab === 'bắt đầu phục vụ') {
    // Flatten all orders
    const allOrders = Object.values(groupedOrders).flat();
    const sortedOrders = [...allOrders].sort(
      (a, b) => categoryPriority(a.category) - categoryPriority(b.category)
    );
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
          {sortedOrders.map((order) => (
            <Card
              key={order.id}
              className={`hover:shadow-md transition-shadow duration-200 ${selectedIds && selectedIds.has(order.id) ? 'bg-gray-100 border border-gray-300' : ''}`}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                {renderOrderImage(order)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{order.itemName}</CardTitle>
                    {renderStatusBadge('bắt đầu phục vụ')}
                  </div>
                  <CardDescription>
                    {order.quantity > 0 ? `x${order.quantity}` : ''} &nbsp;Bàn: {order.tableNumber}
                    {order.sizeName && (
                      <span className="ml-2 text-blue-600 font-medium">
                        • {order.sizeName}
                      </span>
                    )}
                  </CardDescription>
                  {order.toppings && order.toppings.length > 0 && (
                    <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      <span className="font-medium">Toppings:</span> {order.toppings.join(', ')}
                    </div>
                  )}
                  {order.note && (
                    <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      <span className="font-medium">Ghi chú:</span> {order.note}
                    </div>
                  )}
                  <div className="text-xs opacity-60">{order.orderTime}</div>
                  <div className="mt-1">{renderTimeBadge(order.estimatedTime)}</div>
                  {order.createdTime && (
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      {renderCalendarIcon()}
                      <span className="text-xs opacity-80">Ngày tạo đơn: {order.createdTime}</span>
                    </div>
                  )}
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
    const sortedOrders = [...allOrders].sort(
      (a, b) => categoryPriority(a.category) - categoryPriority(b.category)
    );
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
        {/* Top bulk actions moved to header; keep bottom sticky button only */}

        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <Card
              key={order.id}
              className={`hover:shadow-md transition-shadow duration-200 ${selectedIds && selectedIds.has(order.id) ? 'bg-gray-100 border border-gray-300' : ''}`}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                {renderOrderImage(order)}
                <div className="flex-1">
                  <CardTitle>{order.itemName}</CardTitle>
                  <CardDescription>
                    {order.quantity > 0 ? `x${order.quantity}` : ''} &nbsp;Bàn: {order.tableNumber}
                    {order.sizeName && (
                      <span className="ml-2 text-blue-600 font-medium">
                        • {order.sizeName}
                      </span>
                    )}
                  </CardDescription>
                  {order.toppings && order.toppings.length > 0 && (
                    <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      <span className="font-medium">Toppings:</span> {order.toppings.join(', ')}
                    </div>
                  )}
                  {order.note && (
                    <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      <span className="font-medium">Ghi chú:</span> {order.note}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    {renderClockIcon()}
                    <span className="text-xs opacity-80">{order.estimatedTime}</span>
                  </div>
                  {order.createdTime && (
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                      {renderCalendarIcon()}
                      <span className="text-xs opacity-80">Ngày tạo đơn: {order.createdTime}</span>
                    </div>
                  )}
                </div>
                {activeTab === 'đang chờ' && !showIndividualCards && (
                  <CardAction>
                    <Button 
                      onClick={e => { e.stopPropagation(); onPrepareClick(order.id, order.itemName); }}
                      variant="default"
                    >
                      Thực hiện
                    </Button>
                  </CardAction>
                )}
                {activeTab === 'đang thực hiện' && !showIndividualCards && (
                  <CardAction>
                    <Button 
                      onClick={e => { e.stopPropagation(); onServeClick(order); }}
                      variant="default"
                    >
                      Bắt đầu phục vụ
                    </Button>
                  </CardAction>
                )}
                {activeTab === 'yêu cầu làm lại' && onAcceptRedoClick && onRejectRedoClick && (
                  <CardAction>
                    <div className="flex gap-2">
                      <Button 
                        onClick={e => { e.stopPropagation(); onAcceptRedoClick(order.id, order.itemName); }}
                        variant="default"
                        size="sm"
                      >
                        Bắt đầu làm lại
                      </Button>
                      <Button 
                        onClick={e => { e.stopPropagation(); onRejectRedoClick(order.id, order.itemName); }}
                        variant="outline"
                        size="sm"
                      >
                        Từ chối
                      </Button>
                    </div>
                  </CardAction>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
        {/* Bottom sticky CTA to mirror the top bulk actions */}
        <div className="sticky bottom-0 z-10 py-3 mt-6 flex justify-center">
          {activeTab === 'đang chờ' && allOrders.length > 0 && onPrepareMultipleOrders && (
            <Button 
              onClick={() => onPrepareMultipleOrders(sortedOrders.map(order => ({
                itemName: order.itemName,
                tableNumber: order.tableNumber,
                id: order.id
              })))}
              size="lg"
              className="font-semibold text-lg px-6 py-3 rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white"
            >
              Thực hiện ({sortedOrders.length})
            </Button>
          )}
          {activeTab === 'đang thực hiện' && allOrders.length > 0 && onServeMultipleOrders && (
            <Button 
              onClick={() => onServeMultipleOrders(sortedOrders.map(order => ({
                itemName: order.itemName,
                tableNumber: order.tableNumber,
                id: order.id
              })))}
              size="lg"
              className="font-semibold text-lg px-6 py-3 rounded-full shadow-lg bg-orange-600 hover:bg-orange-700 text-white"
            >
              Bắt đầu phục vụ ({sortedOrders.length})
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="space-y-4">
        {Object.entries(groupedOrders).map(([itemName, orderGroup], groupIndex) => {
          const groupSelected = selectedIds ? orderGroup.some(o => selectedIds!.has(o.id)) : false;
          return (
          <Card key={itemName} className={`cursor-pointer hover:shadow-md transition-shadow duration-200 ${groupSelected ? 'bg-gray-100 border border-gray-300' : ''}`}>
            <CardHeader className="flex flex-row items-center gap-4" onClick={() => onGroupClick(itemName)}>
              {renderOrderImage(orderGroup[0])}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle>{itemName}</CardTitle>
                  {renderStatusBadge(activeTab)}
                </div>
                <CardDescription>
                  x{orderGroup.length} &nbsp;|&nbsp; Bàn: {orderGroup.map(order => order.tableNumber).join(', ')}
                  {orderGroup[0].sizeName && (
                    <span className="ml-2 text-blue-600 font-medium">
                      • Size: {orderGroup[0].sizeName}  
                    </span>
                  )}
                </CardDescription>
                {orderGroup[0].toppings && orderGroup[0].toppings.length > 0 && (
                  <div className="mt-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    <span className="font-medium">Toppings:</span> {orderGroup[0].toppings.join(', ')}
                  </div>
                )}
                {(() => {
                  // Show note if any order in the group has a note
                  const notesWithContent = orderGroup.filter(order => order.note && order.note.trim() !== '');
                  if (notesWithContent.length > 0) {
                    const uniqueNotes = [...new Set(notesWithContent.map(order => order.note))];
                    if (uniqueNotes.length === 1) {
                      // All orders have the same note
                      return (
                        <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          <span className="font-medium">Ghi chú:</span> {uniqueNotes[0]}
                        </div>
                      );
                    } else {
                      // Different notes in the group
                      return (
                        <div className="mt-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                          <span className="font-medium">Ghi chú:</span> Có {notesWithContent.length} ghi chú khác nhau
                        </div>
                      );
                    }
                  }
                  return null;
                })()}
                <div className="mt-1">{renderTimeBadge(getGroupEstimatedTime(orderGroup))}</div>
                {orderGroup[0].createdTime && (
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    {renderCalendarIcon()}
                    <span className="text-xs opacity-80">Ngày tạo đơn: {orderGroup[0].createdTime}</span>
                  </div>
                )}
              </div>
              {activeTab === 'đang chờ' && (
                <CardAction>
                  <Button 
                    onClick={e => {
                      e.stopPropagation();
                      if (onPrepareMultipleOrders) {
                        onPrepareMultipleOrders(
                          orderGroup.map(o => ({ itemName: o.itemName, tableNumber: o.tableNumber, id: o.id }))
                        );
                      } else {
                        // Fallback: iterate to prepare each item in the group
                        for (const o of orderGroup) {
                          onPrepareClick(o.id, o.itemName);
                        }
                      }
                    }}
                    variant="default"
                  >
                    Thực hiện
                  </Button>
                </CardAction>
              )}
            </CardHeader>
          </Card>
        )})}
      </div>
    </div>
  );
} 