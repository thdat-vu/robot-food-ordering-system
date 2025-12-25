"use client";

import React from "react";
import {
  Clock,
  ChefHat,
  User,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

/* ================= TYPES ================= */

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

/* ================= STATUS UI ================= */

const STATUS_UI: Record<OrderStatusUI, { label: string; badge: string }> = {
  pending: {
    label: "Chờ xử lý",
    badge: "bg-slate-100 text-slate-700 border border-slate-200",
  },
  cooking: {
    label: "Đang nấu",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  serving: {
    label: "Đang phục vụ",
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  completed: {
    label: "Hoàn tất",
    badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  },
};

/* ================= MAIN ================= */

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
  const totalItems =
    totalItemCount ?? kitchenItemCount + waiterItemCount + cancelledItemCount;

  const status = resolveOrderStatusUI({
    kitchenItemCount,
    waiterItemCount,
    totalItemCount: totalItems,
  });

  const statusInfo = STATUS_UI[status];
  const { date, time, minutesAgo } = parseDateTimeWithDiff(lastOrderUpdateTime);

  const delayInfo = getDelayInfo(status, minutesAgo);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            {tableNumber}
          </h2>
          {lastOrderUpdateTime && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Clock className="w-3 h-3" />
              <span>
                Cập nhật {time} · {minutesAgo} phút trước
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badge}`}
          >
            {statusInfo.label}
          </span>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Làm mới dữ liệu"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          )}
        </div>
      </div>

      {/* ===== DELAY ===== */}
      {delayInfo.isDelayed && (
        <div className="mx-5 mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4" />
          <span>
            Trễ {minutesAgo - delayInfo.threshold} phút so với dự kiến
          </span>
        </div>
      )}

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-3 gap-3 px-5 py-5">
        <StatCard
          icon={<ChefHat className="w-5 h-5" />}
          label="Ở bếp"
          value={kitchenItemCount}
          color="amber"
        />

        <StatCard
          icon={<User className="w-5 h-5" />}
          label="Đang phục vụ"
          value={waiterItemCount}
          color="blue"
        />

        <StatCard
          icon={<XCircle className="w-5 h-5" />}
          label="Đã hủy"
          value={cancelledItemCount}
          color="red"
        />
      </div>

      {/* ===== FOOTER ===== */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t text-sm">
        <span className="text-slate-600 font-medium">Tổng số món</span>
        <span className="font-semibold text-slate-800">{totalItems} món</span>
      </div>
    </div>
  );
}

/* ================= SUB ================= */

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "amber" | "blue" | "red";
}) {
  const isZero = value === 0;

  const textMap = {
    amber: "text-amber-600",
    blue: "text-blue-600",
    red: "text-red-600",
  };

  const bgMap = {
    amber: "bg-amber-50",
    blue: "bg-blue-50",
    red: "bg-red-50",
  };

  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div
          className={`text-xl font-semibold ${
            isZero ? "text-slate-400" : textMap[color]
          }`}
        >
          {value}
        </div>
      </div>
      <div
        className={`p-2 rounded-lg ${isZero ? "bg-slate-100" : bgMap[color]}`}
      >
        {icon}
      </div>
    </div>
  );
}

/* ================= LOGIC ================= */

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
  if (!dateTime) return { date: "--", time: "--", minutesAgo: 0 };

  // dd/MM/yyyy HH:mm:ss
  const [datePart, timePart] = dateTime.split(" ");
  const [day, month, year] = datePart.split("/");

  const parsed = new Date(`${year}-${month}-${day}T${timePart}`);
  if (isNaN(parsed.getTime())) return { date: "--", time: "--", minutesAgo: 0 };

  const diffMs = Date.now() - parsed.getTime();
  const minutesAgo = Math.max(0, Math.floor(diffMs / 60000));

  return { date: datePart, time: timePart, minutesAgo };
}

function getDelayInfo(status: OrderStatusUI, minutesAgo: number) {
  const thresholds: Record<OrderStatusUI, number> = {
    pending: 10,
    cooking: 10,
    serving: 5,
    completed: Infinity,
  };

  const threshold = thresholds[status];
  return {
    isDelayed: minutesAgo > threshold,
    threshold,
  };
}
