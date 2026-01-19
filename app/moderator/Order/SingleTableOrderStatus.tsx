import React, { useState } from "react";
import {
  Clock,
  ChefHat,
  User,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type OrderStatusUI = "pending" | "cooking" | "serving" | "completed";

export const mapOrderStatus = (status?: string): OrderStatusUI => {
  switch (status) {
    case "Pending":
    case "Confirmed":
      return "pending";
    case "Preparing":
    case "RedoRequested":
      return "cooking";
    case "Delivering":
      return "serving";
    case "Completed":
    case "Cancelled":
      return "completed";
    default:
      return "pending";
  }
};

interface Props {
  tableNumber?: string;
  lastOrderUpdateTime?: string;
  kitchenItemCount?: number;
  waiterItemCount?: number;
  cancelledItemCount?: number;
  totalItemCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const STATUS_UI: Record<
  OrderStatusUI,
  { label: string; bgColor: string; textColor: string; borderColor: string }
> = {
  pending: {
    label: "Chờ xác nhận",
    bgColor: "bg-slate-50",
    textColor: "text-slate-700",
    borderColor: "border-slate-200",
  },
  cooking: {
    label: "Đang nấu",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
  serving: {
    label: "Đang phục vụ",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  completed: {
    label: "Hoàn thành",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
};

export default function SingleTableOrderStatus({
  tableNumber,
  lastOrderUpdateTime,
  kitchenItemCount = 0,
  waiterItemCount = 0,
  cancelledItemCount = 0,
  totalItemCount,
  onRefresh,
  isRefreshing,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalItems =
    totalItemCount ?? kitchenItemCount + waiterItemCount + cancelledItemCount;

  const status = resolveOrderStatusUI({
    kitchenItemCount,
    waiterItemCount,
    totalItemCount: totalItems,
  });

  const statusInfo = STATUS_UI[status];
  const { time, minutesAgo } = parseDateTimeWithDiff(lastOrderUpdateTime);
  const delayInfo = getDelayInfo(status, minutesAgo);

  return (
    <div
      className={`
        relative bg-white border rounded-lg shadow-sm 
        transition-shadow hover:shadow-md
        ${statusInfo.borderColor}
      `}
    >
      <div
        className={`px-4 py-3 ${statusInfo.bgColor} border-b ${statusInfo.borderColor}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{tableNumber}</h2>

          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${statusInfo.textColor}`}>
              {statusInfo.label}
            </span>

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Làm mới"
                className="p-1.5 rounded hover:bg-white/50 disabled:opacity-50 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""
                    }`}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
            <span className="font-medium">· {minutesAgo} phút trước</span>
          </div>

          {delayInfo.isDelayed && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Trễ {minutesAgo - delayInfo.threshold}p</span>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          {/* Tổng */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="text-sm font-medium text-slate-700">
              Tổng cộng
            </span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900">
                {totalItems} món
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <StatItem
                icon={<ChefHat className="w-4 h-4" />}
                label="Bếp"
                value={kitchenItemCount}
                color="orange"
              />
              <StatItem
                icon={<User className="w-4 h-4" />}
                label="Phục vụ"
                value={waiterItemCount}
                color="blue"
              />
              <StatItem
                icon={<XCircle className="w-4 h-4" />}
                label="Hủy"
                value={cancelledItemCount}
                color="red"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "orange" | "blue" | "red";
}) {
  const colorMap = {
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      icon: "text-orange-600",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: "text-blue-600",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: "text-red-600",
    },
  };

  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} rounded-lg p-3 text-center`}>
      <div className={`${colors.icon} flex justify-center mb-1`}>{icon}</div>
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      <div className={`text-lg font-bold ${colors.text}`}>{value}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm ${highlight ? "font-medium" : ""
        }`}
    >
      <span className="text-slate-600">{label}</span>
      <span
        className={highlight ? "text-slate-900 font-bold" : "text-slate-700"}
      >
        {value}
      </span>
    </div>
  );
}

function resolveOrderStatusUI({
  kitchenItemCount = 0,
  waiterItemCount = 0,
  totalItemCount = 0,
}: {
  kitchenItemCount?: number;
  waiterItemCount?: number;
  totalItemCount?: number;
}): OrderStatusUI {
  if (totalItemCount === 0) return "pending";
  if (waiterItemCount > 0) return "serving";
  if (kitchenItemCount > 0) return "cooking";
  return "completed";
}

function parseDateTimeWithDiff(dateTime?: string) {
  if (!dateTime) return { time: "--:--", minutesAgo: 0 };

  const [datePart, timePart] = dateTime.split(" ");
  const [day, month, year] = datePart.split("/");

  const parsed = new Date(`${year}-${month}-${day}T${timePart}`);
  if (isNaN(parsed.getTime())) return { time: "--:--", minutesAgo: 0 };

  const diffMs = Date.now() - parsed.getTime();
  const minutesAgo = Math.max(0, Math.floor(diffMs / 60000));

  return { time: timePart, minutesAgo };
}

function getDelayInfo(status: OrderStatusUI, minutesAgo: number) {
  const thresholds: Record<OrderStatusUI, number> = {
    pending: 10,
    cooking: 15,
    serving: 10,
    completed: Infinity,
  };

  const threshold = thresholds[status];
  return {
    isDelayed: minutesAgo > threshold,
    threshold,
  };
}
