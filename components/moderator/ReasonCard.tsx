import React, { useMemo, useState } from "react";
import { MessageSquare, ChevronDown, Sparkles } from "lucide-react";

export type TableStatusKey = "available" | "occupied" | "reserved" | "unknown";
type TransitionKey = `${TableStatusKey}->${TableStatusKey}`;

const stripDiacritics = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalizeStatusString = (raw: unknown) =>
  stripDiacritics(String(raw ?? ""))
    .trim()
    .toLowerCase();

// ✅ Suggestions luôn theo key nội bộ (available/occupied/reserved)
const SUGGESTIONS: Partial<Record<TransitionKey, string[]>> = {
  "occupied->available": [
    "Khách đã rời đi",
    "Khách thanh toán xong",
    "Moderator hủy bàn do khách rời đi",
    "Hủy phiên/bàn do nhầm bàn hoặc tạo nhầm session",
    "Dọn dẹp xong, bàn sẵn sàng phục vụ",
    "Chuyển khách sang bàn khác",
    "Khách hủy đặt bàn / không đến",
    "Đóng bàn tạm thời rồi mở lại (reset trạng thái)",
    "Hoàn tất ca/đóng ca khu vực",
  ],
  "available->occupied": [
    "Khách vừa vào bàn",
    "Moderator check-in / mở bàn",
    "Nhận khách walk-in",
    "Ghép bàn / chuyển khách từ bàn khác sang",
    "Đặt bàn đến giờ, khách đã tới",
    "Bắt đầu phiên phục vụ mới",
    "Phục vụ theo yêu cầu quản lý",
  ],
};

const FALLBACK_SUGGESTIONS = [
  "Khách hàng đã rời đi",
  "Hoàn tất thanh toán và dọn dẹp bàn",
  "Khách hàng yêu cầu đổi bàn",
  "Bàn cần bảo trì/sửa chữa",
  "Đặt bàn trước cho khách VIP",
  "Sự kiện đặc biệt",
  "Dọn dẹp định kỳ",
  "Khách hàng hủy đặt bàn",
  "Chuyển khách sang khu vực khác",
  "Cập nhật theo yêu cầu quản lý",
];

export interface ReasonCardProps {
  reason: string;
  onReasonChange: (reason: string) => void;

  fromStatus?: number | string | null;
  toStatus?: number | string | null;

  // ✅ NEW: map number theo BE của bạn
  // Ví dụ BE: 0=occupied, 1=available, 2=reserved
  statusNumberMap?: Partial<Record<number, TableStatusKey>>;

  // override suggestions nếu muốn
  reasonSuggestions?: string[];

  placeholder?: string;
  title?: string;
  subtitle?: string;
  maxLength?: number;
  rows?: number;
  showCharacterCount?: boolean;
  className?: string;
  required?: boolean;
}

const ReasonCard: React.FC<ReasonCardProps> = ({
  reason,
  onReasonChange,
  fromStatus = "unknown",
  toStatus = "unknown",
  statusNumberMap,
  reasonSuggestions,
  placeholder = "Hoặc nhập lý do tùy chỉnh của bạn...",
  title = "Lý Do Thay Đổi Trạng Thái",
  subtitle = "Vui lòng nhập lý do thay đổi trạng thái bàn (bắt buộc)",
  maxLength = 500,
  rows = 4,
  showCharacterCount = false,
  className = "",
  required = false,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [touched, setTouched] = useState(false);

  // ✅ Default mapping (nếu BE bạn khác, truyền statusNumberMap để override)
  const numberMap = useMemo<Partial<Record<number, TableStatusKey>>>(() => {
    return statusNumberMap ?? { 0: "available", 1: "occupied", 2: "reserved" };
  }, [statusNumberMap]);

  const resolveStatusKey = (
    raw: number | string | null | undefined
  ): TableStatusKey => {
    if (typeof raw === "number") return numberMap[raw] ?? "unknown";

    const s = normalizeStatusString(raw);

    // available (trống)
    if (
      s === "available" ||
      s.includes("available") ||
      s.includes("empty") ||
      s === "trong" ||
      s.includes("trong")
    )
      return "available";

    // occupied (có khách)
    if (
      s === "occupied" ||
      s.includes("occupied") ||
      s.includes("busy") ||
      s.includes("using") ||
      s.includes("co khach") ||
      s.includes("cokhach")
    )
      return "occupied";

    // reserved (đặt trước)
    if (
      s === "reserved" ||
      s.includes("reserved") ||
      s.includes("book") ||
      s.includes("dat") ||
      s.includes("reserve")
    )
      return "reserved";

    return "unknown";
  };

  const resolved = useMemo(() => {
    if (reasonSuggestions && reasonSuggestions.length > 0) {
      return {
        fromKey: "unknown" as TableStatusKey,
        toKey: "unknown" as TableStatusKey,
        key: "unknown->unknown" as TransitionKey,
        suggestions: reasonSuggestions,
      };
    }

    const fromKey = resolveStatusKey(fromStatus);
    const toKey = resolveStatusKey(toStatus);
    const key = `${fromKey}->${toKey}` as TransitionKey;

    return {
      fromKey,
      toKey,
      key,
      suggestions: SUGGESTIONS[key] ?? FALLBACK_SUGGESTIONS,
    };
  }, [reasonSuggestions, fromStatus, toStatus, numberMap]);

  // ✅ Debug 1 phát là biết ngay có bị swap/mapping ngược
  // console.log({ fromRaw: fromStatus, toRaw: toStatus, fromKey: resolved.fromKey, toKey: resolved.toKey, transitionKey: resolved.key });

  const handleSuggestionClick = (suggestion: string) => {
    onReasonChange(suggestion);
    setTouched(true);
    setShowSuggestions(false);
  };

  const handleChange = (value: string) => {
    onReasonChange(value);
    if (!touched) setTouched(true);
  };

  const isEmpty = reason.trim().length === 0;
  const showError = required && touched && isEmpty;

  return (
    <div
      className={`bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50 shadow-xl relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full -translate-y-12 translate-x-12" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-yellow-400/10 to-amber-400/10 rounded-full translate-y-10 -translate-x-10" />

      <div className="relative">
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
            <p
              className={`text-sm ${
                required ? "text-red-600 font-medium" : "text-gray-600"
              }`}
            >
              {subtitle}
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <Sparkles className="w-4 h-4 text-amber-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Gợi ý nhanh:
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {resolved.suggestions.slice(0, 6).map((suggestion, index) => (
              <button
                key={`${suggestion}-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-2 bg-white/80 hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 border border-amber-200/60 rounded-xl text-xs sm:text-sm text-gray-700 hover:text-amber-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 font-medium backdrop-blur-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {resolved.suggestions.length > 6 && (
            <div className="space-y-3">
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  showSuggestions ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-wrap gap-2 pb-2">
                  {resolved.suggestions.slice(6).map((suggestion, index) => (
                    <button
                      key={`${suggestion}-${index + 6}`}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200/60 rounded-xl text-xs sm:text-sm text-gray-700 hover:text-indigo-800 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 font-medium backdrop-blur-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`px-4 py-2 bg-gradient-to-r border rounded-xl text-sm transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 font-medium flex items-center ${
                  showSuggestions
                    ? "from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 border-red-200/60 text-red-700 hover:text-red-800"
                    : "from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-blue-200/60 text-blue-700 hover:text-blue-800"
                }`}
              >
                <ChevronDown
                  className={`w-4 h-4 mr-1 transition-transform duration-300 ${
                    showSuggestions ? "rotate-180" : ""
                  }`}
                />
                {showSuggestions
                  ? "Ẩn gợi ý khác"
                  : `Xem thêm ${resolved.suggestions.length - 6} gợi ý khác`}
              </button>
            </div>
          )}
        </div>

        <textarea
          value={reason}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={`w-full px-6 py-4 border rounded-2xl resize-none text-sm sm:text-base bg-white/70 backdrop-blur-sm shadow-lg placeholder-gray-500 transition-all duration-300 ${
            showError
              ? "border-red-400 focus:ring-red-500"
              : "border-amber-300/50 focus:ring-amber-500 focus:border-transparent"
          }`}
        />

        {!showCharacterCount && showError && (
          <div className="mt-2 text-sm text-red-600 font-semibold">
            Vui lòng nhập lý do trước khi xác nhận.
          </div>
        )}

        {showCharacterCount && (
          <div className="flex justify-between items-center mt-3 text-xs">
            <div>
              {showError ? (
                <span className="text-red-600 font-semibold">
                  Vui lòng nhập lý do trước khi xác nhận.
                </span>
              ) : reason.trim() ? (
                <span className="text-emerald-600 font-medium">
                  ✓ Đã nhập lý do
                </span>
              ) : (
                <span className="text-gray-500">Chưa nhập lý do</span>
              )}
            </div>
            <div
              className={`${
                reason.length > maxLength * 0.9
                  ? "text-red-600 font-semibold"
                  : reason.length > maxLength * 0.7
                  ? "text-amber-600 font-medium"
                  : "text-gray-500"
              }`}
            >
              {reason.length}/{maxLength}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReasonCard;
