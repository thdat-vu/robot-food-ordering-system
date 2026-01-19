import React, { useState } from "react";
import { Table } from "@/api/admin/adminApi";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MdDelete, MdTableRestaurant, MdEdit } from "react-icons/md";
import { FiCheckCircle, FiXCircle, FiUsers } from "react-icons/fi";

type Props = {
  table: Table;
  handle: (id: string) => void;
  onEdit?: (id: string) => void;
};

export const TableCard: React.FC<Props> = ({ table, handle, onEdit }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Safety check
  if (!table) {
    return null;
  }

  // Debug logging
  console.log("TableCard props:", { table, status: table?.status });

  const statusConfig = {
    available: {
      color:
        "bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500/20",
      icon: <FiCheckCircle className="w-3.5 h-3.5" />,
      label: "Trống",
      cardBorder: "border-emerald-200",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    occupied: {
      color:
        "bg-orange-500/10 text-orange-700 border-orange-200 hover:bg-orange-500/20",
      icon: <FiUsers className="w-3.5 h-3.5" />,
      label: "Đang phục vụ",
      cardBorder: "border-orange-200",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    disabled: {
      color:
        "bg-gray-500/10 text-gray-700 border-gray-200 hover:bg-gray-500/20",
      icon: <FiXCircle className="w-3.5 h-3.5" />,
      label: "Ngưng hoạt động",
      cardBorder: "border-gray-200",
      iconBg: "bg-gray-50",
      iconColor: "text-gray-600",
    },
  } as const;

  // Safely get status with fallback
  const normalizedStatus = table.status?.toLowerCase() || "available";
  const status = (
    statusConfig[normalizedStatus as keyof typeof statusConfig]
      ? normalizedStatus
      : "available"
  ) as keyof typeof statusConfig;
  const config = statusConfig[status];

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
        config.cardBorder
      } ${isHovered ? "scale-[1.02]" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-5">
        {/* Header with icon and status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                config.iconBg
              } transition-transform duration-300 ${
                isHovered ? "scale-110" : ""
              }`}
            >
              <MdTableRestaurant className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight">
                {table.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <Badge
            variant="outline"
            className={`${config.color} flex items-center gap-1.5 w-fit px-3 py-1 font-medium transition-colors`}
          >
            {config.icon}
            <span className="text-xs">{config.label}</span>
          </Badge>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(table.id);
              }}
            >
              <MdEdit className="w-4 h-4" />
              <span className="text-xs font-medium">Sửa</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handle(table.id);
            }}
          >
            <MdDelete className="w-4 h-4" />
            <span className="text-xs font-medium">Xóa</span>
          </Button>
        </div>

        {/* Hover effect indicator */}
        <div
          className={`absolute inset-0 rounded-lg bg-gradient-to-br from-white/0 to-gray-50/50 pointer-events-none transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
      </CardContent>
    </Card>
  );
};
