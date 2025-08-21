import React from 'react';
import { Button } from '@/components/ui/button';

interface InfoModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export function InfoModal({ isOpen, title = 'Lưu ý', message, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900 bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <Button onClick={onClose} aria-label="Close modal" variant="ghost" size="sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
            </Button>
          </div>

          {/* Modal Body */}
          <div className="mb-6">
            <p className="text-gray-700">
              {message}
            </p>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end">
            <Button onClick={onClose}>OK</Button>
          </div>
        </div>
      </div>
    </div>
  );
}


