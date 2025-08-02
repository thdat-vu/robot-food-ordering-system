import React from 'react';
import { Toast } from '@/hooks/use-toast-moderator';

interface ToastContainerProps {
  toasts: Toast[];
  onRemoveToast: (id: number) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  const renderIcon = (type: Toast['type']) => {
    const iconClasses = "w-5 h-5";
    
    switch (type) {
      case 'success':
        return (
          <svg className={iconClasses} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
          </svg>
        );
      case 'error':
        return (
          <svg className={iconClasses} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
          </svg>
        );
      case 'warning':
        return (
          <svg className={iconClasses} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
          </svg>
        );
    }
  };

  const getIconContainerClasses = (type: Toast['type']) => {
    const baseClasses = "inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg";
    
    switch (type) {
      case 'success':
        return `${baseClasses} text-green-500 bg-green-100`;
      case 'error':
        return `${baseClasses} text-red-500 bg-red-100`;
      case 'warning':
        return `${baseClasses} text-orange-500 bg-orange-100`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-lg transition-all duration-300 transform ${
            toast.isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
          role="alert"
        >
          {/* Icon */}
          <div className={getIconContainerClasses(toast.type)}>
            {renderIcon(toast.type)}
            <span className="sr-only">{toast.type} icon</span>
          </div>
          
          {/* Message */}
          <div className="ms-3 text-sm font-normal">{toast.message}</div>
          
          {/* Close Button */}
          <button 
            type="button" 
            onClick={() => onRemoveToast(toast.id)}
            className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
} 