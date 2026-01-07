import React, {useMemo, useState} from "react";
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

export const OrderStatus: React.FC<{ status: string }> = ({status}) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const getStatusInfo = useMemo(() => {
        switch (status) {
            case OrderStatusEnum.Pending:
                return {
                    text: "Chờ xác nhận",
                    color: "bg-amber-100 text-amber-700 border-amber-200",
                    icon: Clock,
                };
            case OrderStatusEnum.Confirmed:
                return {
                    text: "Đã xác nhận",
                    color: "bg-blue-100 text-blue-700 border-blue-200",
                    icon: Bell,
                };
            case OrderStatusEnum.Preparing:
                return {
                    text: "Đang pha chế",
                    color: "bg-orange-100 text-orange-700 border-orange-200",
                    icon: ChefHat,
                };
            case OrderStatusEnum.Delivering:
                return {
                    text: "Đang phục vụ",
                    color: "bg-purple-100 text-purple-700 border-purple-200",
                    icon: Truck,
                };
            case OrderStatusEnum.Completed:
                return {
                    text: "Hoàn thành",
                    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
                    icon: CheckCircle2,
                };
            case OrderStatusEnum.Cancelled:
                return {
                    text: "Đã hủy",
                    color: "bg-red-100 text-red-700 border-red-200",
                    icon: XOctagon,
                };
            case OrderStatusEnum.Served:
                return {
                    text: "Đã phục vụ",
                    color: "bg-green-100 text-green-700 border-green-200",
                    icon: Smile,
                };
            case OrderStatusEnum.Ready:
                return {
                    text: "Sẵn sàng",
                    color: "bg-teal-100 text-teal-700 border-teal-200",
                    icon: UtensilsCrossed,
                };
            default:
                return {
                    text: "Không rõ",
                    color: "bg-gray-100 text-gray-700 border-gray-200",
                    icon: AlertCircle,
                };
        }
    }, [status]);

    const {text, color, icon: Icon} = getStatusInfo;

    return (
        <div className="relative inline-block">
            <div
                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border ${color} transition-all hover:scale-110 cursor-pointer`}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <Icon size={16} strokeWidth={2.5}/>
            </div>

            {showTooltip && (
                <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div
                        className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                        {text}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
