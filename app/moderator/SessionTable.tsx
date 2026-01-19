import { useEffect, useState } from "react";
import { tableService } from "@/service/moderator/TableService";
import { Calendar, Eye, FileText, Loader2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import TableActivityTracker from "./TableActivityTracker";
import ActivityDialog from "./ActivityDialog";
import CompleteBillComponent from "@/components/moderator/CompleteBillComponent";

export const SessionTable: React.FC<SessionTableProps> = ({ idTable }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activityOpen, setActivityOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );

  const [revealedPhoneIds, setRevealedPhoneIds] = useState<Set<string>>(
    new Set()
  );
  const [pendingRevealId, setPendingRevealId] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Fetch sessions data from API
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await tableService.getSessionsByTableId(idTable, {
          pageNumber: currentPage,
          pageSize: pageSize,
        });

        setSessions(response.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
        // Use sample data as fallback for demo
      } finally {
        setLoading(false);
      }
    };

    if (idTable) {
      fetchSessions();
    }
  }, [idTable, currentPage, pageSize]);

  const maskLast5 = (phone?: string | null) => {
    const p = String(phone ?? "");
    if (!p) return "-";
    if (p.length <= 5) return "•".repeat(p.length);
    return p.slice(0, -5) + "•".repeat(5); // che 5 số cuối
  };

  const revealPhone = (sessionId: string) => {
    setRevealedPhoneIds((prev) => {
      const next = new Set(prev);
      next.add(sessionId);
      return next;
    });
  };

  const q = (searchTerm ?? "").trim().toLowerCase();

  const filteredSessions =
    q.length === 0
      ? sessions
      : sessions.filter((session: Session) => {
          const name = (session.customerName ?? "").toLowerCase();
          const phone = session.phoneNumber ?? ""; // giữ nguyên vì phone thường là số/ký tự
          const sessionCode = String(session.sessionCode ?? "").toLowerCase();

          return (
            name.includes(q) ||
            phone.includes(searchTerm ?? "") || // hoặc phone.includes(q) nếu bạn muốn normalize luôn
            sessionCode.includes(q)
          );
        });

  const handleViewActivity = async (session: Session): Promise<void> => {
    try {
      setLoading(true);
      const activity = await tableService.getActivitiesBySessionId(session.id);
      setSelectedSession(session);
      setActivityOpen(true);
    } catch (error) {
      alert("Không thể tải hoạt động. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (session: Session) => {
    try {
      // ✅ nếu session chưa có invoiceId thì chặn luôn
      if (!session.invoiceId) {
        alert("Session này chưa có hóa đơn.");
        return;
      }

      setSelectedInvoiceId(session.invoiceId);
      setInvoiceOpen(true);
    } catch (e) {
      alert("Không thể mở hóa đơn. Vui lòng thử lại!");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-gray-800">Quản Lý Phiên</h1>
            {idTable && (
              <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-lg">
                {sessions[0]?.tableName}
              </span>
            )}
          </div>
          <p className="text-gray-600">
            Theo dõi và quản lý các phiên hoạt động của khách hàng
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-700">
                <p className="font-semibold">Lỗi khi tải dữ liệu</p>
                <p className="text-sm">{error} - Đang hiển thị dữ liệu mẫu</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2
              className="animate-spin mx-auto mb-4 text-indigo-600"
              size={48}
            />
            <p className="text-gray-600 text-lg">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, số điện thoại hoặc mã phiên..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Mã Phiên
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          Check In
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          Check Out
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Tên Khách Hàng
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Số Điện Thoại
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold">
                        Hành Động
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session, index) => (
                      <tr
                        key={session.id}
                        className={`border-b border-gray-100 hover:bg-indigo-50 transition-colors ${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-indigo-600">
                            {session.sessionCode || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {session.checkIn}
                        </td>
                        <td className="px-6 py-4">
                          {session.checkOut ? (
                            <span className="text-gray-700">
                              {session.checkOut}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Đang hoạt động
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {session.customerName}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 text-gray-700 select-none cursor-pointer"
                          title="Bấm 2 lần để hiện số"
                          onDoubleClick={() => revealPhone(session.id)} // ✅ desktop: double click
                          onClick={() => {
                            // ✅ mobile: bấm 2 lần liên tiếp
                            if (revealedPhoneIds.has(session.id)) return;

                            if (pendingRevealId === session.id) {
                              revealPhone(session.id);
                              setPendingRevealId(null);
                              return;
                            }

                            setPendingRevealId(session.id);
                            window.setTimeout(() => {
                              setPendingRevealId((cur) =>
                                cur === session.id ? null : cur
                              );
                            }, 1200);
                          }}
                        >
                          {revealedPhoneIds.has(session.id)
                            ? session.phoneNumber ?? "-"
                            : maskLast5(session.phoneNumber)}
                          {!revealedPhoneIds.has(session.id) &&
                            pendingRevealId === session.id && (
                              <span className="ml-2 text-xs text-indigo-600">
                                (bấm lần nữa)
                              </span>
                            )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewActivity(session)}
                              className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                              title="Xem hoạt động"
                            >
                              <Eye size={16} />
                              <span className="text-sm font-medium">
                                Hoạt động
                              </span>
                            </button>

                            {session.hasInvoice && session.invoiceId && (
                              <button
                                onClick={() => handleViewInvoice(session)}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                                title="Xem hóa đơn"
                              >
                                <FileText size={16} />
                                <span className="text-sm font-medium">
                                  Hóa đơn
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredSessions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {sessions.length === 0
                      ? "Chưa có phiên nào cho bàn này"
                      : "Không tìm thấy phiên nào phù hợp"}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Hiển thị{" "}
                    <span className="font-semibold text-indigo-600">
                      {filteredSessions.length}
                    </span>{" "}
                    / <span className="font-semibold">{totalRecords}</span>{" "}
                    phiên
                  </p>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Trước
                      </button>
                      <span className="text-sm text-gray-600">
                        Trang {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Sau
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <ActivityDialog
              open={activityOpen}
              onOpenChange={setActivityOpen}
              tableId={idTable}
              tableName={
                sessions.find((session) => session.id === selectedSession?.id)
                  ?.tableName || ""
              }
              sessionId={selectedSession?.id || null}
              sessionCode={selectedSession?.sessionCode || null}
              customerName={selectedSession?.customerName || null}
            />

            {invoiceOpen && selectedInvoiceId && (
              <div className="fixed inset-0 z-50">
                {/* overlay */}
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setInvoiceOpen(false)}
                />

                {/* modal */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="relative w-full max-w-3xl max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl">
                    <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                      <div className="font-semibold">Hóa đơn</div>
                      <button
                        onClick={() => setInvoiceOpen(false)}
                        className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200"
                      >
                        Đóng
                      </button>
                    </div>

                    <div className="p-4">
                      <CompleteBillComponent invoiceId={selectedInvoiceId} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
