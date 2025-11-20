// LegendFloating.tsx
import React from "react";

interface LegendFloatingProps {
  isFloating: boolean;
}

export const LegendFloating: React.FC<LegendFloatingProps> = ({
  isFloating,
}) => {
  const containerClass = isFloating
    ? // ✅ Mode lăn xuống: dính bên trái, giữa màn hình
      "hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 transform z-40"
    : // ✅ Mode mặc định: nằm trên, ngay dưới chữ BẢNG QUẢN LÝ MODERATOR
      "absolute left-0 top-12 z-10";

  return (
    <div className={containerClass}>
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 space-y-2 text-sm border border-white/50">
        <h3 className="font-bold text-gray-800 mb-3 text-base">
          📋 Chú thích màu sắc
        </h3>

        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-white to-gray-100 border-2 border-gray-300" />
          <span className="text-gray-700 font-medium">Bàn trống</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-700 animate-pulse" />
          <span className="text-gray-700 font-medium">
            Có khách - chưa gọi món
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 animate-pulse" />
          <span className="text-gray-700 font-medium">
            Đã order - Đang xử lý
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse" />
          <span className="text-gray-700 font-medium">
            Đã phục vụ - Chờ giao
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-500" />
          <span className="text-gray-700 font-medium">
            Đã giao - Chờ thanh toán
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-500" />
          <span className="text-gray-700 font-medium">Đã thanh toán hết</span>
        </div>
      </div>
    </div>
  );
};
