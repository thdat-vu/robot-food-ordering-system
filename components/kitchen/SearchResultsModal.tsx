import React, { useState, useMemo, useRef } from 'react';
import { Order } from '@/types/kitchen';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DEFAULT_IMAGE_PLACEHOLDER } from '@/constants/kitchen-data';
import { CancelOrderModal } from './CancelOrderModal';

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string | null;
  orders: Order[];
  onCancelOrder: (order: Order, reason?: string) => void;
}

export function SearchResultsModal({
  isOpen,
  onClose,
  productName,
  orders,
  onCancelOrder
}: SearchResultsModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(new Set());
  const [pendingCancellations, setPendingCancellations] = useState<Order[]>([]);
  const [totalCancellationCount, setTotalCancellationCount] = useState<number>(0);
  // Use ref to maintain cancellation queue that persists across refreshes
  const cancellationQueueRef = useRef<Order[]>([]);
  const isProcessingRef = useRef(false);

  // Filter orders that can be cancelled
  const cancellableOrders = useMemo(() => {
    return orders.filter(order => order.status === 'đang chờ');
  }, [orders]);

  // Check if all cancellable orders are selected
  const allSelected = useMemo(() => {
    if (cancellableOrders.length === 0) return false;
    return cancellableOrders.every(order => selectedOrderIds.has(order.id));
  }, [cancellableOrders, selectedOrderIds]);

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(new Set(cancellableOrders.map(order => order.id)));
    } else {
      setSelectedOrderIds(new Set());
    }
  };

  // Handle individual checkbox
  const handleToggleOrder = (orderId: number, checked: boolean) => {
    setSelectedOrderIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(orderId);
      } else {
        newSet.delete(orderId);
      }
      return newSet;
    });
  };

  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelConfirm(true);
  };

  const handleCancelSelected = () => {
    if (selectedOrderIds.size === 0) return;
    
    const selectedOrders = orders.filter(order => selectedOrderIds.has(order.id));
    if (selectedOrders.length === 0) return;

    // Store orders to cancel in both state and ref
    cancellationQueueRef.current = [...selectedOrders];
    setPendingCancellations(selectedOrders);
    setTotalCancellationCount(selectedOrders.length);
    setOrderToCancel(selectedOrders[0]);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!orderToCancel || isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    
    // Get current order and queue from ref to ensure we have the latest
    const currentOrderToCancel = orderToCancel;
    const currentQueue = [...cancellationQueueRef.current];
    
    // Verify the order is still in the queue
    if (!currentQueue.find(o => o.id === currentOrderToCancel.id)) {
      console.warn('Order not found in queue, aborting');
      isProcessingRef.current = false;
      return;
    }

    try {
      // Wait for cancellation to complete before proceeding to next order
      await onCancelOrder(currentOrderToCancel, reason);
      
      // Remove cancelled order from selectedOrderIds
      setSelectedOrderIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentOrderToCancel.id);
        return newSet;
      });
    } catch (error) {
      // Even if cancellation fails, continue with remaining orders
      console.error('Error cancelling order:', error);
    }
    
    // Remove this order from cancellation queue
    const updatedQueue = currentQueue.filter(
      order => order.id !== currentOrderToCancel.id
    );
    cancellationQueueRef.current = updatedQueue;
    
    // Update state from updated queue
    setPendingCancellations(updatedQueue);
    
    if (updatedQueue.length > 0) {
      // Show modal for next order
      setOrderToCancel(updatedQueue[0]);
      // Keep modal open for next order
      isProcessingRef.current = false;
    } else {
      // All orders processed, close both modals and clear selection
      cancellationQueueRef.current = [];
      setPendingCancellations([]);
      setTotalCancellationCount(0);
      setOrderToCancel(null);
      setShowCancelConfirm(false);
      setSelectedOrderIds(new Set());
      isProcessingRef.current = false;
      // Close the search results modal after all cancellations are done
      onClose();
    }
  };

  const handleCancelConfirmClose = () => {
    // Only clear if not currently processing
    if (!isProcessingRef.current) {
      // Clear cancellation queue and state
      cancellationQueueRef.current = [];
      setPendingCancellations([]);
      setTotalCancellationCount(0);
      setOrderToCancel(null);
    }
    setShowCancelConfirm(false);
  };

  // Reset selection when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedOrderIds(new Set());
      setPendingCancellations([]);
      setTotalCancellationCount(0);
      setOrderToCancel(null);
      setShowCancelConfirm(false);
      cancellationQueueRef.current = [];
      isProcessingRef.current = false;
    }
  }, [isOpen]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = DEFAULT_IMAGE_PLACEHOLDER;
  };

  const renderOrderImage = (order: Order) => (
    <img
      src={order.image}
      alt={order.itemName}
      className="w-16 h-16 rounded-lg object-cover bg-gray-200"
      onError={handleImageError}
    />
  );

  const renderStatusBadge = (status: string) => {
    const styleMap: Record<string, string> = {
      'đang chờ': 'bg-amber-100 text-amber-800',
      'đang thực hiện': 'bg-blue-100 text-blue-800',
      'bắt đầu phục vụ': 'bg-green-100 text-green-800',
      'yêu cầu làm lại': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styleMap[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

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

  const canCancelOrder = (order: Order) => order.status === 'đang chờ';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">
                Kết quả tìm kiếm: {productName}
              </DialogTitle>
              <p className="text-gray-600">
                Tìm thấy {orders.length} đơn hàng (sắp xếp theo thời gian mới nhất)
              </p>
            </div>
            {cancellableOrders.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    className="size-5"
                    aria-label="Chọn tất cả"
                  />
                  <label className="text-sm font-medium text-gray-700 cursor-pointer">
                    Chọn tất cả ({cancellableOrders.length})
                  </label>
                </div>
                {selectedOrderIds.size > 0 && (
                  <Button
                    onClick={handleCancelSelected}
                    variant="destructive"
                    size="sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Huỷ {selectedOrderIds.size} món
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] space-y-4 pr-2">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">
                Không tìm thấy đơn hàng nào cho "{productName}"
              </div>
            </div>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center gap-4">
                  {/* Checkbox for cancellable orders */}
                  {canCancelOrder(order) && (
                    <div className="flex-shrink-0">
                      <Checkbox
                        checked={selectedOrderIds.has(order.id)}
                        onCheckedChange={(checked) => handleToggleOrder(order.id, checked === true)}
                        className="size-5"
                        aria-label={`Chọn món ${order.itemName} - Bàn ${order.tableNumber}`}
                      />
                    </div>
                  )}
                  {renderOrderImage(order)}
                  <div className="flex-1">
                    {/* Primary Info: Title + Size + Quantity + Table on same line */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {order.itemName}
                        {order.sizeName && (
                          <span className="text-blue-600">
                            {' '}({order.sizeName.charAt(0).toUpperCase()})
                          </span>
                        )}
                        {' '}x{order.quantity > 0 ? order.quantity : 1} - Bàn {order.tableNumber}
                      </h3>
                      {renderStatusBadge(order.status)}
                    </div>
                    
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
                    <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        {renderCalendarIcon()}
                        <span>Đặt lúc: {order.orderTime}</span>
                      </div>
                      {order.createdTime && (
                        <div className="flex items-center gap-1">
                          {renderCalendarIcon()}
                          <span>Tạo: {order.createdTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Cancel button removed - use checkbox and bulk cancel button instead */}
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Cancel Order Confirmation Modal */}
        <CancelOrderModal
          isOpen={showCancelConfirm}
          onClose={handleCancelConfirmClose}
          onConfirm={handleConfirmCancel}
          order={orderToCancel}
          remainingCount={
            pendingCancellations.length > 0 && totalCancellationCount > 0
              ? pendingCancellations.length
              : undefined
          }
          totalCount={totalCancellationCount > 0 ? totalCancellationCount : undefined}
          allPendingOrders={pendingCancellations}
        />
      </DialogContent>
    </Dialog>
  );
}
