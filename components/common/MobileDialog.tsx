import React, {useState} from 'react';
import {CheckCircle, XCircle, AlertTriangle, X} from 'lucide-react';

type DialogStatus = 'success' | 'error' | 'warning';

interface MobileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    status: DialogStatus;
    message: string;
    title?: string;
}

export const MobileDialog: React.FC<MobileDialogProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              status,
                                                              message,
                                                              title
                                                          }) => {
    if (!isOpen) return null;

    const getStatusConfig = (status: DialogStatus) => {
        switch (status) {
            case 'success':
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    iconColor: 'text-green-600',
                    titleColor: 'text-green-800',
                    textColor: 'text-green-700',
                    buttonColor: 'bg-green-600 hover:bg-green-700',
                    title: title || 'Thành công!'
                };
            case 'error':
                return {
                    icon: XCircle,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    iconColor: 'text-red-600',
                    titleColor: 'text-red-800',
                    textColor: 'text-red-700',
                    buttonColor: 'bg-red-600 hover:bg-red-700',
                    title: title || 'Lỗi!'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    iconColor: 'text-yellow-600',
                    titleColor: 'text-yellow-800',
                    textColor: 'text-yellow-700',
                    buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
                    title: title || 'Cảnh báo!'
                };
            default:
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    iconColor: 'text-gray-600',
                    titleColor: 'text-gray-800',
                    textColor: 'text-gray-700',
                    buttonColor: 'bg-gray-600 hover:bg-gray-700',
                    title: title || 'Thông báo'
                };
        }
    };

    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div
                className={`relative w-full max-w-sm mx-auto ${config.bgColor} ${config.borderColor} border rounded-2xl shadow-xl transform transition-all duration-200 animate-in fade-in zoom-in-95`}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20} className="text-gray-500"/>
                </button>

                <div className="p-6 pt-8">
                    <div className="flex justify-center mb-4">
                        <div className={`p-3 rounded-full ${config.bgColor} border ${config.borderColor}`}>
                            <IconComponent size={32} className={config.iconColor}/>
                        </div>
                    </div>

                    <h3 className={`text-lg font-semibold text-center mb-3 ${config.titleColor}`}>
                        {config.title}
                    </h3>

                    <p className={`text-center text-sm leading-6 mb-6 ${config.textColor}`}>
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className={`w-full py-3 px-4 ${config.buttonColor} text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};
