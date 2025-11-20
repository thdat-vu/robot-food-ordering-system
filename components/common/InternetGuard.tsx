// components/common/InternetGuard.tsx
'use client';

import React, {useState, useEffect} from 'react';
import {NoInternetPage} from '@/components/common/NoInternetPage';

export const InternetGuard: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isOnline, setIsOnline] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!mounted) {
        return <>{children}</>;
    }

    if (!isOnline) {
        return <NoInternetPage/>;
    }

    return <>{children}</>;
};