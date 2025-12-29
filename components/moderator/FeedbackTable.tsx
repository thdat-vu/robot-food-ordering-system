import { GroupedFeedbackRow } from "@/entites/moderator/FeedbackModole";
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Send,
  Users,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

interface FeedbackTableProps {
  rows: GroupedFeedbackRow[];
  searchQuery: string;
  selectedIds: string[];
  selectablePendingIds: string[];
  isChecking: boolean;
  responses: Record<string, string>;
  responseSuggestions?: string[];
  showSuggestions: Record<string, boolean>;
  isQuickRequest: (row: GroupedFeedbackRow) => boolean;
  hasSentQuickRequest: (row: GroupedFeedbackRow) => boolean;
  formatDate: (date: string) => string;
  getRelativeTime: (date: string) => string;
  highlightSearchText: (text: string, query: string) => React.ReactNode;
  onToggleSelect: (id: string, isPending: boolean) => void;
  onResponseChange: (key: string, value: string) => void;
  onSuggestionPick: (key: string, value: string) => void;
  onSingleCheck: (id: string, response: string) => void;
  onSelectAll: () => void;
  onToggleSuggestions: (id: string) => void;
  onSendQuickRequest: (id: string, feedback: string) => void;
  onClearSelection?: () => void;
}

const ResponsePopover = ({
  value,
  suggestions,
  onChange,
}: {
  value: string;
  suggestions: string[];
  onChange: (val: string) => void;
}) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.slice(0, 3).map((s, i) => (
        <button
          key={i}
          onClick={() => onChange(s)}
          className="px-2 py-1 text-[10px] rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors"
        >
          {s.slice(0, 20)}...
        </button>
      ))}
    </div>
  );
};

export default function FeedbackTable({
  rows,
  searchQuery,
  selectedIds,
  isChecking,
  responses,
  responseSuggestions,
  isQuickRequest,
  hasSentQuickRequest,
  formatDate,
  getRelativeTime,
  highlightSearchText,
  onToggleSelect,
  onResponseChange,
  onSuggestionPick,
  onSingleCheck,
  onSendQuickRequest,
  onClearSelection,
}: FeedbackTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleExpand = (complainId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(complainId)) {
        next.delete(complainId);
      } else {
        next.add(complainId);
      }
      return next;
    });
  };

  const groupedRows = useMemo(() => {
    const groups = new Map<string, GroupedFeedbackRow>();

    rows.forEach((row) => {
      const feedbackKey = row.feedBack.trim();
      const statusKey = row.isPending ? "PENDING" : "DONE";
      const groupKey = `${feedbackKey}__${statusKey}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          ...row,
          groupCount: 1,
          originalIds: [row.complainId],
          handledByNames: row.handledBy ? [row.handledBy] : [],
          groupKey,
        });
        return;
      }

      const existing = groups.get(groupKey)!;
      existing.groupCount += 1;
      existing.originalIds.push(row.complainId);

      if (row.handledBy) {
        existing.handledByNames = existing.handledByNames ?? [];
        if (!existing.handledByNames.includes(row.handledBy)) {
          existing.handledByNames.push(row.handledBy);
        }
      }

      const tExisting = new Date(existing.createData).getTime();
      const tNew = new Date(row.createData).getTime();
      if (tNew >= tExisting) {
        existing.createData = row.createData;
        existing.handledBy = row.handledBy ?? existing.handledBy;
      }
    });

    return Array.from(groups.values()).sort((a, b) => {
      if (a.isPending !== b.isPending) return a.isPending ? -1 : 1;
      return (
        new Date(b.createData).getTime() - new Date(a.createData).getTime()
      );
    });
  }, [rows]);

  const renderHandledByCell = (row: GroupedFeedbackRow) => {
    if (row.isPending) {
      return <span className="text-xs text-gray-400 font-medium">—</span>;
    }

    const names = row.handledByNames ?? [];
    if (names.length > 1) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {names.slice(0, 2).map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 text-[10px] font-semibold text-indigo-700"
            >
              <Users size={10} />
              {name}
            </span>
          ))}
          {names.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
              +{names.length - 2}
            </span>
          )}
        </div>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 text-[10px] font-semibold text-indigo-700">
        <Users size={10} />
        {row.handledBy || names[0] || "—"}
      </span>
    );
  };

  const getResponseTextFromTextarea = (row: GroupedFeedbackRow) => {
    return responses[row.groupKey]?.trim() || "";
  };

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide w-16">
              <div className="flex items-center gap-2">
                #
                {selectedIds.length > 0 && onClearSelection && (
                  <button
                    onClick={onClearSelection}
                    className="p-1 hover:bg-red-100 rounded-full transition-colors group"
                    title="Bỏ chọn tất cả"
                  >
                    <X className="w-3.5 h-3.5 text-red-500 group-hover:text-red-700" />
                  </button>
                )}
              </div>
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Trạng thái
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Xử lý bởi
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Nội dung yêu cầu
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Phản hồi khách
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {groupedRows.map((row, idx) => {
            const isQuick = isQuickRequest(row);
            const alreadySentQuick = hasSentQuickRequest(row);
            const shouldShowUrgentBadge =
              row.isPending && isQuick && !alreadySentQuick;
            const isSelected = selectedIds.includes(row.complainId);
            const responseText = row.isPending
              ? responses[row.groupKey] || ""
              : row.resolutionNote || "";
            const isExpanded = expandedRows.has(row.complainId);

            return (
              <tr
                key={row.complainId}
                className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-transparent transition-all duration-200"
              >
                {/* # + checkbox */}
                <td className="px-6 py-4 align-top">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        onToggleSelect(row.complainId, row.isPending)
                      }
                      disabled={!row.isPending || isQuick}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:opacity-20 transition-all cursor-pointer"
                    />
                    <span className="text-xs font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                      {idx + 1}
                    </span>
                  </div>
                </td>

                {/* Status / Group / time */}
                <td className="px-6 py-4 align-top">
                  <div className="flex flex-col gap-2">
                    {row.isPending ? (
                      <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-amber-700">
                          Chờ xử lý
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50">
                        <CheckCircle size={10} className="text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-700">
                          Đã xong
                        </span>
                      </span>
                    )}

                    {row.groupCount > 1 && (
                      <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
                        <Users size={10} className="text-blue-600" />
                        <span className="text-[10px] font-bold text-blue-700">
                          {row.groupCount} yêu cầu
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col gap-0.5 mt-1">
                      <span className="text-[11px] font-semibold text-gray-700">
                        {formatDate(row.createData)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {getRelativeTime(row.createData)}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Handled by */}
                <td className="px-6 py-4 align-top">
                  {renderHandledByCell(row)}
                </td>

                {/* Content */}
                <td className="px-6 py-4 align-top">
                  <div className="space-y-2">
                    {shouldShowUrgentBadge && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                        <span className="text-[10px] font-bold text-orange-700">
                          Cần gấp
                        </span>
                        <span className="text-[10px] font-semibold text-red-600 ml-1">
                          Phục vụ nhanh
                        </span>
                      </div>
                    )}
                    {row.isPending && alreadySentQuick && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
                        <Send size={10} className="text-blue-600" />
                        <span className="text-[10px] font-bold text-blue-700">
                          Đã chuyển
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-700 font-medium">
                      {highlightSearchText(row.feedBack, searchQuery)}
                    </p>
                  </div>
                </td>

                {/* Response + Actions Combined */}
                <td className="px-6 py-4 align-top">
                  <div className="space-y-3">
                    {/* Response Section */}
                    <div className="space-y-2">
                      {!isExpanded ? (
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex-1 px-3 py-2 text-xs rounded-lg truncate ${
                              row.isPending
                                ? "bg-white border border-gray-200"
                                : "bg-gray-50 border border-gray-200 text-gray-500"
                            }`}
                          >
                            {responseText ||
                              (row.isPending
                                ? "Chưa có phản hồi"
                                : "Đã phản hồi")}
                          </div>
                          <button
                            onClick={() => toggleExpand(row.complainId)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="flex items-start gap-2">
                            <div className="relative flex-1">
                              <textarea
                                value={responseText}
                                onChange={(e) =>
                                  onResponseChange(row.groupKey, e.target.value)
                                }
                                disabled={!row.isPending}
                                placeholder={
                                  row.isPending
                                    ? "Nhập phản hồi cho khách hàng..."
                                    : "Đã phản hồi"
                                }
                                className={`w-full p-3.5 text-xs leading-relaxed border rounded-2xl transition-all min-h-[90px] resize-none ${
                                  row.isPending
                                    ? "bg-white border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-blue-50/30 shadow-sm hover:border-gray-300 placeholder:text-gray-400"
                                    : "bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                              />
                              {!row.isPending && responses[row.groupKey] && (
                                <div className="absolute top-2.5 right-2.5">
                                  <CheckCircle
                                    size={14}
                                    className="text-emerald-500"
                                  />
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => toggleExpand(row.complainId)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>

                          {row.isPending && (
                            <ResponsePopover
                              value={responses[row.groupKey] || ""}
                              suggestions={responseSuggestions || []}
                              onChange={(val) =>
                                onSuggestionPick(row.groupKey, val)
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {row.isPending ? (
                      <button
                        onClick={() =>
                          isQuick
                            ? onSendQuickRequest(row.complainId, row.feedBack)
                            : onSingleCheck(
                                row.complainId,
                                getResponseTextFromTextarea(row)
                              )
                        }
                        disabled={isChecking || alreadySentQuick}
                        className={`w-full py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-[11px] transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                          isQuick
                            ? alreadySentQuick
                              ? "bg-gray-100 text-gray-400 border-2 border-gray-200 shadow-none"
                              : "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-200 hover:shadow-xl hover:from-blue-700 hover:to-blue-800"
                            : "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-emerald-200 hover:shadow-xl hover:from-emerald-700 hover:to-emerald-800"
                        }`}
                      >
                        {isChecking ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        <span className="whitespace-nowrap">
                          {isQuick
                            ? alreadySentQuick
                              ? "Đã gửi"
                              : "Gửi ngay"
                            : "Xác nhận"}
                        </span>
                      </button>
                    ) : (
                      <div className="py-2.5 px-4 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 bg-gray-50/50">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">
                          Xong
                        </span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
