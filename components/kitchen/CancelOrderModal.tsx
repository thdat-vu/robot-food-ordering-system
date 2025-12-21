import React, { useState, useMemo, useEffect } from 'react';
import { Order } from '@/types/kitchen';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DEFAULT_IMAGE_PLACEHOLDER } from '@/constants/kitchen-data';

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  order: Order | null;
  remainingCount?: number; // Number of remaining orders to cancel
  totalCount?: number; // Total number of orders to cancel
  allPendingOrders?: Order[]; // All pending orders to calculate total quantity for same items
}

export function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  order,
  remainingCount,
  totalCount,
  allPendingOrders = []
}: CancelOrderModalProps) {
  const [reason, setReason] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Reset reason and custom input when order changes (for next order in batch)
  useEffect(() => {
    if (order) {
      setReason('');
      setShowCustomInput(false);
    }
  }, [order?.id]); // Reset when order ID changes

  // Calculate total quantity for orders with same item name and size
  const totalQuantity = useMemo(() => {
    if (!order || allPendingOrders.length === 0) {
      return order?.quantity || 1;
    }
    
    const sameItems = allPendingOrders.filter(
      o => o.itemName === order.itemName && 
           o.sizeName === order.sizeName &&
           o.tableNumber === order.tableNumber
    );
    
    return sameItems.reduce((sum, o) => sum + (o.quantity || 1), 0);
  }, [order, allPendingOrders]);

  // Preset cancellation reasons
  const presetReasons = [
    'Hết nguyên liệu',
    'Hết người làm',
    'Dụng cụ làm bếp bị hư',
    'Khách yêu cầu hủy',
    'Thời gian chế biến quá lâu',
    'Lý do khác'
  ];

  if (!order) return null;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = DEFAULT_IMAGE_PLACEHOLDER;
  };

  const handleReasonButtonClick = (presetReason: string) => {
    if (presetReason === 'Lý do khác') {
      setShowCustomInput(true);
      // Clear any preset reasons when selecting custom reason
      setReason('');
      return;
    }
    
    // Hide custom input when selecting preset reason
    setShowCustomInput(false);
    
    setReason(prev => {
      const trimmedPrev = prev.trim();
      if (!trimmedPrev) return presetReason;
      // Prevent duplicate reasons; use '; ' separator
      const parts = trimmedPrev.split(/\s*;\s*/).filter(Boolean);
      if (parts.includes(presetReason)) return trimmedPrev; 
      return `${trimmedPrev}; ${presetReason}`;
    });
  };

  const handleConfirm = () => {
    const cancelReason = reason.trim() || 'Không có lý do cụ thể';
    onConfirm(cancelReason);
    
    // Don't close modal here - let SearchResultsModal handle it
    // Reset reason for next order (if any)
    setReason('');
    setShowCustomInput(false);
  };

  const handleClose = () => {
    onClose();
    setReason(''); // Reset reason when closing
    setShowCustomInput(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600">
            Xác nhận huỷ món
            {totalCount !== undefined && totalCount > 1 && remainingCount !== undefined && (
              <span className="ml-2 text-base font-normal text-gray-600">
                ({remainingCount} món còn lại trong tổng {totalCount} món)
              </span>
            )}
            {totalCount === undefined && remainingCount !== undefined && remainingCount > 0 && (
              <span className="ml-2 text-base font-normal text-gray-600">
                ({remainingCount} món còn lại)
              </span>
            )}
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
                {totalQuantity > 0 ? `x${totalQuantity}` : ''} • Bàn: {order.tableNumber}
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
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
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

          {/* Cancellation Reason Section */}
          <div className="space-y-3">
            <Label htmlFor="cancel-reason" className="text-sm font-medium text-gray-700">
              Lý do hủy món <span className="text-red-500">*</span>
            </Label>
            
            {/* Preset Reason Buttons */}
            <div className="flex flex-wrap gap-2">
              {presetReasons.map((presetReason, index) => (
                <Button
                  key={index}
                  type="button"
                  variant={
                    presetReason === 'Lý do khác' 
                      ? (showCustomInput ? "default" : "outline")
                      : (reason.split(/\s*;\s*/).includes(presetReason) ? "default" : "outline")
                  }
                  size="sm"
                  onClick={() => handleReasonButtonClick(presetReason)}
                  className="text-xs"
                >
                  {presetReason}
                </Button>
              ))}
            </div>
            
            {/* Custom Reason Input - Show when "Lý do khác" is selected */}
            {showCustomInput && (
              <div>
                <input
                  id="cancel-reason"
                  type="text"
                  placeholder="Nhập lý do hủy món..."
                  value={reason}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Quay lại
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="flex-1"
            disabled={!reason.trim()}
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
