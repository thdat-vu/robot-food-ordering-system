import React, { useState } from "react";
import {
  MessageSquare,
  ChevronDown,
  Sparkles
} from "lucide-react";

// Props interface for ReasonCard
export interface ReasonCardProps {
  reason: string;
  onReasonChange: (reason: string) => void;
  reasonSuggestions?: string[];
  placeholder?: string;
  title?: string;
  subtitle?: string;
  maxLength?: number;
  rows?: number;
  showCharacterCount?: boolean;
  className?: string;
}

const ReasonCard: React.FC<ReasonCardProps> = ({
  reason,
  onReasonChange,
  reasonSuggestions = [
    "Khách hàng đã rời đi",
    "Hoàn tất thanh toán và dọn dẹp bàn",
    "Khách hàng yêu cầu đổi bàn",
    "Bàn cần bảo trì/sửa chữa",
    "Đặt bàn trước cho khách VIP",
    "Sự kiện đặc biệt",
    "Dọn dẹp định kỳ",
    "Khách hàng hủy đặt bàn",
    "Chuyển khách sang khu vực khác",
    "Cập nhật theo yêu cầu quản lý"
  ],
  placeholder = "Hoặc nhập lý do tùy chỉnh của bạn...",
  title = "Lý Do Thay Đổi Trạng Thái",
  subtitle = "Vui lòng nhập lý do thay đổi trạng thái bàn (tùy chọn)",
  maxLength = 500,
  rows = 4,
  showCharacterCount = false,
  className = ""
}) => {
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

 
    const handleSuggestionClick = (suggestion: string) => {
      const trimmed = reason.trim();
      if (trimmed) {
        // Nếu reason đã có nội dung thì nối thêm bằng dấu "; "
        onReasonChange(`${trimmed}; ${suggestion}`);
      } else {
        onReasonChange(suggestion);
      }
      setShowSuggestions(false);
    };
  

  return (
    <div className={`bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50 shadow-xl relative overflow-hidden ${className}`}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full -translate-y-12 translate-x-12"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-yellow-400/10 to-amber-400/10 rounded-full translate-y-10 -translate-x-10"></div>
      
      <div className="relative">
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h4>
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Quick Reason Suggestions Above Input */}
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <Sparkles className="w-4 h-4 text-amber-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Gợi ý nhanh:</span>
          </div>
          
          {/* Always show first 6 suggestions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {reasonSuggestions.slice(0, 6).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-2 bg-white/80 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 border border-amber-200/60 rounded-xl text-xs sm:text-sm text-gray-700 hover:text-amber-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 font-medium backdrop-blur-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Additional suggestions - shown/hidden with animation */}
          {reasonSuggestions.length > 6 && (
            <div className="space-y-3">
              {/* Animated additional suggestions */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showSuggestions 
                    ? 'max-h-96 opacity-100' 
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="flex flex-wrap gap-2 pb-2">
                  {reasonSuggestions.slice(6).map((suggestion, index) => (
                    <button
                      key={index + 6}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/60 rounded-xl text-xs sm:text-sm text-gray-700 hover:text-indigo-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 font-medium backdrop-blur-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle button */}
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`px-4 py-2 bg-gradient-to-r border rounded-xl text-sm transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 font-medium flex items-center ${
                  showSuggestions
                    ? 'from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 border-red-200/60 text-red-700 hover:text-red-800'
                    : 'from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-blue-200/60 text-blue-700 hover:text-blue-800'
                }`}
              >
                <ChevronDown className={`w-4 h-4 mr-1 transition-transform duration-300 ${showSuggestions ? 'rotate-180' : ''}`} />
                {showSuggestions 
                  ? 'Ẩn gợi ý khác' 
                  : `Xem thêm ${reasonSuggestions.length - 6} gợi ý khác`
                }
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className="w-full px-6 py-4 border border-amber-300/50 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm sm:text-base bg-white/70 backdrop-blur-sm shadow-lg placeholder-gray-500 transition-all duration-300"
          />
        </div>

        {/* Character Count */}
        {showCharacterCount && (
          <div className="flex justify-between items-center mt-3 text-xs text-gray-600">
            <div>
              {reason.trim() ? (
                <span className="text-emerald-600 font-medium">
                  ✓ Đã nhập lý do
                </span>
              ) : (
                <span className="text-gray-500">
                  Chưa nhập lý do
                </span>
              )}
            </div>
            <div className={`${
              reason.length > maxLength * 0.9 
                ? 'text-red-600 font-semibold' 
                : reason.length > maxLength * 0.7
                  ? 'text-amber-600 font-medium'
                  : 'text-gray-500'
            }`}>
              {reason.length}/{maxLength}
            </div>
          </div>
        )}

        {/* Current Reason Display */}
        {reason.trim() && (
          <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-amber-200/50">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mt-0.5 shadow-lg flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-gray-800 mb-1">
                  Lý do được chọn:
                </h5>
                <p className="text-sm text-gray-700 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-xl px-3 py-2 border border-gray-200/50">
                  "{reason}"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReasonCard;