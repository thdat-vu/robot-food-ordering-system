import React from 'react';
import { Order } from '@/types/kitchen';

interface ConfirmationModalProps {
  isOpen: boolean;
  selectedOrder: Order | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({ isOpen, selectedOrder, onConfirm, onCancel }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900 bg-opacity-50"
        onClick={onCancel}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Xác nhận phục vụ
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
          
          {/* Modal Body */}
          <div className="mb-6">
            <p className="text-gray-700">
              Bạn có chắc chắn muốn chuyển <strong>{selectedOrder?.itemName}</strong> (Bàn {selectedOrder?.tableNumber}) sang trạng thái 'Bắt đầu phục vụ'?
            </p>
          </div>
          
          {/* Modal Footer */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-colors duration-200"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors duration-200"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 