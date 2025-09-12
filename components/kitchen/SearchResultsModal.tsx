import React, { useState } from 'react';
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

  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = (reason: string) => {
    if (orderToCancel) {
      onCancelOrder(orderToCancel, reason);
      setOrderToCancel(null);
    }
    setShowCancelConfirm(false);
  };

  const handleCancelConfirmClose = () => {
    setShowCancelConfirm(false);
    setOrderToCancel(null);
  };

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
          <DialogTitle className="text-xl font-bold">
            Kết quả tìm kiếm: {productName}
          </DialogTitle>
          <p className="text-gray-600">
            Tìm thấy {orders.length} đơn hàng (sắp xếp theo thời gian mới nhất)
          </p>
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
                  {renderOrderImage(order)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{order.itemName}</CardTitle>
                      {renderStatusBadge(order.status)}
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
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                  
                  {/* Cancel button only for 'đang chờ' status */}
                  {canCancelOrder(order) && (
                    <CardAction>
                      <Button
                        onClick={() => handleCancelClick(order)}
                        variant="destructive"
                        size="sm"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        Huỷ món
                      </Button>
                    </CardAction>
                  )}
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
        />
      </DialogContent>
    </Dialog>
  );
}
