import React from "react";

/* ================= TYPES ================= */

type StatusBadgeProps = {
  status: number | string;
};

type StatusConfig = {
  label: string;
  className: string;
};

/* ================= COMPONENT ================= */

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusMap: Record<number, StatusConfig> = {
    1: { label: "Chờ xử lý", className: "bg-gray-100 text-gray-700" },
    2: { label: "Đang chuẩn bị", className: "bg-blue-100 text-blue-700" },
    3: { label: "Hoàn thành", className: "bg-green-100 text-green-700" },
    4: { label: "Đã giao", className: "bg-purple-100 text-purple-700" },
  };

  const key = Number(status);
  const config: StatusConfig = statusMap[key] ?? {
    label: `Trạng thái ${status}`,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
