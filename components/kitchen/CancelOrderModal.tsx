import React from 'react';
import { Order } from '@/types/kitchen';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { DEFAULT_IMAGE_PLACEHOLDER } from '@/constants/kitchen-data';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: Order | null;
}

export function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  order
}: CancelOrderModalProps) {
  if (!order) return null;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = DEFAULT_IMAGE_PLACEHOLDER;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600">
            Xác nhận huỷ món
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={order.image}
              alt={order.itemName}
              className="w-16 h-16 rounded-lg object-cover bg-gray-200"
              onError={handleImageError}
            />
            <div>
              <h3 className="font-semibold text-lg">{order.itemName}</h3>
              <p className="text-gray-600">
                {order.quantity > 0 ? `x${order.quantity}` : ''} • Bàn: {order.tableNumber}
                {order.sizeName && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • {order.sizeName}
                  </span>
                )}
              </p>
              {order.toppings && order.toppings.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  <span className="font-medium">Toppings:</span> {order.toppings.join(', ')}
                </p>
              )}
              {order.note && (
                <p className="text-xs text-orange-600 mt-1">
                  <span className="font-medium">Ghi chú:</span> {order.note}
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-yellow-800 text-sm font-medium">Cảnh báo</span>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Bạn có chắc chắn muốn huỷ món ăn này? 
              <br />
              Hành động này không thể hoàn tác.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Quay lại
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Xác nhận huỷ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
