import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Clock, Zap } from "lucide-react";

interface LastUpdateBadgeProps {
  lastUpdateTime?: string | null;
}
export const LastUpdateBadge: React.FC<LastUpdateBadgeProps> = ({
  lastUpdateTime,
}) => {
  if (!lastUpdateTime) return null;

  // Parse thời gian (hỗ trợ cả định dạng VN và ISO)
  let date: Date | null = null;
  try {
    if (lastUpdateTime.includes("T") || lastUpdateTime.includes("-")) {
      date = new Date(lastUpdateTime);
    } else {
      // Format: "20/11/2025 16:28:45"
      const [datePart, timePart] = lastUpdateTime.split(" ");
      if (datePart && timePart) {
        const [day, month, year] = datePart.split("/").map(Number);
        const [hour, minute, second] = timePart.split(":").map(Number);
        date = new Date(year, month - 1, day, hour, minute, second);
      }
    }
  } catch (e) {
    return null;
  }

  if (!date || isNaN(date.getTime())) return null;

  const minutesAgo = (Date.now() - date.getTime()) / 1000 / 60;

  // Chỉ hiện trong 15 phút gần nhất
  if (minutesAgo > 15) return null;

  const isVeryRecent = minutesAgo < 2;

  return (
    <div className="mt-2 flex items-center justify-center gap-2">
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg transition-all duration-500 ${
          isVeryRecent
            ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300 shadow-yellow-400/50 animate-pulse"
            : "bg-white/90 text-gray-700 border-gray-300"
        }`}
      >
        {isVeryRecent ? (
          <Zap size={14} className="animate-pulse" />
        ) : (
          <Clock size={13} />
        )}

        <span>
          {isVeryRecent
            ? "Vừa cập nhật!"
            : `${Math.round(minutesAgo)} phút trước`}
        </span>

        {/* Hiển thị giờ chính xác khi hover (tooltip nhỏ) */}
        <div className="relative group">
          <span className="ml-1 opacity-70">
            {date.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Cập nhật lúc: {date.toLocaleTimeString("vi-VN")}
          </div>
        </div>
      </div>

      {/* Hiệu ứng chấm sáng nhỏ khi vừa cập nhật */}
      {isVeryRecent && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full animate-ping delay-300"></div>
        </>
      )}
    </div>
  );
};
export default LastUpdateBadge;
