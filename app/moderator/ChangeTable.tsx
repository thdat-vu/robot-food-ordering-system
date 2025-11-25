import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { getApiUrl } from "@/env.config";
import { TableDetail } from "@/app/moderator/Home";
import { useToastModerator } from "@/hooks/use-toast-moderator";
import {
  useChangeTableApi,
  useGetALlTable,
} from "@/hooks/moderator/useTableHooks";
import { item, messss, Response } from "@/api/moderator/TableApi";
import {
  ArrowRight,
  Table,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const REASON_OPTIONS: string[] = [
  "Khách muốn chỗ yên tĩnh hơn",
  "Khách muốn gần cửa sổ / view đẹp hơn",
  "Khách muốn gần quầy bar / khu vực trung tâm",
  "Bàn hiện tại gặp vấn đề (ghế, bàn, vệ sinh...)",
  "Điều phối lại sơ đồ bàn cho hợp lý",
];

type Props = {
  id: string; // có thể là tableId hoặc lỡ truyền nhầm sessionId -> đã xử lý fallback
  onClose: () => void;
};

export const ChangeTable: React.FC<Props> = ({ id, onClose }) => {
  const { addToast } = useToastModerator();
  const API_BASE = getApiUrl();

  const [tableData, setTableData] = useState<TableDetail | null>(null);
  const [listEmptyTable, setListEmptyTable] = useState<item[]>([]);
  const [reason, setReason] = useState<string>("");
  const [newTable, setNewTable] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTables, setIsFetchingTables] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultSuccess, setResultSuccess] = useState(false);

  const { run: runGetAllTable } = useGetALlTable();
  const { run: runChangeTable } = useChangeTableApi();

  const isReasonValid = reason.trim().length > 0;

  // ✅ Chuẩn hoá status để xử lý chắc
  const normalizeTableStatus = (raw: any) => {
    // hỗ trợ cả số lẫn chữ
    // ví dụ: 0 = available, 1 = occupied (tuỳ backend bạn)
    if (typeof raw === "number") {
      // chỉnh mapping theo backend bạn nếu cần
      if (raw === 0) return "available";
      if (raw === 1) return "occupied";
      return "unknown";
    }

    const s = String(raw ?? "")
      .trim()
      .toLowerCase();
    if (!s) return "unknown";
    if (s.includes("available") || s.includes("empty") || s === "trống")
      return "available";
    if (
      s.includes("occupied") ||
      s.includes("busy") ||
      s.includes("using") ||
      s.includes("có khách")
    )
      return "occupied";
    if (s.includes("reserve") || s.includes("book") || s.includes("đặt"))
      return "reserved";
    return "unknown";
  };

  const fetchTableDetail = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Table/${id}`);
      setTableData(res.data);
    } catch {
      addToast("Không thể tải thông tin bàn", "error");
    }
  };

  const fetchAllTable = async () => {
    try {
      setIsFetchingTables(true);
      const res: Response = await runGetAllTable(1, 200);
      setListEmptyTable(res.items);
    } catch {
      addToast("Không thể tải danh sách bàn", "error");
    } finally {
      setIsFetchingTables(false);
    }
  };

  useEffect(() => {
    fetchTableDetail();
    fetchAllTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ Xác định current table an toàn (fix lỗi không ra màu cam)
  const currentTableId = useMemo(() => {
    const td: any = tableData ?? {};
    // ưu tiên id thật từ tableData (tránh trường hợp prop id là sessionId)
    const realId = td.id ?? td.tableId ?? td.TableId ?? null;
    return String(realId ?? id);
  }, [tableData, id]);

  const currentTableName = useMemo(() => {
    const td: any = tableData ?? {};
    return String(td.name ?? td.tableName ?? "").trim();
  }, [tableData]);

  const openConfirmDialog = () => {
    if (!newTable) return addToast("Vui lòng chọn bàn mới!", "error");
    if (!isReasonValid)
      return addToast("Vui lòng chọn lý do chuyển bàn!", "error");
    setShowConfirmDialog(true);
  };

  const handleChangeTable = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);

    try {
      const res: messss = await runChangeTable(id, newTable, reason.trim());
      if (res.statusCode === 200) {
        setResultSuccess(true);
        setResultMessage(res.message || "Chuyển bàn thành công!");
        setReason("");
        setNewTable("");
        onClose();
      } else {
        setResultSuccess(false);
        setResultMessage(res.message || "Có lỗi xảy ra");
      }
    } catch {
      setResultSuccess(false);
      setResultMessage("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
      setShowResultDialog(true);
    }
  };

  const selectedNewTable = listEmptyTable.find(
    (t) => String(t.id) === String(newTable)
  );

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white/95 rounded-3xl p-12 shadow-2xl flex flex-col items-center gap-5">
            <Loader2 className="w-16 h-16 text-violet-600 animate-spin" />
            <p className="text-2xl font-bold text-gray-800">
              Đang chuyển bàn...
            </p>
            <p className="text-gray-600">Vui lòng chờ một chút</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Chuyển Bàn
            </h1>
            <p className="text-gray-600 mt-3 text-lg">
              Chọn bàn mới và lý do phù hợp
            </p>
          </div>

          {/* Cards */}
          <div className="grid lg:grid-cols-2 gap-10 mb-12">
            {/* Current Table */}
            <div className="group">
              <div className="bg-white/85 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 text-center transition-all hover:shadow-3xl hover:-translate-y-1">
                <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-xl">
                  <Table className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Bàn hiện tại
                </h3>
                <p className="text-5xl font-extrabold text-gray-900">
                  {(tableData as any)?.name ??
                    (tableData as any)?.tableName ??
                    "..."}
                </p>
              </div>
            </div>

            {/* New Table */}
            <div className="group">
              <div
                className={`bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center transition-all hover:-translate-y-1 ${
                  newTable
                    ? "ring-4 ring-emerald-300 shadow-emerald-100"
                    : "border-4 border-dashed border-gray-300"
                }`}
              >
                <div
                  className={`w-28 h-28 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-xl transition-all ${
                    newTable
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                      : "bg-gray-200"
                  }`}
                >
                  {newTable ? (
                    <Table className="w-16 h-16 text-white" />
                  ) : (
                    <div className="text-5xl font-bold text-gray-400">?</div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Bàn mới
                </h3>
                <p className="text-5xl font-extrabold text-gray-900 min-h-20 flex items-center justify-center">
                  {selectedNewTable ? selectedNewTable.name : "Chưa chọn"}
                </p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center -my-6">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5 rounded-full shadow-2xl animate-pulse ring-8 ring-purple-500/30">
              <ArrowRight className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Table List */}
          <div className="mt-16 mb-10">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Chọn bàn trống để chuyển đến
            </h2>

            {/* NOTE màu sắc */}
            <div className="flex items-center justify-center gap-6 mb-6 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow" />
                <span>Trống</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-500 shadow" />
                <span>Có khách</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 shadow" />
                <span>Bàn hiện tại</span>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/40">
              {isFetchingTables ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-14 h-14 text-violet-600 animate-spin" />
                </div>
              ) : listEmptyTable.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <AlertCircle className="w-20 h-20 mx-auto mb-6 opacity-40" />
                  <p className="text-2xl">Hiện không có bàn trống nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {listEmptyTable.map((t: any) => {
                    // ✅ FIX: current table check chắc chắn (id + fallback name)
                    const isCurrent =
                      String(t.id) === currentTableId ||
                      (currentTableName &&
                        String(t.name ?? "").trim() === currentTableName);

                    // ⚠️ Nếu API không có `status`, sửa dòng dưới:
                    // ví dụ dùng t.tableStatus: normalizeTableStatus(t.tableStatus)
                    const statusKey = normalizeTableStatus(t.status);

                    const isAvailable = statusKey === "available";
                    const isBlocked = isCurrent || !isAvailable;
                    const isSelected = String(newTable) === String(t.id);

                    const dotClass = isCurrent
                      ? "bg-orange-500"
                      : !isAvailable
                      ? "bg-gray-500"
                      : "bg-emerald-500";

                    const handlePick = () => {
                      if (isCurrent) {
                        addToast(
                          "Đây là bàn hiện tại, không thể chọn để chuyển.",
                          "warning"
                        );
                        return;
                      }
                      if (!isAvailable) {
                        addToast(
                          "Bàn này đang có khách/không trống, không thể chuyển.",
                          "warning"
                        );
                        return;
                      }
                      setNewTable(String(t.id));
                    };

                    return (
                      <button
                        key={String(t.id)}
                        type="button"
                        aria-disabled={isBlocked || isLoading}
                        onClick={handlePick}
                        className={`relative p-8 rounded-3xl font-bold text-xl transition-all transform shadow-xl
                          ${
                            isSelected && isAvailable
                              ? "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white ring-4 ring-purple-400 hover:scale-110"
                              : "bg-white/95 hover:bg-gray-50 border-2 border-gray-200 hover:border-purple-300 hover:scale-110"
                          }
                          ${
                            // current table: mờ + grayscale + không scale
                            isCurrent
                              ? "opacity-55 grayscale border-gray-300 hover:scale-100 cursor-not-allowed"
                              : ""
                          }
                          ${
                            // occupied/không available: xám + không scale
                            !isCurrent && !isAvailable
                              ? "bg-gray-200/80 text-gray-600 border-gray-300 hover:bg-gray-200 hover:border-gray-300 hover:scale-100 cursor-not-allowed"
                              : ""
                          }
                        `}
                      >
                        {/* chấm màu góc phải */}
                        <span
                          className={`absolute top-3 right-3 w-3 h-3 rounded-full ${dotClass} shadow`}
                        />

                        {t.name}

                        {isSelected && isAvailable && (
                          <CheckCircle2 className="w-8 h-8 inline-block ml-3" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Reason Selection */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Lý do chuyển bàn <span className="text-rose-600">*</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {REASON_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setReason(option)}
                  disabled={isLoading}
                  className={`p-6 rounded-3xl text-left transition-all shadow-lg border-2 ${
                    reason === option
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white border-transparent ring-4 ring-purple-400"
                      : "bg-white/90 border-gray-200 hover:bg-gray-50 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{option}</span>
                    {reason === option && <CheckCircle2 className="w-8 h-8" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <div className="flex justify-center mt-16">
            <button
              onClick={openConfirmDialog}
              disabled={isLoading || !newTable || !isReasonValid}
              className={`px-20 py-6 text-2xl font-bold rounded-full shadow-2xl transition-all transform hover:scale-105 ${
                isLoading || !newTable || !isReasonValid
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 shadow-purple-500/50"
              }`}
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận chuyển bàn"}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Xác nhận chuyển bàn?
            </h2>
            <div className="bg-gray-50 rounded-3xl p-8 space-y-6 mb-8">
              <div className="flex justify-between text-lg">
                <span className="font-medium text-gray-600">Từ bàn:</span>
                <span className="font-bold text-rose-600 text-xl">
                  {(tableData as any)?.name ?? (tableData as any)?.tableName}
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-medium text-gray-600">Sang bàn:</span>
                <span className="font-bold text-emerald-600 text-xl">
                  {selectedNewTable?.name}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Lý do:</span>
                <p className="mt-2 text-gray-800 font-medium bg-white/80 rounded-2xl p-4">
                  {reason}
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-5 bg-gray-200 rounded-3xl font-bold hover:bg-gray-300 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleChangeTable}
                className="flex-1 py-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-3xl font-bold hover:opacity-90 transition shadow-lg"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Dialog */}
      {showResultDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
            <div
              className={`w-28 h-28 mx-auto mb-8 rounded-full flex items-center justify-center ${
                resultSuccess ? "bg-emerald-100" : "bg-rose-100"
              }`}
            >
              {resultSuccess ? (
                <CheckCircle2 className="w-20 h-20 text-emerald-600" />
              ) : (
                <AlertCircle className="w-20 h-20 text-rose-600" />
              )}
            </div>
            <h2
              className={`text-4xl font-extrabold mb-6 ${
                resultSuccess ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {resultSuccess ? "Thành công!" : "Thất bại!"}
            </h2>
            <p className="text-gray-700 text-xl mb-10">{resultMessage}</p>
            <button
              onClick={() => setShowResultDialog(false)}
              className="px-16 py-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xl font-bold rounded-full hover:opacity-90 transition shadow-xl"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};
