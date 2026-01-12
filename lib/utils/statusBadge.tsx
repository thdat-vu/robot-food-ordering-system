import React from "react";
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Package,
  Utensils,
  PackageCheck,
  Truck,
  XCircle,
  RefreshCw,
  LogOut,
  Hourglass,
} from "lucide-react";

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "delivering"
  | "delivered"
  | "served"
  | "completed"
  | "cancelled"
  | "redorequested"
  | "requestcancel"
  | "abandoned"
  | "cooking";

interface StatusConfig {
  label: string;
  icon: React.ReactNode;
  colorClass: string;
}

const statusConfigs: Record<string, StatusConfig> = {
  // Pending states
  pending: {
    label: "Đang chờ xác nhận",
    icon: <Clock className="w-3.5 h-3.5" />,
    colorClass: "bg-amber-100 text-amber-700 border-amber-300",
  },

  // Preparing/Cooking states
  preparing: {
    label: "Đang chuẩn bị món",
    icon: <Utensils className="w-3.5 h-3.5" />,
    colorClass: "bg-orange-100 text-orange-700 border-orange-300",
  },
  cooking: {
    label: "Đang nấu",
    icon: <Utensils className="w-3.5 h-3.5" />,
    colorClass: "bg-orange-100 text-orange-700 border-orange-300",
  },

  // Ready states
  ready: {
    label: "Sẵn sàng phục vụ",
    icon: <PackageCheck className="w-3.5 h-3.5" />,
    colorClass: "bg-emerald-100 text-emerald-700 border-emerald-300",
  },

  // Delivering/Delivered states
  delivering: {
    label: "Đang giao món",
    icon: <Truck className="w-3.5 h-3.5" />,
    colorClass: "bg-cyan-100 text-cyan-700 border-cyan-300",
  },
  delivered: {
    label: "Đã giao",
    icon: <ChefHat className="w-3.5 h-3.5" />,
    colorClass: "bg-blue-100 text-blue-700 border-blue-300",
  },

  // Served/Completed states
  served: {
    label: "Đã phục vụ",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    colorClass: "bg-green-100 text-green-700 border-green-300",
  },
  completed: {
    label: "Đã hoàn thành",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    colorClass: "bg-blue-100 text-blue-700 border-blue-300",
  },

  // Cancelled/Error states
  cancelled: {
    label: "Đã hủy",
    icon: <XCircle className="w-3.5 h-3.5" />,
    colorClass: "bg-red-100 text-red-700 border-red-300",
  },
  requestcancel: {
    label: "Yêu cầu hủy món",
    icon: <XCircle className="w-3.5 h-3.5" />,
    colorClass: "bg-violet-100 text-violet-700 border-violet-300",
  },

  // Special states
  redorequested: {
    label: "Yêu cầu đổi món",
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    colorClass: "bg-purple-100 text-purple-700 border-purple-300",
  },
  abandoned: {
    label: "Khách rời đi",
    icon: <LogOut className="w-3.5 h-3.5" />,
    colorClass: "bg-gray-100 text-gray-700 border-gray-300",
  },

  // Payment states
  paid: {
    label: "Đã thanh toán",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    colorClass: "bg-green-100 text-green-700 border-green-300",
  },
  unpaid: {
    label: "Chưa thanh toán",
    icon: <Hourglass className="w-3.5 h-3.5" />,
    colorClass: "bg-amber-100 text-amber-700 border-amber-300",
  },
};

/**
 * Get status configuration by status string
 */
export const getStatusConfig = (status: string): StatusConfig => {
  const normalizedStatus = status.toLowerCase().trim();
  return (
    statusConfigs[normalizedStatus] || {
      label: status || "Không rõ",
      icon: <Package className="w-3.5 h-3.5" />,
      colorClass: "bg-gray-100 text-gray-700 border-gray-300",
    }
  );
};

/**
 * Get status badge component
 */
export const getStatusBadge = (
  status: string,
  size: "sm" | "md" | "lg" = "md"
): React.ReactNode => {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium border ${config.colorClass} ${sizeClasses[size]}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

/**
 * Get just the icon for a status
 */
export const getStatusIcon = (status: string): React.ReactNode => {
  const config = getStatusConfig(status);
  return config.icon;
};

/**
 * Get just the label for a status
 */
export const getStatusLabel = (status: string): string => {
  const config = getStatusConfig(status);
  return config.label;
};

/**
 * Get just the color class for a status
 */
export const getStatusColorClass = (status: string): string => {
  const config = getStatusConfig(status);
  return config.colorClass;
};

/**
 * Payment status helpers
 */
export const getPaymentStatusBadge = (
  paymentStatus: string,
  size: "sm" | "md" | "lg" = "md"
): React.ReactNode => {
  const isPaid = paymentStatus.toLowerCase() === "paid";
  return getStatusBadge(isPaid ? "paid" : "unpaid", size);
};

export const getPaymentStatusLabel = (paymentStatus: string): string => {
  const isPaid = paymentStatus.toLowerCase() === "paid";
  return isPaid ? "Đã thanh toán" : "Chưa thanh toán";
};
