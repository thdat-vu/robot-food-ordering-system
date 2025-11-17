import React, { useEffect, useState } from "react";
import axios from "axios";
import { getApiUrl } from "@/env.config";
import { TableDetail } from "@/app/moderator/Home";
import { useToastModerator } from "@/hooks/use-toast-moderator";
import {
  useChangeTableApi,
  useGetALlTable,
} from "@/hooks/moderator/useTableHooks";
import { item, messss, Response } from "@/api/moderator/TableApi";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  onClose: () => void;
};

export const ChangeTable: React.FC<Props> = ({ id, onClose }) => {
  const { addToast } = useToastModerator();
  const API_BASE = getApiUrl();

  const [tableData, setTableData] = useState<TableDetail | null>(null);
  const [listEmptyTable, setListEmptyTable] = useState<item[]>([]);
  const [reason, setReason] = useState("");
  const [newTable, setNewTable] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTables, setIsFetchingTables] = useState(true);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultSuccess, setResultSuccess] = useState(false);

  const { run: runGetAllTable } = useGetALlTable();
  const { run: runChangeTable } = useChangeTableApi();
  const router = useRouter();

  // 🔹 Validate reason
  const trimmedReason = reason.trim();
  const reasonLength = trimmedReason.length;

  const isReasonEmpty = reasonLength === 0;
  const isReasonTooShort = reasonLength > 0 && reasonLength < 5;
  const isReasonTooLong = reasonLength > 500; // phòng trường hợp input khác không dùng maxLength
  const isReasonValid =
    reasonLength >= 5 && reasonLength <= 500 && !isReasonTooLong;

  // Lấy thông tin bàn hiện tại
  const fetchTableDetail = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Table/${id}`);
      setTableData(res.data);
    } catch {
      addToast("Không thể tải thông tin bàn", "error");
    }
  };

  // Lấy danh sách bàn trống
  const fetchEmptyTable = async () => {
    try {
      setIsFetchingTables(true);
      const res: Response = await runGetAllTable(1, 200);

      // chỉ lấy bàn AVAILABLE và khác bàn hiện tại
      const empty = res.items.filter(
        (t) => t.status === "Available" && t.id !== id
      );
      setListEmptyTable(empty);
    } catch {
      addToast("Không thể tải danh sách bàn", "error");
    } finally {
      setIsFetchingTables(false);
    }
  };

  useEffect(() => {
    fetchTableDetail();
    fetchEmptyTable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Mở dialog xác nhận
  const openConfirmDialog = () => {
    if (!newTable) {
      addToast("Vui lòng chọn bàn mới!", "error");
      return;
    }

    if (isReasonEmpty) {
      addToast("Vui lòng nhập lý do chuyển bàn!", "error");
      return;
    }

    if (isReasonTooShort) {
      addToast("Lý do phải ít nhất 5 ký tự!", "error");
      return;
    }

    if (isReasonTooLong) {
      addToast("Lý do không được vượt quá 500 ký tự!", "error");
      return;
    }

    setShowConfirmDialog(true);
  };

  // Xử lý đổi bàn
  const handleChangeTable = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);

    try {
      const res: messss = await runChangeTable(id, newTable, trimmedReason);

      if (res.statusCode === 200) {
        setResultSuccess(true);
        setResultMessage(res.message);
        setReason("");
        setNewTable("");
        onClose();
        fetchTableDetail();
        fetchEmptyTable();
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

  // Helper text cho ô reason
  const getReasonHelperText = () => {
    if (isReasonEmpty) {
      return "Vui lòng nhập lý do chuyển bàn.";
    }
    if (isReasonTooShort) {
      return "Lý do phải ít nhất 5 ký tự.";
    }
    if (isReasonTooLong) {
      return "Lý do không được vượt quá 500 ký tự.";
    }
    return "Lý do hợp lệ.";
  };

  const isReasonError = isReasonEmpty || isReasonTooShort || isReasonTooLong;

  return (
    <div className="w-full h-full bg-gray-50 py-8 px-5 relative">
      <h1 className="text-2xl font-bold text-center mb-10">Chuyển Bàn</h1>

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg font-semibold text-gray-700">
              Đang xử lý đổi bàn...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        </div>
      )}

      {/* MAIN UI */}
      <div className="flex items-center justify-center gap-14">
        {/* Bàn hiện tại */}
        <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-2xl shadow flex items-center justify-center text-xl font-semibold">
          {tableData?.name ?? "Đang tải..."}
        </div>

        <div className="text-5xl font-extrabold opacity-60">➡️</div>

        {/* Danh sách bàn trống */}
        <div className="w-64 h-64 bg-white border-2 border-gray-300 rounded-2xl shadow p-4 overflow-y-auto">
          {isFetchingTables ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-500 text-sm">Đang tải danh sách bàn...</p>
            </div>
          ) : listEmptyTable.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Không có bàn trống
            </div>
          ) : (
            <ul className="space-y-2">
              {listEmptyTable.map((t) => (
                <li
                  key={t.id}
                  onClick={() => setNewTable(t.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    newTable === t.id
                      ? "bg-blue-500 text-white border-blue-600 shadow-md"
                      : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {t.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Reason */}
      <div className="mt-12 flex flex-col items-center">
        <input
          type="text"
          placeholder="Lý do chuyển bàn..."
          value={reason}
          maxLength={500}
          onChange={(e) => setReason(e.target.value)}
          disabled={isLoading}
          className={`w-3/4 p-4 text-lg border-2 rounded-xl shadow focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            isReasonError && reasonLength > 0
              ? "border-red-400"
              : "border-gray-300"
          }`}
        />

        <div className="mt-2 w-3/4 flex items-center justify-between text-sm">
          <span
            className={
              isReasonError ? "text-red-600 font-medium" : "text-gray-500"
            }
          >
            {getReasonHelperText()}
          </span>
          <span
            className={
              reasonLength > 500
                ? "text-red-600 font-semibold"
                : "text-gray-500"
            }
          >
            {reasonLength}/500
          </span>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={openConfirmDialog}
          disabled={isLoading || !newTable || !isReasonValid}
          className={`px-10 py-3 text-lg font-semibold rounded-2xl border-2 shadow transition-all ${
            isLoading || !newTable || !isReasonValid
              ? "bg-gray-300 text-gray-700 border-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white border-blue-600 hover:bg-blue-600 hover:shadow-lg"
          }`}
        >
          {isLoading ? "Đang xử lý..." : "Xác nhận chuyển bàn"}
        </button>
      </div>

      {/* CONFIRM DIALOG */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-96 p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Xác nhận đổi bàn?
            </h2>

            <div className="space-y-3 mb-6 text-left bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <span className="font-semibold">Từ bàn:</span> {tableData?.name}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Sang bàn:</span>{" "}
                {listEmptyTable.find((t) => t.id === newTable)?.name}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Lý do:</span> {trimmedReason}
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-semibold transition"
              >
                Hủy
              </button>

              <button
                onClick={handleChangeTable}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULT DIALOG */}
      {showResultDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-96 p-6 rounded-2xl shadow-lg text-center">
            <div className="mb-4">
              {resultSuccess ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
            </div>

            <h2
              className={`text-xl font-bold mb-4 ${
                resultSuccess ? "text-green-600" : "text-red-600"
              }`}
            >
              {resultSuccess ? "Thành công!" : "Thất bại!"}
            </h2>

            <p className="text-gray-700 mb-6">{resultMessage}</p>

            <button
              onClick={() => setShowResultDialog(false)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
