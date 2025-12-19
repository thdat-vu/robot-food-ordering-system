import React from 'react';
import { Order, OrderStatus, GroupedOrders } from '@/types/kitchen';
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
  onCancelClick?: (order: Order) => void;
  onAcceptRedoClick?: (orderId: number, itemName: string) => void;
  onRejectRedoClick?: (orderId: number, itemName: string) => void;
  selectedGroup?: { itemName: string; tableNumber: number; id: number }[] | null;
  onPrepareMultipleOrders?: (orders: { itemName: string; tableNumber: number; id: number }[]) => void;
  onServeMultipleOrders?: (orders: { itemName: string; tableNumber: number; id: number }[]) => void;
  showIndividualCards?: boolean;
  selectedIds?: Set<number>;
  animatingOutIds?: Set<number>;
}

export function OrdersContent({
  groupedOrders,
  activeTab,
  onGroupClick,
  onPrepareClick,
  onServeClick,
  onCancelClick,
  onAcceptRedoClick,
  onRejectRedoClick,
  selectedGroup,
  onPrepareMultipleOrders,
  onServeMultipleOrders,
  showIndividualCards,
  selectedIds,
  animatingOutIds = new Set()
}: OrdersContentProps) {
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

  const renderCancelButton = (order: Order) => (
    <Button
      onClick={(e) => { e.stopPropagation(); onCancelClick && onCancelClick(order); }}
      variant="destructive"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      Huỷ món
    </Button>
  );

  // Visual badges for status and time to improve scanning
  const renderStatusBadge = (status: OrderStatus) => {
    const styleMap: Record<OrderStatus, { classes: string; icon: React.ReactNode }> = {
      'đang chờ': { 
        classes: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      },
      'đang thực hiện': { 
        classes: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      },
      'bắt đầu phục vụ': { 
        classes: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200 shadow-sm',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      },
      'phục vụ nhanh': { 
        classes: 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 shadow-sm',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      },
      'yêu cầu làm lại': { 
        classes: 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border border-red-200 shadow-sm',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      },
      'đã phục vụ': { 
        classes: 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200 shadow-sm',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      },
      'đã huỷ': { 
        classes: 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border border-gray-300 shadow-sm',
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      },
    };
    const style = styleMap[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.classes}`}>
        {style.icon}
        {status}
      </span>
    );
  };

  const renderTimeBadge = (estimatedTime: string) => {
    const minutes = Number.parseInt(estimatedTime);
    let classes = 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200';
    let iconColor = 'text-emerald-500';
    if (!Number.isNaN(minutes)) {
      if (minutes > 20) {
        classes = 'bg-gradient-to-r from-red-50 to-orange-50 text-red-700 border border-red-200';
        iconColor = 'text-red-500';
      } else if (minutes > 10) {
        classes = 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200';
        iconColor = 'text-amber-500';
      }
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${classes}`}>
        <svg className={`w-3.5 h-3.5 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {estimatedTime}
      </span>
    );
  };

  const normalizeNoteKey = (note: string | null | undefined) => {
    const trimmed = note?.trim();
    if (!trimmed) return '__NO_NOTE__';
    return trimmed.toLowerCase();
  };

  const groupOrdersByNote = (orders: Order[]) => {
    const map = new Map<string, { key: string; displayNote: string | null; orders: Order[] }>();
    orders.forEach(order => {
      const key = normalizeNoteKey(order.note);
      const displayNote = order.note?.trim() || null;
      if (!map.has(key)) {
        map.set(key, { key, displayNote, orders: [] });
      }
      map.get(key)!.orders.push(order);
    });
    return Array.from(map.values());
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
            <Card 
              key={order.id} 
              className={`hover:shadow-md transition-shadow duration-200 ${animatingOutIds.has(order.id) ? 'animating-out' : ''}`}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex-1">
                  {/* Primary Info: Title + Size + Quantity + Table on same line */}
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1.5">
                    {order.itemName}
                    {order.sizeName && (
                      <span className="text-blue-600">
                        {' '}({order.sizeName.charAt(0).toUpperCase()})
                      </span>
                    )}
                    {' '}x{order.quantity > 0 ? order.quantity : 1} - Bàn {order.tableNumber}
                  </h3>
                  
                  {/* Secondary Info: Note & Toppings - More prominent */}
                  {order.note && (
                    <div className="mt-2 text-sm text-orange-700 bg-orange-100 px-3 py-2 rounded-md border-l-4 border-orange-500">
                      <span className="font-semibold">Ghi chú:</span> {order.note}
                    </div>
                  )}
                  {order.toppings && order.toppings.length > 0 && (
                    <div className="mt-2 text-sm text-green-700 bg-green-100 px-3 py-2 rounded-md border-l-4 border-green-500">
                      <span className="font-semibold">Toppings:</span> {order.toppings.join(', ')}
                    </div>
                  )}
                  
                  {/* Tertiary Info: Time & Date - Subtle */}
                  <div className="flex items-center gap-3 mt-2.5">
                    <div className="flex items-center gap-1 text-gray-500">
                      {renderClockIcon()}
                      <span className="text-xs">{order.estimatedTime}</span>
                    </div>
                    {order.createdTime && (
                      <div className="flex items-center gap-1 text-gray-400">
                        {renderCalendarIcon()}
                        <span className="text-xs">{order.createdTime}</span>
                      </div>
                    )}
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
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">Không có đơn hàng</h3>
          <p className="text-gray-400">Không có đơn hàng nào trong trạng thái "{activeTab}"</p>
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
    
    // Get category accent color
    const getCategoryGradient = (category?: string) => {
      switch (category) {
        case 'Đồ uống': return 'from-cyan-500 to-blue-500';
        case 'Món chính': return 'from-orange-500 to-red-500';
        case 'Tráng miệng': return 'from-pink-500 to-purple-500';
        default: return 'from-gray-500 to-gray-600';
      }
    };
    
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <Card className={`relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] border-2 ${
          isSelectedSingle ? 'border-blue-500 shadow-blue-100 ring-2 ring-blue-200' : 'border-transparent'
        } ${animatingOutIds.has(order.id) ? 'animating-out' : ''}`}
        >
          {/* Top gradient accent bar */}
          <div className={`h-1.5 bg-gradient-to-r ${getCategoryGradient(order.category)}`}></div>
          
          <CardHeader className="flex flex-row items-center gap-4 p-5" onClick={() => onGroupClick(itemName)}>
            <div className="flex-1 min-w-0">
              {/* Primary Info: Title + Size + Table on same line */}
              <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3">
                {order.itemName}
                {order.sizeName && (
                  <span className="ml-2 px-2.5 py-0.5 text-sm font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full border border-blue-200">
                    {order.sizeName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-gray-400 font-normal mx-2">-</span>
                <span className="text-lg font-semibold text-gray-600">
                  Bàn {order.tableNumber}: x{order.quantity > 0 ? order.quantity : 1}
                </span>
              </h3>
              
              {/* Note & Toppings with modern styling */}
              {order.note && (
                <div className="mt-3 text-sm text-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2.5 rounded-xl border border-amber-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                    <span><span className="font-semibold">Ghi chú:</span> {order.note}</span>
                  </div>
                </div>
              )}
              {order.toppings && order.toppings.length > 0 && (
                <div className="mt-2 text-sm text-emerald-800 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2.5 rounded-xl border border-emerald-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span><span className="font-semibold">Toppings:</span> {order.toppings.join(', ')}</span>
                  </div>
                </div>
              )}
              
              {/* Time badges with improved styling */}
              <div className="flex items-center gap-3 mt-4">
                {renderTimeBadge(order.estimatedTime)}
                {order.createdTime && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-full border border-gray-200">
                    {renderCalendarIcon()}
                    {order.createdTime}
                  </span>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            {onCancelClick && (
              <CardAction>
                <div className="flex gap-2">
                  {renderCancelButton(order)}
                </div>
              </CardAction>
            )}
            {activeTab === 'yêu cầu làm lại' && onAcceptRedoClick && (
              <CardAction>
                <Button 
                  onClick={e => { e.stopPropagation(); onAcceptRedoClick(order.id, order.itemName); }}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg"
                  size="sm"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Bắt đầu làm lại
                </Button>
              </CardAction>
            )}
          </CardHeader>
        </Card>
        
        {/* Bottom sticky CTA with improved styling */}
        <div className="sticky bottom-0 z-10 mt-6 py-4 flex justify-center">
          {activeTab === 'đang chờ' && isSelectedSingle && (
            <Button 
              onClick={() => onPrepareClick(order.id, order.itemName)} 
              size="lg" 
              className="font-bold text-lg px-8 py-4 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Thực hiện món
            </Button>
          )}
          {activeTab === 'đang thực hiện' && (
            <Button 
              onClick={() => onServeClick(order)} 
              size="lg" 
              className="font-bold text-lg px-8 py-4 rounded-2xl shadow-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Bắt đầu phục vụ
            </Button>
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
    
    // Get category accent color
    const getCategoryGradient = (category?: string) => {
      switch (category) {
        case 'Đồ uống': return 'from-cyan-500 to-blue-500';
        case 'Món chính': return 'from-orange-500 to-red-500';
        case 'Tráng miệng': return 'from-pink-500 to-purple-500';
        default: return 'from-gray-500 to-gray-600';
      }
    };
    
    if (allOrders.length === 0) {
      return (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">Không có món nào</h3>
            <p className="text-gray-400">Chưa có đơn hàng nào sẵn sàng phục vụ</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {sortedOrders.map((order, index) => (
            <div
              key={order.id}
              className={`relative overflow-hidden bg-white rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] border-2 shadow-md ${
                selectedIds && selectedIds.has(order.id) 
                  ? 'border-emerald-500 shadow-emerald-200 ring-2 ring-emerald-200' 
                  : 'border-gray-100 hover:border-emerald-300'
              } ${animatingOutIds.has(order.id) ? 'animating-out' : ''}`}
            >
              {/* Left gradient accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${getCategoryGradient(order.category)}`}></div>
              
              <div className="flex items-center gap-4 p-4 pl-5">
                <div className="flex-1 min-w-0">
                  {/* Primary Info: Name + Size + Table on same line */}
                  <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
                    {order.itemName}
                    {order.sizeName && (
                      <span className="ml-2 px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full border border-blue-200">
                        {order.sizeName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="text-gray-400 font-normal mx-2">-</span>
                    <span className="text-base font-semibold text-gray-600">
                      Bàn {order.tableNumber}: x{order.quantity > 0 ? order.quantity : 1}
                    </span>
                  </h3>
                  
                  {/* Note & Toppings */}
                  {order.note && (
                    <div className="mt-2 text-sm text-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2 rounded-xl border border-amber-200">
                      <span className="font-semibold">Ghi chú:</span> {order.note}
                    </div>
                  )}
                  {order.toppings && order.toppings.length > 0 && (
                    <div className="mt-2 text-sm text-emerald-800 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2 rounded-xl border border-emerald-200">
                      <span className="font-semibold">Toppings:</span> {order.toppings.join(', ')}
                    </div>
                  )}
                  
                  {/* Time badges */}
                  <div className="flex items-center gap-3 mt-2">
                    {renderTimeBadge(order.estimatedTime)}
                    {order.createdTime && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-full border border-gray-200">
                        {renderCalendarIcon()}
                        {order.createdTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
    // Only consider selected orders for bulk actions
    const selectedSortedOrders = selectedIds ? sortedOrders.filter(order => selectedIds.has(order.id)) : [];
    
    // Get category accent color
    const getCategoryGradient = (category?: string) => {
      switch (category) {
        case 'Đồ uống': return 'from-cyan-500 to-blue-500';
        case 'Món chính': return 'from-orange-500 to-red-500';
        case 'Tráng miệng': return 'from-pink-500 to-purple-500';
        default: return 'from-gray-500 to-gray-600';
      }
    };
    
    if (allOrders.length === 0) {
      return (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">Chưa có món được chọn</h3>
            <p className="text-gray-400">Vui lòng chọn món từ danh sách bên trái</p>
          </div>
        </div>
      );
    }
    // Group by item name + size + note so identical dishes collapse into a single card with quantity
    const groupedByName: { itemName: string; sizeName: string; noteKey: string; displayNote: string | null; orders: Order[] }[] = (() => {
      const map = new Map<string, { itemName: string; sizeName: string; noteKey: string; displayNote: string | null; orders: Order[] }>();
      for (const order of sortedOrders) {
        const noteKey = normalizeNoteKey(order.note);
        const sizeKey = order.sizeName || '';
        const key = `${order.itemName}::${sizeKey}::${noteKey}`;
        if (!map.has(key)) {
          map.set(key, {
            itemName: order.itemName,
            sizeName: order.sizeName || '',
            noteKey,
            displayNote: order.note?.trim() || null,
            orders: [],
          });
        }
        map.get(key)!.orders.push(order);
      }
      return Array.from(map.values());
    })();

    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {groupedByName.map(({ itemName, sizeName, orders, displayNote, noteKey }) => {
            const first = orders[0];
            const groupSelected = selectedIds ? orders.some(o => selectedIds.has(o.id)) : false;
            const anyAnimating = orders.some(o => animatingOutIds.has(o.id));
            
            // Group orders by table to show quantity per table
            const ordersByTable = new Map<number, Order[]>();
            orders.forEach(order => {
              const tableNum = order.tableNumber;
              if (!ordersByTable.has(tableNum)) {
                ordersByTable.set(tableNum, []);
              }
              ordersByTable.get(tableNum)!.push(order);
            });
            
            // Format table badges
            const tableBadges = Array.from(ordersByTable.entries())
              .sort(([a], [b]) => a - b);
            
            return (
              <div
                key={`${itemName}-${sizeName}-${noteKey}`}
                className={`relative overflow-hidden bg-white rounded-2xl cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] border-2 shadow-md ${
                  groupSelected 
                    ? 'border-blue-500 shadow-blue-200 ring-2 ring-blue-200' 
                    : 'border-gray-100 hover:border-blue-300'
                } ${anyAnimating ? 'animating-out' : ''}`}
                onClick={() => onGroupClick(itemName)}
              >
                {/* Left gradient accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${getCategoryGradient(first.category)}`}></div>
                
                <div className="flex items-center gap-4 p-4 pl-5">
                  <div className="flex-1 min-w-0">
                    {/* Primary Info: Name + Size + Table info on same line */}
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
                      {itemName}
                      {first.sizeName && (
                        <span className="ml-2 px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full border border-blue-200">
                          {first.sizeName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="text-gray-400 font-normal mx-2">-</span>
                      {tableBadges.map(([tableNum, tableOrders], idx) => (
                        <span key={tableNum} className="text-base font-semibold text-gray-600">
                          {idx > 0 && <span className="text-gray-400">, </span>}
                          Bàn {tableNum}: x{tableOrders.length}
                        </span>
                      ))}
                    </h3>
                    
                    {/* Note */}
                    {displayNote && (
                      <div className="mt-2 text-sm text-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                          </svg>
                          <span><span className="font-semibold">Ghi chú:</span> {displayNote}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Time badges */}
                    <div className="flex items-center gap-3 mt-2">
                      {renderTimeBadge(first.estimatedTime)}
                      {first.createdTime && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-full border border-gray-200">
                          {renderCalendarIcon()}
                          {first.createdTime}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Selection indicator */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    groupSelected 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg' 
                      : 'bg-gray-100'
                  }`}>
                    {groupSelected ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bottom sticky CTA with improved styling */}
        <div className="sticky bottom-0 z-10 py-4 mt-6 flex justify-center">
          {activeTab === 'đang chờ' && selectedSortedOrders.length > 0 && onPrepareMultipleOrders && (
            <Button 
              onClick={() => onPrepareMultipleOrders(selectedSortedOrders.map(order => ({
                itemName: order.itemName,
                tableNumber: order.tableNumber,
                id: order.id
              })))}
              size="lg"
              className="font-bold text-lg px-8 py-4 rounded-2xl shadow-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Thực hiện ({selectedSortedOrders.length} món)
            </Button>
          )}
          {activeTab === 'đang thực hiện' && selectedSortedOrders.length > 0 && onServeMultipleOrders && (
            <Button 
              onClick={() => onServeMultipleOrders(selectedSortedOrders.map(order => ({
                itemName: order.itemName,
                tableNumber: order.tableNumber,
                id: order.id
              })))}
              size="lg"
              className="font-bold text-lg px-8 py-4 rounded-2xl shadow-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transform hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Bắt đầu phục vụ ({selectedSortedOrders.length} món)
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Get category accent color
  const getCategoryGradient = (category?: string) => {
    switch (category) {
      case 'Đồ uống': return 'from-cyan-500 to-blue-500';
      case 'Món chính': return 'from-orange-500 to-red-500';
      case 'Tráng miệng': return 'from-pink-500 to-purple-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="space-y-4">
        {Object.entries(groupedOrders).flatMap(([itemName, orderGroup]) => {
          const noteGroups = groupOrdersByNote(orderGroup);
          return noteGroups.map(({ key: noteKey, displayNote, orders }) => {
            const groupSelected = selectedIds ? orders.some(o => selectedIds!.has(o.id)) : false;
            const anyAnimating = orders.some(o => animatingOutIds.has(o.id));
            const representative = orders[0];
            
            // Group orders by table to show quantity per table
            const ordersByTable = new Map<number, Order[]>();
            orders.forEach(order => {
              const tableNum = order.tableNumber;
              if (!ordersByTable.has(tableNum)) {
                ordersByTable.set(tableNum, []);
              }
              ordersByTable.get(tableNum)!.push(order);
            });
            
            // Format table badges
            const tableBadges = Array.from(ordersByTable.entries())
              .sort(([a], [b]) => a - b);
            
            return (
              <div 
                key={`${itemName}-${representative.sizeName || ''}-${noteKey}`} 
                className={`relative overflow-hidden bg-white rounded-2xl cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01] border-2 shadow-md ${
                  groupSelected 
                    ? 'border-blue-500 shadow-blue-200 ring-2 ring-blue-200' 
                    : 'border-gray-100 hover:border-blue-300'
                } ${anyAnimating ? 'animating-out' : ''}`}
              >
                {/* Left gradient accent bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${getCategoryGradient(representative.category)}`}></div>
                
                <div className="flex items-center gap-4 p-4 pl-5" onClick={() => onGroupClick(itemName)}>
                  <div className="flex-1 min-w-0">
                    {/* Primary Info: Name + Size + Table info on same line */}
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2">
                      {itemName}
                      {representative.sizeName && (
                        <span className="ml-2 px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full border border-blue-200">
                          {representative.sizeName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="text-gray-400 font-normal mx-2">-</span>
                      {tableBadges.map(([tableNum, tableOrders], idx) => (
                        <span key={tableNum} className="text-base font-semibold text-gray-600">
                          {idx > 0 && <span className="text-gray-400">, </span>}
                          Bàn {tableNum}: x{tableOrders.length}
                        </span>
                      ))}
                    </h3>
                    
                    {/* Note & Toppings */}
                    {displayNote && (
                      <div className="mt-2 text-sm text-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                          </svg>
                          <span><span className="font-semibold">Ghi chú:</span> {displayNote}</span>
                        </div>
                      </div>
                    )}
                    {representative.toppings && representative.toppings.length > 0 && (
                      <div className="mt-2 text-sm text-emerald-800 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span><span className="font-semibold">Toppings:</span> {representative.toppings.join(', ')}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Time badges */}
                    <div className="flex items-center gap-3 mt-2">
                      {renderTimeBadge(getGroupEstimatedTime(orders))}
                      {representative.createdTime && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-500 bg-gray-50 rounded-full border border-gray-200">
                          {renderCalendarIcon()}
                          {representative.createdTime}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action button with modern styling */}
                  {activeTab === 'đang chờ' && (
                    <div className="flex-shrink-0">
                      <Button 
                        onClick={e => {
                          e.stopPropagation();
                          if (onPrepareMultipleOrders) {
                            onPrepareMultipleOrders(
                              orders.map(o => ({ itemName: o.itemName, tableNumber: o.tableNumber, id: o.id }))
                            );
                          } else {
                            for (const o of orders) {
                              onPrepareClick(o.id, o.itemName);
                            }
                          }
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-4 py-2"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Thực hiện
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })}
      </div>
    </div>
  );
} 