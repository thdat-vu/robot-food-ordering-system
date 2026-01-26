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

  const today = new Date().toLocaleDateString("sv-SE");

  const [startDate, setStartDateState] = useState<string>(`${today}T00:00`);
  const [endDate, setEndDateState] = useState<string>(`${today}T23:59`);

  const setStartDate = (date: string) => {
    const dateOnly = date.split("T")[0];
    const finalDate = dateOnly > today ? `${today}T00:00` : date;
    setStartDateState(finalDate);
    if (endDate && finalDate > endDate) {
      setEndDateState(finalDate.split("T")[0] + "T23:59");
    }
  };

  const setEndDate = (date: string) => {
    const dateOnly = date.split("T")[0];
    const finalDate = dateOnly > today ? `${today}T23:59` : date;
    setEndDateState(finalDate);
    if (startDate && finalDate < startDate) {
      setStartDateState(finalDate.split("T")[0] + "T00:00");
    }
  };

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

  const parseDateTime = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;

    // Handle DD/MM/YYYY HH:mm:ss
    const match = dateStr.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})$/
    );
    if (match) {
      const [, day, month, year, hour, minute, second] = match;
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
      );
    }

    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const q = (searchTerm ?? "").trim().toLowerCase();

  const filteredSessions = sessions.filter((session: Session) => {
    // Text filter
    const matchesText =
      q.length === 0 ||
      (session.customerName ?? "").toLowerCase().includes(q) ||
      (session.phoneNumber ?? "").includes(searchTerm ?? "") ||
      String(session.sessionCode ?? "").toLowerCase().includes(q);

    if (!matchesText) return false;

    // Time filter
    const sessionCheckIn = parseDateTime(session.checkIn);
    const sessionCheckOut = parseDateTime(session.checkOut);

    const filterStart = startDate ? new Date(startDate) : null;
    const filterEnd = endDate ? new Date(endDate) : null;

    if (filterStart) {
      // Session matches if it was active after filterStart
      // Either started after filterStart, OR ended after filterStart
      const startedAfter = sessionCheckIn && sessionCheckIn >= filterStart;
      const endedAfter = sessionCheckOut && sessionCheckOut >= filterStart;
      const isActive = !sessionCheckOut && sessionCheckIn && sessionCheckIn >= filterStart; // simplified

      if (!startedAfter && !endedAfter && !isActive) return false;
    }

    if (filterEnd) {
      // Session matches if it was active before filterEnd
      const startedBefore = sessionCheckIn && sessionCheckIn <= filterEnd;
      // If it started before end, it's potentially relevant
      if (!startedBefore) return false;
    }

    return true;
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
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 border-r-0 md:border-r border-gray-100 pr-0 md:pr-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tìm kiếm</label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Tên, SĐT, Mã phiên..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Khoảng thời gian (Check-in)</label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500" size={16} />
                      <input
                        type="datetime-local"
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition-all text-sm"
                        value={startDate}
                        max={`${today}T23:59`}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <span className="text-gray-400 font-bold">~</span>
                    <div className="relative w-full">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" size={16} />
                      <input
                        type="datetime-local"
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none transition-all text-sm"
                        value={endDate}
                        max={`${today}T23:59`}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    {startDate && endDate && (
                      <button
                        onClick={() => {
                          setStartDateState(`${today}T00:00`);
                          setEndDateState(`${today}T23:59`);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Đặt lại về hôm nay"
                      >
                        <Loader2 size={18} className="rotate-45" />
                      </button>
                    )}
                  </div>
                </div>
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
