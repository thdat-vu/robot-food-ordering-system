import React, { useMemo } from "react";
import {
  FeedbackTableProps,
  GroupedFeedbackRow,
} from "@/entites/moderator/FeedbackModole";
import {
  AlertCircle,
  CheckCircle,
  MessageSquare,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";
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
      const key = row.feedBack.trim();

      if (!groups.has(key)) {
        groups.set(key, {
          ...row,
          groupCount: 1,
          originalIds: [row.complainId],
          handledByNames: row.handledBy ? [row.handledBy] : [],
        });
      } else {
        const existing = groups.get(key)!;
        console.log("🔍 Merging feedback:", existing, row);
        existing.groupCount += 1;
        existing.originalIds.push(row.complainId);

        // nếu 1 cái trong group pending => group pending
        if (row.isPending) existing.isPending = true;

        // ✅ gom handledBy unique
        if (row.handledBy) {
          existing.handledByNames = existing.handledByNames ?? [];
          if (!existing.handledByNames.includes(row.handledBy)) {
            existing.handledByNames.push(row.handledBy);
          }
          // optional: hiển thị người xử lý “mới nhất” (nếu row đang là bản ghi mới hơn)
          const tExisting = new Date(existing.createData).getTime();
          const tNew = new Date(row.createData).getTime();
          if (tNew >= tExisting) {
            existing.createData = row.createData;
            existing.handledBy = row.handledBy;
          }
        } else {
          // vẫn cập nhật thời gian nếu record mới hơn (dù handledBy null)
          const tExisting = new Date(existing.createData).getTime();
          const tNew = new Date(row.createData).getTime();
          if (tNew >= tExisting) existing.createData = row.createData;
        }
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
      return (
        <span className="text-[11px] text-gray-400 font-semibold whitespace-nowrap">
          —
        </span>
      );
    }

    const names = row.handledByNames ?? [];
    if (names.length > 1) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {names.slice(0, 2).map((name) => (
            <span
              key={name}
              title={name}
              className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-bold whitespace-nowrap"
            >
              {name}
            </span>
          ))}
          {names.length > 2 && (
            <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-bold whitespace-nowrap">
              +{names.length - 2}
            </span>
          )}
        </div>
      );
    }

    return (
      <span className="text-[11px] text-gray-700 font-semibold whitespace-nowrap">
        {row.handledBy || names[0] || "—"}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl overflow-hidden">
      <table className="w-full border-separate border-spacing-0">
        <thead className="bg-gray-50/50">
          <tr className="text-[12px] font-semibold text-gray-600 uppercase tracking-wide">
            <th className="px-4 py-4 text-center" style={{ width: "50px" }}>
              #
            </th>

            <th className="px-4 py-4 text-left" style={{ width: "160px" }}>
              Trạng thái / Nhóm
            </th>

            {/* ✅ NEW COLUMN */}
            <th className="px-4 py-4 text-left" style={{ width: "170px" }}>
              Xử lý bởi
            </th>

            <th
              className="px-4 py-4 text-left"
              style={{ width: "auto", minWidth: "250px" }}
            >
              Nội dung yêu cầu
            </th>

            <th className="px-4 py-4 text-left" style={{ width: "320px" }}>
              Phản hồi khách
            </th>

            <th className="px-4 py-4 text-right" style={{ width: "140px" }}>
              Thao tác
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {groupedRows.map((row, idx) => {
            const isQuick = isQuickRequest(row);
            const alreadySentQuick = hasSentQuickRequest(row);
            const shouldShowUrgentBadge =
              row.isPending && isQuick && !alreadySentQuick;

            return (
              <tr
                key={row.complainId}
                className={`group transition-all ${
                  selectedIds.has(row.complainId)
                    ? "bg-blue-50/40"
                    : "hover:bg-gray-50/30"
                }`}
              >
                {/* # + checkbox */}
                <td className="px-4 py-5 align-top text-center">
                  <div className="flex flex-col items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(row.complainId)}
                      onChange={() =>
                        onToggleSelect(row.complainId, row.isPending)
                      }
                      disabled={!row.isPending}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 disabled:opacity-20"
                    />
                    <span className="text-[10px] text-gray-300 font-bold">
                      {idx + 1}
                    </span>
                  </div>
                </td>

                {/* Status / Group / time */}
                <td className="px-4 py-5 align-top">
                  <div className="flex flex-col gap-2">
                    {row.isPending ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase w-fit whitespace-nowrap">
                        <AlertCircle size={12} /> Chờ xử lý
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase w-fit whitespace-nowrap">
                        <CheckCircle size={12} /> Đã xong
                      </span>
                    )}

                    {row.groupCount > 1 && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-fit uppercase whitespace-nowrap">
                        <Users size={10} /> {row.groupCount} yêu cầu
                      </div>
                    )}

                    <div className="text-[11px] text-gray-700 font-medium whitespace-nowrap">
                      {formatDate(row.createData)}
                    </div>
                    <div className="text-[10px] text-gray-400 italic whitespace-nowrap">
                      {getRelativeTime(row.createData)}
                    </div>
                  </div>
                </td>

                {/* ✅ NEW: handledBy */}
                <td className="px-4 py-5 align-top">
                  <div className="flex flex-col gap-2">
                    {renderHandledByCell(row)}
                  </div>
                </td>

                {/* Content */}
                <td className="px-4 py-5 align-top">
                  <div className="flex gap-3">
                    <div className="mt-1 p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:text-blue-500 transition-colors shadow-sm h-fit flex-shrink-0">
                      <MessageSquare size={16} />
                    </div>

                    <div className="flex flex-col gap-2 min-w-0">
                      <p
                        className="text-sm text-gray-700 leading-relaxed font-medium break-words"
                        dangerouslySetInnerHTML={{
                          __html: highlightSearchText(
                            row.feedBack,
                            searchQuery
                          ),
                        }}
                      />

                      {shouldShowUrgentBadge && (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-left-2 duration-300 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-black uppercase whitespace-nowrap">
                            Cần gấp
                          </span>
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase whitespace-nowrap">
                            Phục vụ nhanh
                          </span>
                        </div>
                      )}

                      {row.isPending && alreadySentQuick && (
                        <span className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1 whitespace-nowrap">
                          <Send size={10} /> Đã chuyển
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Response */}
                <td className="px-4 py-5 align-top">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center h-6">
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">
                        Phản hồi
                      </span>
                      {row.isPending && (
                        <ResponsePopover
                          suggestions={responseSuggestions}
                          onSelect={(val) =>
                            onSuggestionPick(row.complainId, val)
                          }
                        />
                      )}
                    </div>

                    <textarea
                      value={responses[row.complainId] || ""}
                      onChange={(e) =>
                        onResponseChange(row.complainId, e.target.value)
                      }
                      disabled={!row.isPending}
                      placeholder={
                        row.isPending ? "Nhập phản hồi..." : "Đã hoàn tất"
                      }
                      className="w-full p-3 text-xs bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 transition-all min-h-[80px] disabled:opacity-50 resize-none shadow-inner"
                    />
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-5 align-top text-right">
                  {row.isPending ? (
                    <button
                      onClick={() =>
                        isQuick
                          ? onSendQuickRequest(row.complainId, row.feedBack)
                          : onSingleCheck(row.complainId)
                      }
                      disabled={isChecking || alreadySentQuick}
                      className={`w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-[11px] transition-all active:scale-95 ${
                        isQuick
                          ? alreadySentQuick
                            ? "bg-gray-100 text-gray-400 border border-gray-200"
                            : "bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
                          : "bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700"
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
                    <div className="py-2.5 px-3 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center gap-2">
                      <CheckCircle size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-gray-300 uppercase whitespace-nowrap">
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
