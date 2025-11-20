// components/moderator/LateDishWarning.tsx
import React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { TableData } from "@/entites/moderator/FeedbackModole";

interface LateDishWarningProps {
  table: TableData;
}

const LateDishWarning: React.FC<LateDishWarningProps> = ({ table }) => {
  const { isWaitingDish, waitingDurationInMinutes, pendingItems = 0 } = table;

  // Nếu không đang chờ món → không hiển thị gì
  if (!isWaitingDish || !waitingDurationInMinutes) return null;

  const minutes = Math.floor(waitingDurationInMinutes);

  // Cảnh báo từ 6 phút trở lên
  const isWarning = minutes >= 6;
  // Cảnh báo nghiêm trọng từ 10 phút trở lên
  const isCritical = minutes >= 10;

  if (!isWarning) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none rounded-3xl overflow-hidden ${
        isCritical
          ? "animate-pulse ring-4 ring-red-500 ring-opacity-70"
          : "animate-[ping_2s_ease-in-out_infinite]"
      }`}
    >
      {/* Viền đỏ nhấp nháy */}
      <div
        className={`absolute inset-0 rounded-3xl border-4 ${
          isCritical
            ? "border-red-500 shadow-2xl shadow-red-500/50"
            : "border-orange-400 shadow-2xl shadow-orange-400/50"
        } animate-[borderGlow_1.5s_ease-in-out_infinite]`}
      />

      {/* Badge cảnh báo góc trên bên phải */}
      <div className="absolute top-3 right-3 z-10">
        <div
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-white shadow-2xl backdrop-blur-md border-2 ${
            isCritical
              ? "bg-red-600 border-red-300 animate-[bounce_1s_infinite]"
              : "bg-orange-500 border-orange-300"
          }`}
        >
          {isCritical ? (
            <AlertTriangle size={16} className="animate-pulse" />
          ) : (
            <Clock size={16} />
          )}
          <span className="text-sm">
            {isCritical ? "CHẬM MÓN" : "SẮP CHẬM"}
          </span>
          <span className="text-xs opacity-90">• {minutes}'</span>
          {pendingItems > 0 && (
            <span className="ml-1 text-xs">({pendingItems} món)</span>
          )}
        </div>
      </div>

      {/* Hiệu ứng nền rung nhẹ khi quá 10 phút */}
      {isCritical && (
        <div className="absolute inset-0 bg-red-500/10 animate-[pulse_1s_ease-in-out_infinite]" />
      )}
    </div>
  );
};

export default LateDishWarning;
