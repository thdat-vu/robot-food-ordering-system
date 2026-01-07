import React, {useState, useRef, useEffect} from "react";
import {createPortal} from "react-dom";
import {
    Clock,
    CheckCircle2,
    ChefHat,
    Truck,
    Smile,
    XOctagon,
    Bell,
    AlertCircle,
    UtensilsCrossed,
    Info,
    X,
} from "lucide-react";

enum OrderStatusEnum {
    Pending = "Pending",
    Confirmed = "Confirmed",
    Preparing = "Preparing",
    Delivering = "Delivering",
    Completed = "Completed",
    Cancelled = "Cancelled",
    Served = "Served",
    Ready = "Ready",
}

export const StatusLegendMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({top: 0, right: 0});
    const buttonRef = useRef<HTMLButtonElement>(null);

    const statusList = [
        {
            status: OrderStatusEnum.Pending,
            text: "Chờ xác nhận",
            color: "bg-amber-100 text-amber-700 border-amber-200",
            bgIcon: "bg-amber-100",
            icon: Clock,
            description: "Đơn hàng đang chờ được xác nhận",
        },
        {
            status: OrderStatusEnum.Confirmed,
            text: "Đã xác nhận",
            color: "bg-blue-100 text-blue-700 border-blue-200",
            bgIcon: "bg-blue-100",
            icon: Bell,
            description: "Đơn hàng đã được xác nhận thành công",
        },
        {
            status: OrderStatusEnum.Preparing,
            text: "Đang pha chế",
            color: "bg-orange-100 text-orange-700 border-orange-200",
            bgIcon: "bg-orange-100",
            icon: ChefHat,
            description: "Đơn hàng đang được chuẩn bị",
        },
        {
            status: OrderStatusEnum.Ready,
            text: "Sẵn sàng",
            color: "bg-teal-100 text-teal-700 border-teal-200",
            bgIcon: "bg-teal-100",
            icon: UtensilsCrossed,
            description: "Đơn hàng đã sẵn sàng để phục vụ",
        },
        {
            status: OrderStatusEnum.Delivering,
            text: "Đang phục vụ",
            color: "bg-purple-100 text-purple-700 border-purple-200",
            bgIcon: "bg-purple-100",
            icon: Truck,
            description: "Đơn hàng đang được phục vụ",
        },
        {
            status: OrderStatusEnum.Served,
            text: "Đã phục vụ",
            color: "bg-green-100 text-green-700 border-green-200",
            bgIcon: "bg-green-100",
            icon: Smile,
            description: "Đơn hàng đã được phục vụ xong",
        },
        {
            status: OrderStatusEnum.Completed,
            text: "Hoàn thành",
            color: "bg-emerald-100 text-emerald-700 border-emerald-200",
            bgIcon: "bg-emerald-100",
            icon: CheckCircle2,
            description: "Đơn hàng đã hoàn thành",
        },
        {
            status: OrderStatusEnum.Cancelled,
            text: "Đã hủy",
            color: "bg-red-100 text-red-700 border-red-200",
            bgIcon: "bg-red-100",
            icon: XOctagon,
            description: "Đơn hàng đã bị hủy",
        },
    ];

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
    }, [isOpen]);

    const menuContent = isOpen && (
        <>
            <div
                className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
                onClick={() => setIsOpen(false)}
            ></div>

            <div
                className="fixed z-[9999] w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                style={{
                    top: `${position.top}px`,
                    right: `${position.right}px`,
                }}
            >
                <div
                    className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                            <Info size={16} className="text-white"/>
                        </div>
                        <h3 className="text-base font-bold text-gray-800">
                            Chú thích trạng thái
                        </h3>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={18}/>
                    </button>
                </div>

                <div className="p-3 max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                        {statusList.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.status}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200"
                                >
                                    <div
                                        className={`flex-shrink-0 w-12 h-12 rounded-full ${item.bgIcon} flex items-center justify-center`}
                                    >
                                        <div
                                            className={`w-7 h-7 rounded-lg border ${item.color} flex items-center justify-center`}>
                                            <Icon size={14} strokeWidth={2.5}/>
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-800 text-sm mb-0.5">
                                            {item.text}
                                        </div>
                                        <div className="text-xs text-gray-500 leading-relaxed">
                                            {item.description}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-500 text-center font-medium">
                        Tổng cộng {statusList.length} trạng thái đơn hàng
                    </p>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex-shrink-0">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-all hover:scale-105 shadow-sm"
                title="Chú thích trạng thái"
            >
                <Info size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4"/>
            </button>

            {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
        </div>
    );
};
