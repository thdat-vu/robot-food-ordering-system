import { useState } from 'react';
import { Toast } from '@/types/kitchen';
import { TOAST_AUTO_DISMISS_TIME, TOAST_ANIMATION_DURATION } from '@/constants/kitchen-data';

export function useToastKitchen() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const newToast: Toast = {
      id: Date.now(),
      type,
      message,
      isVisible: true,
    };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
    
    // Auto-dismiss after configured time
    setTimeout(() => {
      removeToast(newToast.id);
    }, TOAST_AUTO_DISMISS_TIME);
  };

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.map(toast =>
      toast.id === id ? { ...toast, isVisible: false } : toast
    ));
    
    // Actually remove from array after animation
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, TOAST_ANIMATION_DURATION);
  };

  return {
    toasts,
    addToast,
    removeToast
  };
} 