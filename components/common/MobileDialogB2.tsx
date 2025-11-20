import React from 'react';
import {CheckCircle, XCircle, AlertTriangle, X} from 'lucide-react';

type DialogStatus = 'success' | 'error' | 'warning';

interface MobileDialogProps {
    isOpen: boolean;
    onClose: () => void;
    status: DialogStatus;
    message: string;
    title?: string;
    rigttConten: string;
    rightClick: () => void;
    leftConten: string;
    leftClick: () => void;
}

export const MobileDialogB2: React.FC<MobileDialogProps> = ({
                                                                isOpen,
                                                                onClose,
                                                                status,
                                                                message,
                                                                title,
                                                                leftClick,
                                                                leftConten,
                                                                rigttConten,
                                                                rightClick,
                                                            }) => {
    if (!isOpen) return null;

    const getStatusConfig = (status: DialogStatus) => {
        switch (status) {
            case 'success':
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-300',
                    iconColor: 'text-green-600',
                    titleColor: 'text-green-800',
                    textColor: 'text-green-700',
                    leftBtn: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    rightBtn: 'bg-green-600 text-white hover:bg-green-700',
                    title: title || 'Thành công!',
                };
            case 'error':
                return {
                    icon: XCircle,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-300',
                    iconColor: 'text-red-600',
                    titleColor: 'text-red-800',
                    textColor: 'text-red-700',
                    leftBtn: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    rightBtn: 'bg-red-600 text-white hover:bg-red-700',
                    title: title || 'Lỗi!',
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-300',
                    iconColor: 'text-yellow-600',
                    titleColor: 'text-yellow-800',
                    textColor: 'text-yellow-700',
                    leftBtn: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    rightBtn: 'bg-yellow-500 text-white hover:bg-yellow-600',
                    title: title || 'Cảnh báo!',
                };
            default:
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-300',
                    iconColor: 'text-gray-600',
                    titleColor: 'text-gray-800',
                    textColor: 'text-gray-700',
                    leftBtn: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    rightBtn: 'bg-gray-600 text-white hover:bg-gray-700',
                    title: title || 'Thông báo',
                };
        }
    };

    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div
                className={`relative w-[90%] max-w-sm mx-auto ${config.bgColor} ${config.borderColor} border rounded-2xl shadow-2xl animate-fadeIn`}
            >
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 transition"
                >
                    <X size={22} className="text-gray-500"/>
                </button>

                {/* Nội dung */}
                <div className="p-6 pt-10 flex flex-col items-center text-center">
                    <div className={`p-3 rounded-full border ${config.borderColor} mb-3`}>
                        <IconComponent size={36} className={config.iconColor}/>
                    </div>

                    <h3 className={`text-lg font-semibold mb-2 ${config.titleColor}`}>
                        {message}
                    </h3>

                    {/*<p className={`text-sm mb-6 ${config.textColor}`}>*/}
                    {/*    {message}*/}
                    {/*</p>*/}

                    {/* Nút hành động */}
                    <div className="flex w-full gap-3 mt-2">
                        <button
                            onClick={leftClick}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition ${config.rightBtn}`}
                        >
                            {leftConten}
                        </button>
                        <button
                            onClick={rightClick}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition ${config.leftBtn}`}
                        >
                            {rigttConten}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
