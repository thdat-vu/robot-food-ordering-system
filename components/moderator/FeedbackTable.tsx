import {
  FeedbackTableProps,
  GroupedFeedbackRow,
} from "@/entites/moderator/FeedbackModole";
import { AlertCircle, CheckCircle, RefreshCw, Send, Users } from "lucide-react";
import { useMemo } from "react";
import { ResponsePopover } from "./ResponsePopover";

export const FeedbackTable: React.FC<FeedbackTableProps> = ({
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
}) => {
  const groupedRows = useMemo(() => {
    const groups = new Map<string, GroupedFeedbackRow>();

    rows.forEach((row) => {
      const feedbackKey = row.feedBack.trim();
      const statusKey = row.isPending ? "PENDING" : "DONE";
      const key = `${feedbackKey}__${statusKey}`;

      if (!groups.has(key)) {
        groups.set(key, {
          ...row,
          groupCount: 1,
          originalIds: [row.complainId],
          handledByNames: row.handledBy ? [row.handledBy] : [],
        });
        return;
      }

      const existing = groups.get(key)!;
      existing.groupCount += 1;
      existing.originalIds.push(row.complainId);

      if (row.handledBy) {
        existing.handledByNames = existing.handledByNames ?? [];
        if (!existing.handledByNames.includes(row.handledBy)) {
          existing.handledByNames.push(row.handledBy);
        }
      }

      // cập nhật createData theo record mới nhất trong cùng group
      const tExisting = new Date(existing.createData).getTime();
      const tNew = new Date(row.createData).getTime();
      if (tNew >= tExisting) {
        existing.createData = row.createData;
        existing.handledBy = row.handledBy ?? existing.handledBy;
      }
    });

    return Array.from(groups.values()).sort((a, b) => {
      // pending lên trước
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

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              #
            </th>
            <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Trạng thái / Nhóm
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
            <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Thao tác
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
                      disabled={!row.isPending}
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
                  <div className="space-y-2 max-w-md">
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
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      {highlightSearchText(row.feedBack, searchQuery)}
                    </p>
                  </div>
                </td>

                {/* Response */}
                <td className="px-6 py-4 align-top">
                  <div className="space-y-2 max-w-sm">
                    <textarea
                      value={responses[row.complainId] || ""}
                      onChange={(e) =>
                        onResponseChange(row.complainId, e.target.value)
                      }
                      disabled={!row.isPending}
                      placeholder={
                        row.isPending ? "Nhập phản hồi..." : "Đã hoàn tất"
                      }
                      className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[80px] disabled:opacity-50 disabled:bg-gray-50 resize-none shadow-inner placeholder:text-gray-400"
                    />

                    {row.isPending && (
                      <ResponsePopover
                        value={responses[row.complainId] || ""}
                        suggestions={responseSuggestions || []}
                        onChange={(val) =>
                          onSuggestionPick(row.complainId, val)
                        }
                      />
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 align-top text-right">
                  {row.isPending ? (
                    <button
                      onClick={() =>
                        isQuick
                          ? onSendQuickRequest(row.complainId, row.feedBack)
                          : onSingleCheck(row.complainId)
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
