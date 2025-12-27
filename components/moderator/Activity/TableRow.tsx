import React from "react";
import { Clock } from "lucide-react";

import { ActivityTypeBadge } from "./ActivityTypeBadge";
import { ActivityDetails } from "./ActivityDetails";

/* ================= TYPES ================= */

type ActivityLog = {
  type: string;
  activityCode: string;
  createdTime: string;
  data: {
    orderCode?: string;
    [key: string]: any;
  };
};

type TableRowProps = {
  activity: ActivityLog;
};

type ActivityStatusConfig = {
  label: string;
  className: string;
};

/* ================= COMPONENT ================= */

export const TableRow: React.FC<TableRowProps> = ({ activity }) => {
  const getActivityStatus = (type: string): ActivityStatusConfig => {
    const statusMap: Record<string, ActivityStatusConfig> = {
      CheckIn: {
        label: "Đã check-in",
        className: "bg-green-100 text-green-700",
      },
      CreateOrder: {
        label: "Đã tạo",
        className: "bg-blue-100 text-blue-700",
      },
      UpdateOrderItemStatus: {
        label: "Đã cập nhật",
        className: "bg-amber-100 text-amber-700",
      },
    };

    return (
      statusMap[type] || {
        label: "Hoàn thành",
        className: "bg-gray-100 text-gray-700",
      }
    );
  };

  const status = getActivityStatus(activity.type);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* 🔹 Loại hoạt động */}
      <td className="px-6 py-4 whitespace-nowrap align-top">
        <div>
          <ActivityTypeBadge type={activity.type} />

          {activity.data?.orderCode && (
            <div className="text-xs text-gray-500 mt-1 ml-11">
              {activity.data.orderCode}
            </div>
          )}
        </div>
      </td>

      {/* 🔹 Mã hoạt động */}
      <td className="px-6 py-4 whitespace-nowrap align-top">
        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {activity.activityCode}
        </span>
      </td>

      {/* 🔹 Chi tiết */}
      <td className="px-6 py-4 align-top">
        <ActivityDetails activity={activity} />
      </td>

      {/* 🔹 Thời gian */}
      <td className="px-6 py-4 whitespace-nowrap align-top">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {activity.createdTime}
        </div>
      </td>

      {/* 🔹 Trạng thái */}
      <td className="px-6 py-4 whitespace-nowrap align-top">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </td>
    </tr>
  );
};

export default TableRow;
