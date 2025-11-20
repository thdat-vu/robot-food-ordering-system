'use client'
import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const NoInternetPage: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Reload trang khi có internet trở lại
            setTimeout(() => {
                window.location.reload();
            }, 500);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRetry = () => {
        setIsRetrying(true);

        // Kiểm tra kết nối bằng cách fetch một endpoint nhỏ
        fetch('https://www.google.com/favicon.ico', {
            mode: 'no-cors',
            cache: 'no-store'
        })
            .then(() => {
                setIsOnline(true);
                window.location.reload();
            })
            .catch(() => {
                setIsRetrying(false);
                // Vẫn offline
            });
    };

    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 text-center">
                    {/* Icon */}
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-100 mb-4">
                            <WifiOff className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                        Mất kết nối Internet
                    </h1>

                    {/* Description */}
                    <p className="text-gray-600 mb-8 text-sm sm:text-base leading-relaxed">
                        Vui lòng kiểm tra kết nối mạng của bạn và thử lại.
                        Trang sẽ tự động tải lại khi có kết nối trở lại.
                    </p>

                    {/* Retry Button */}
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className={`
                            w-full py-3.5 px-6 rounded-lg font-semibold text-white
                            transition-all duration-200 flex items-center justify-center gap-2
                            ${isRetrying
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg hover:shadow-xl'
                        }
                        `}
                    >
                        <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
                        <span>{isRetrying ? 'Đang thử lại...' : 'Thử lại'}</span>
                    </button>

                    {/* Tips */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs sm:text-sm text-gray-500 mb-3 font-medium">
                            Các bước khắc phục:
                        </p>
                        <ul className="text-xs sm:text-sm text-gray-600 space-y-2 text-left">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Kiểm tra WiFi hoặc dữ liệu di động</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Bật lại chế độ máy bay</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Khởi động lại router/modem</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        Đang tự động kiểm tra kết nối...
                    </p>
                    <div className="flex justify-center gap-1 mt-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};