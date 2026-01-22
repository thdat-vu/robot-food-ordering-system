import { useState } from 'react';
import { Toast } from '@/types/admin';

const TOAST_AUTO_DISMISS_TIME = 3000;
const TOAST_ANIMATION_DURATION = 300;

let toastSequenceCounter = 0;
const generateToastId = (): number => {
    toastSequenceCounter = (toastSequenceCounter + 1) % 1000;
    return Date.now() * 1000 + toastSequenceCounter;
};

export function useToastAdmin() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: 'success' | 'error' | 'warning') => {
        const newToast: Toast = {
            id: generateToastId(),
            type,
            message,
            isVisible: true,
        };

        setToasts(prevToasts => [...prevToasts, newToast]);

        setTimeout(() => {
            removeToast(newToast.id);
        }, TOAST_AUTO_DISMISS_TIME);
    };

    const removeToast = (id: number) => {
        setToasts(prevToasts => prevToasts.map(toast =>
            toast.id === id ? { ...toast, isVisible: false } : toast
        ));

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
